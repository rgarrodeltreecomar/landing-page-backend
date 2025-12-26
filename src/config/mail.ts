import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
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
    to,
    bcc: `${process.env.EMAI_USER_DEV1 || ""}${process.env.EMAI_USER_DEV2 ? ", " + process.env.EMAI_USER_DEV2 : ""}`,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};