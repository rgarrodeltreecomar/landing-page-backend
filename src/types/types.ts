export interface EmailData {
  nombre: string;
  apellido: string;
  empresa?: string;
  email: string;
  mensaje: string;
}

export interface OTPEmailData {
  otp: string;
  minutes: number;
}

export interface OTPRequest {
  email: string;
  minutes?: number;
  purpose?: 'login' | 'reset_password' | string;
}

export interface OTPVerify {
  email: string;
  code: string;
  purpose?: 'login' | 'reset_password' | string;
}