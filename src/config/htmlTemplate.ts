import { EmailData } from "../types/types";

export const htmlTemplate = (data: EmailData): string => {
    return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              margin: 0;
              padding: 20px;
            }
            .email-container {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              max-width: 600px;
              margin: 0 auto;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .email-header {
              font-size: 24px;
              color: #4460AA;
              margin-bottom: 20px;
            }
            .email-body {
              font-size: 16px;
              line-height: 1.6;
            }
            .email-footer {
              margin-top: 20px;
              font-size: 14px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              Nuevo mensaje de contacto
            </div>
            <div class="email-body">
              <p><strong>Nombre:</strong> ${data.nombre} ${data.apellido}</p>
              <p><strong>Empresa:</strong> ${data.empresa || "No especificada"}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Mensaje:</strong> ${data.mensaje}</p>
            </div>
            <div class="email-footer">
              <p>Este es un mensaje automático, por favor no responder directamente a este correo.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };