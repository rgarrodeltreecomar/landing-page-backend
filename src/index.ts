import express, { Response, Request } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { htmlTemplate } from "./config/htmlTemplate";
import { sendEmail } from "./config/mail";
import { OTPRequest, OTPVerify } from "./types/types";
import { supabase } from "./lib/supabase";
import { swaggerSpec } from "./config/swagger";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const rawAllowed = process.env.ALLOWED_ORIGINS || "http://localhost:5173,https://group-nine-landing-page.vercel.app";
const allowedOrigins = rawAllowed.split(",").map((s) => s.trim()).filter(Boolean);

// Configuración CORS: permite requests sin origin (curl, Swagger UI, etc.)
app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requests sin origin (curl, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }
      // Permite orígenes en la lista blanca
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Rechaza otros orígenes
      return callback(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

function generateOTP(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
}

/**
 * @swagger
 * /request-otp:
 *   post:
 *     summary: Solicita un código OTP por email
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPRequest'
 *     responses:
 *       200:
 *         description: Código OTP generado y enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OTPResponse'
 *             example:
 *               message: "OTP enviado"
 *               expiresAt: "2024-01-01T12:10:00.000Z"
 *       400:
 *         description: Error en la solicitud (falta el campo email)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Falta el campo 'email'"
 *       500:
 *         description: Error al generar o enviar el código OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Error al guardar OTP"
 */
app.post("/request-otp", async (req: Request, res: Response) => {
  const body = req.body as OTPRequest;
  const email = body?.email;
  const minutes = body?.minutes && Number(body.minutes) > 0 ? Number(body.minutes) : 10;
  const purpose = body?.purpose || 'login';

  if (!email) return res.status(400).json({ message: "Falta el campo 'email'" });

  try {
    const code = generateOTP(6);
    const expiresAtIso = new Date(Date.now() + minutes * 60 * 1000).toISOString();

    // Insert into Supabase table `otp_codes`
    const { data: insertData, error: insertError } = await supabase.from('otp_codes').insert({
      email,
      code,
      purpose,
      expires_at: expiresAtIso,
    }).select();

    console.log('SUPABASE INSERT -> insertData:', insertData, 'insertError:', insertError);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return res.status(500).json({ message: 'Error al guardar OTP' });
    }

    const html = htmlTemplate({ otp: code, minutes });

    await sendEmail(email, `Tu código de verificación (${minutes} min)`, html);

    return res.status(200).json({ message: "OTP enviado", expiresAt: expiresAtIso });
  } catch (error) {
    console.error("Error al generar/enviar OTP:", error);
    return res.status(500).json({ message: "Error al enviar OTP" });
  }
});

/**
 * @swagger
 * /debug/otps/{email}:
 *   get:
 *     summary: DEBUG - Obtiene los códigos OTP para un email específico
 *     tags: [Debug]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Dirección de correo electrónico
 *         example: usuario@ejemplo.com
 *     responses:
 *       200:
 *         description: Lista de códigos OTP para el email especificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DebugOTPResponse'
 *       500:
 *         description: Error al consultar los códigos OTP
 */
app.get('/debug/otps/:email', async (req: Request, res: Response) => {
  const email = req.params.email;
  try {
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(5);
    return res.json({ data, error, email });
  } catch (err) {
    return res.status(500).json({ error: err, email });
  }
});

/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Verifica un código OTP
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPVerify'
 *     responses:
 *       200:
 *         description: Código OTP verificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OTPVerifyResponse'
 *             example:
 *               valid: true
 *               message: "OTP verificado"
 *       400:
 *         description: Error en la solicitud (código inválido, expirado o ya usado)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 value:
 *                   message: "Faltan 'email' o 'code'"
 *               invalidOTP:
 *                 value:
 *                   valid: false
 *                   message: "No existe OTP válido"
 *               invalidCode:
 *                 value:
 *                   valid: false
 *                   message: "Código inválido"
 *       500:
 *         description: Error al verificar el código OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               valid: false
 *               message: "Error al verificar OTP"
 */
app.post('/verify-otp', async (req: Request, res: Response) => {
  const body = req.body as OTPVerify;
  const email = body?.email;
  const code = body?.code;
  const purpose = body?.purpose || 'login';

  if (!email || !code) return res.status(400).json({ message: "Faltan 'email' o 'code'" });

  try {
    // get latest unused non-expired otp for email + purpose
    const nowIso = new Date().toISOString();
    console.log('VERIFY QUERY -> email:', email, 'purpose:', purpose, 'code:', code, 'nowIso:', nowIso);
    
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('purpose', purpose)
      .eq('used', false)
      .gt('expires_at', nowIso)
      .order('created_at', { ascending: false })
      .limit(1);

    console.log('SUPABASE SELECT -> data:', data ? JSON.stringify(data, null, 2) : null, 'error:', error);

    if (error) {
      console.error('Supabase select error:', error);
      return res.status(500).json({ valid: false, message: 'Error al verificar OTP' });
    }

    if (!data || data.length === 0) {
      console.log('No OTP found - data is empty or null');
      return res.status(400).json({ valid: false, message: 'No existe OTP válido' });
    }

    const row: any = data[0];
    if (row.code !== code) {
      return res.status(400).json({ valid: false, message: 'Código inválido' });
    }

    // Mark as used
    const { error: updateErr } = await supabase.from('otp_codes').update({ used: true }).eq('id', row.id);
    if (updateErr) {
      console.error('Supabase update error:', updateErr);
    }

    return res.status(200).json({ valid: true, message: 'OTP verificado' });
  } catch (err) {
    console.error('Error verifying OTP', err);
    return res.status(500).json({ valid: false, message: 'Error al verificar OTP' });
  }
});



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
});