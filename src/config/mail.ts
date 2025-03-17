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
    service: "gmail", 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: process.env.EMAIL_USER, 
    bcc: `${process.env.EMAI_USER_DEV1}, ${process.env.EMAI_USER_DEV2}`,
    subject: `Nuevo para grupo 9: ${data.nombre} ${data.apellido}`, 
    text: `
      Nombre: ${data.nombre} ${data.apellido}
      Empresa: ${data.empresa || "No especificada"}
      Email: ${data.email}
      Mensaje: ${data.mensaje}
    `,
  };

  await transporter.sendMail(mailOptions);
};