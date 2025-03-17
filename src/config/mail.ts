import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface EmailData {
  nombre: string;
  apellido: string;
  empresa?: string;
  email: string;
  mensaje: string;
}

export const sendEmail = async (data: EmailData): Promise<void> => {
  
  const transporter = nodemailer.createTransport({
    service: "gmail", // Usar el servicio de Gmail
    auth: {
      user: process.env.EMAIL_USER, // Tu correo de Gmail
      pass: process.env.EMAIL_PASS, // Tu contraseña de aplicación
    },
    tls: {
      rejectUnauthorized: false, // Ignora la verificación del certificado (solo para desarrollo)
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: process.env.EMAIL_USER, 
    subject: `Nuevo mensaje de ${data.nombre} ${data.apellido}`, 
    text: `
      Nombre: ${data.nombre} ${data.apellido}
      Empresa: ${data.empresa || "No especificada"}
      Email: ${data.email}
      Mensaje: ${data.mensaje}
    `,
  };

  await transporter.sendMail(mailOptions);
};