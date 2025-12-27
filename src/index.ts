import express, { Response, Request } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { htmlTemplate } from "./config/htmlTemplate";
import { sendEmail } from "./config/mail";
import { OTPRequest, OTPVerify } from "./types/types";
import { supabase } from "./lib/supabase";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const rawAllowed = process.env.ALLOWED_ORIGINS || "http://localhost:5173,https://group-nine-landing-page.vercel.app";
const allowedOrigins = rawAllowed.split(",").map((s) => s.trim()).filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Origen no permitido por CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

function generateOTP(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
}

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
    const { error: insertError } = await supabase.from('otp_codes').insert({
      email,
      code,
      purpose,
      expires_at: expiresAtIso,
    });

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

app.post('/verify-otp', async (req: Request, res: Response) => {
  const body = req.body as OTPVerify;
  const email = body?.email;
  const code = body?.code;
  const purpose = body?.purpose || 'login';

  if (!email || !code) return res.status(400).json({ message: "Faltan 'email' o 'code'" });

  try {
    // get latest unused non-expired otp for email + purpose
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('purpose', purpose)
      .eq('used', false)
      .gt('expires_at', nowIso)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase select error:', error);
      return res.status(500).json({ valid: false, message: 'Error al verificar OTP' });
    }

    if (!data || data.length === 0) {
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
});