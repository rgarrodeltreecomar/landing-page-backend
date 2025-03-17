import express ,{ Response, Request } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sendEmail } from "./config";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ["http://localhost:5173", "https://group-nine-landing-page.vercel.app"];

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


app.post("/send-email", async (req: Request, res: Response) => {
  const { nombre, apellido, empresa, email, mensaje } = req.body;

  try {
    await sendEmail({ nombre, apellido, empresa, email, mensaje });
    res.status(200).json({ message: "Correo enviado con éxito" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ message: "Error al enviar el correo" });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});