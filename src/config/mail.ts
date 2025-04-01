import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { htmlTemplate } from "./htmlTemplate";
import { EmailData } from "../types/types";


dotenv.config();



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
    subject: `Nuevo mensaje de contacto: ${data.nombre} ${data.apellido}`,
    html: htmlTemplate(data),
  };

  await transporter.sendMail(mailOptions);
};