import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    bcc: process.env.DEV_BCC,
    subject,
    html,
  });
};
