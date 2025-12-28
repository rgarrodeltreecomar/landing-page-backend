
import dotenv from "dotenv";
dotenv.config(); // <-- cargar envs antes de leerlas

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
// Limpiar comillas dobles si existen (dotenv puede incluirlas si están en el .env)
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (serviceRoleKey) {
  serviceRoleKey = serviceRoleKey.replace(/^["']|["']$/g, '');
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error("ERROR: Variables de entorno faltantes:");
  console.error("SUPABASE_URL:", supabaseUrl ? "✓ presente" : "✗ faltante");
  console.error("SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? "✓ presente" : "✗ faltante");
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in env");
}

console.log("Supabase client initializing...");
console.log("Supabase URL:", supabaseUrl);
console.log("Service role key present?:", !!serviceRoleKey);
console.log("Service role key length:", serviceRoleKey?.length || 0);
console.log("Service role key starts with 'eyJ':", serviceRoleKey?.startsWith('eyJ') || false);

// IMPORTANTE: Crear cliente con service_role_key que ignora RLS
// La service_role_key debe empezar con 'eyJ' y tener aprox 200+ caracteres
if (serviceRoleKey && !serviceRoleKey.startsWith('eyJ')) {
  console.warn("WARNING: Service role key no parece ser un JWT válido (debería empezar con 'eyJ')");
}

// Verificar que NO esté usando la anon key por error
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (anonKey && serviceRoleKey === anonKey) {
  console.error("ERROR CRÍTICO: Estás usando la ANON KEY en lugar de SERVICE_ROLE_KEY!");
  throw new Error("SUPABASE_SERVICE_ROLE_KEY no debe ser igual a NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Decodificar el JWT para verificar el rol (solo para logging/debug)
try {
  const jwtParts = serviceRoleKey.split('.');
  if (jwtParts.length === 3) {
    // Decodificar el payload del JWT (base64url)
    let payloadBase64 = jwtParts[1];
    // Agregar padding si es necesario
    while (payloadBase64.length % 4) {
      payloadBase64 += '=';
    }
    payloadBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    console.log("JWT payload completo:", JSON.stringify(payload, null, 2));
    
    // Verificar el rol (puede ser 'role' o si hay typo 'rose')
    const role = payload.role || payload.rose;
    console.log("JWT payload role (o rose):", role);
    
    if (role !== 'service_role') {
      console.error("ERROR CRÍTICO: El JWT no tiene role='service_role'");
      console.error("Payload completo:", JSON.stringify(payload, null, 2));
      console.error("Esto indica que la SERVICE_ROLE_KEY es incorrecta o está corrupta");
      // No lanzamos error aquí, solo logueamos, para que el servidor pueda iniciar
      // pero el usuario sabrá que hay un problema
    } else {
      console.log("✓ JWT tiene role='service_role' - correcto");
    }
  }
} catch (e) {
  console.warn("No se pudo decodificar el JWT para verificar el rol:", e);
}

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { 
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'landing-page-backend',
    },
  },
});

export default supabase;
