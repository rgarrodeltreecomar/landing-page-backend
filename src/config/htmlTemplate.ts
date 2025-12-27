import { OTPEmailData } from "../types/types";

export const htmlTemplate = (data: OTPEmailData): string => {
  const { otp, minutes } = data;
  return `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 16px; background-color: #f4f7fc; padding: 0; margin: 0">
    <div style="max-width: 600px; margin: auto; padding: 24px; background-color: #ffffff">
      
      <!-- Logo -->
      <div style="margin-bottom: 24px">
        <a href="https://www.deltree.com.ar/images/logo-2.png" target="_blank" style="text-decoration: none; outline: none">
          <img
            src="cid:logo.png"
            alt="Deltree SAS"
            height="32"
            style="height: 32px; vertical-align: middle"
          />
        </a>
      </div>

      <!-- Title -->
      <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1f2a44">
        Verificación de identidad
      </h2>

      <!-- Intro -->
      <p style="margin: 0 0 16px 0; color: #2e2e2e">
        Se solicitó un código de verificación para acceder a tu cuenta en
        <strong>Deltree SAS</strong>.
      </p>

      <!-- OTP Code -->
      <div
        style="
          margin: 24px 0;
          padding: 16px;
          background-color: #f4f7fc;
          border: 1px solid #1f2a44;
          text-align: center;
          border-radius: 6px;
        "
      >
        <span
          style="
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 6px;
            color: #1f2a44;
          "
        >
          ${otp}
        </span>
      </div>

      <!-- Expiration -->
      <p style="margin: 0 0 16px 0; color: #2e2e2e">
        Este código es válido por <strong>${minutes} minutos</strong>.
        Por motivos de seguridad, no lo compartas con terceros.
      </p>

      <!-- Ignore notice -->
      <p style="margin: 0 0 16px 0; color: #2e2e2e">
        Si no realizaste esta solicitud, podés ignorar este mensaje.
      </p>

      <!-- Support -->
      <p style="margin: 0 0 24px 0; color: #2e2e2e">
        Ante cualquier inconveniente, comunicate con nuestro equipo de soporte:
        <a
          href="mailto:[Company Email]"
          style="text-decoration: none; color: #1f2a44; font-weight: 500"
        >
          [Company Email]
        </a>
      </p>

      <!-- Footer -->
      <p style="margin: 0; color: #5f6b7a; font-size: 14px">
        Atentamente,<br />
        <strong>Equipo Deltree SAS</strong>
      </p>

    </div>
  </div>
  `;
};