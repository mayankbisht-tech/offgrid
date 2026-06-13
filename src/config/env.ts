/**
 * Centralised environment variable validation.
 * Import from here instead of using process.env directly.
 *
 * Server env — never exposed to the browser bundle.
 * Client env — NEXT_PUBLIC_ / public vars safe for the frontend.
 */

// ─── Server-side env ──────────────────────────────────────────────────────────
function requireServerEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[env] Missing required server environment variable: "${key}". ` +
        `Add it to your .env file. See .env.example for reference.`
    );
  }
  return value;
}

function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const serverEnv = {
  // Database
  DATABASE_URL: optionalEnv(
    'DATABASE_URL',
    // fallback only for local dev — production must provide this via env
    ''
  ),

  // App
  APP_URL: optionalEnv('APP_URL', 'http://localhost:3000'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: optionalEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: optionalEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: optionalEnv('CLOUDINARY_API_SECRET'),

  // Razorpay
  RAZORPAY_KEY_ID: optionalEnv('RAZORPAY_KEY_ID'),
  RAZORPAY_KEY_SECRET: optionalEnv('RAZORPAY_KEY_SECRET'),

  // Stripe
  STRIPE_SECRET_KEY: optionalEnv('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: optionalEnv('STRIPE_WEBHOOK_SECRET'),

  // Resend
  RESEND_API_KEY: optionalEnv('RESEND_API_KEY'),
  RESEND_FROM_EMAIL: optionalEnv('RESEND_FROM_EMAIL', 'noreply@offgrid.store'),

  // Gemini
  GEMINI_API_KEY: optionalEnv('GEMINI_API_KEY'),
} as const;

// ─── Client-safe env (public vars) ───────────────────────────────────────────
export const clientEnv = {
  APP_URL: optionalEnv('NEXT_PUBLIC_APP_URL', optionalEnv('APP_URL', 'http://localhost:3000')),
  APP_NAME: optionalEnv('NEXT_PUBLIC_APP_NAME', 'OffGrid'),

  // Cloudinary — cloud name is safe for the upload widget
  CLOUDINARY_CLOUD_NAME: optionalEnv(
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    optionalEnv('CLOUDINARY_CLOUD_NAME')
  ),
  CLOUDINARY_UPLOAD_PRESET: optionalEnv('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET', 'offgrid_designs'),

  // Razorpay key ID is safe to send to the browser
  RAZORPAY_KEY_ID: optionalEnv(
    'NEXT_PUBLIC_RAZORPAY_KEY_ID',
    optionalEnv('RAZORPAY_KEY_ID')
  ),

  // Stripe publishable key
  STRIPE_PUBLISHABLE_KEY: optionalEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
} as const;

// ─── Validate on server startup ───────────────────────────────────────────────
export function validateEnv(): void {
  const required = ['DATABASE_URL'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.warn(
      `[env] WARNING — missing recommended env variables: ${missing.join(', ')}. ` +
        'The app will use fallback values where available.'
    );
  }
}
