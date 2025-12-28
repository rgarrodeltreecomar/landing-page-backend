import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Landing Page Backend API',
      version: '1.0.0',
      description: 'API para gestión de códigos OTP y verificación de identidad',
      contact: {
        name: 'Deltree SAS',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      schemas: {
        OTPRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Dirección de correo electrónico del usuario',
              example: 'usuario@ejemplo.com',
            },
            minutes: {
              type: 'integer',
              description: 'Tiempo de expiración del código en minutos (por defecto: 10)',
              example: 10,
              minimum: 1,
            },
            purpose: {
              type: 'string',
              enum: ['login', 'reset_password'],
              description: 'Propósito del código OTP',
              default: 'login',
              example: 'login',
            },
          },
        },
        OTPVerify: {
          type: 'object',
          required: ['email', 'code'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Dirección de correo electrónico del usuario',
              example: 'usuario@ejemplo.com',
            },
            code: {
              type: 'string',
              description: 'Código OTP de 6 dígitos',
              example: '123456',
              pattern: '^[0-9]{6}$',
            },
            purpose: {
              type: 'string',
              enum: ['login', 'reset_password'],
              description: 'Propósito del código OTP',
              default: 'login',
              example: 'login',
            },
          },
        },
        OTPResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'OTP enviado',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de expiración del código OTP',
              example: '2024-01-01T12:00:00.000Z',
            },
          },
        },
        OTPVerifyResponse: {
          type: 'object',
          properties: {
            valid: {
              type: 'boolean',
              description: 'Indica si el código OTP es válido',
              example: true,
            },
            message: {
              type: 'string',
              example: 'OTP verificado',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Error al procesar la solicitud',
            },
            valid: {
              type: 'boolean',
              description: 'Solo presente en respuestas de verificación',
              example: false,
            },
          },
        },
        DebugOTPResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
              },
              description: 'Lista de códigos OTP para el email especificado',
            },
            error: {
              type: 'object',
              nullable: true,
              description: 'Error si ocurrió alguno',
            },
            email: {
              type: 'string',
              description: 'Email consultado',
            },
          },
        },
      },
    },
  },
  apis: [
    './src/index.ts',      // Para desarrollo (ts-node)
    './dist/index.js',     // Para producción (compilado)
  ], // Ruta a los archivos que contienen las anotaciones
};

export const swaggerSpec = swaggerJsdoc(options);

