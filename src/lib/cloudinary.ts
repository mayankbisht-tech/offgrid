/**
 * Cloudinary server-side upload helper.
 * Uses the REST API with signed uploads (no SDK needed).
 */

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resource_type: string;
}

export const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB

export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/** Throws a descriptive string if the file is invalid */
export function validateUploadFile(file: { size: number; type: string }): void {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_BYTES / 1024 / 1024} MB.`);
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    throw new Error(
      `Invalid file type "${file.type}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}.`
    );
  }
}

/**
 * Upload a base64-encoded file to Cloudinary using a signed request.
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in env.
 */
export async function uploadToCloudinary(
  fileBase64: string,
  options: {
    folder?: string;
    resourceType?: 'image' | 'raw' | 'auto';
  } = {}
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET in environment.'
    );
  }

  const folder       = options.folder ?? 'offgrid/designs';
  const resourceType = options.resourceType ?? 'auto';
  const timestamp    = Math.round(Date.now() / 1000);

  // Build signature: sort params alphabetically + append secret
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

  // SHA-1 via Node built-in crypto (no external deps)
  const { createHash } = await import('crypto');
  const signature = createHash('sha1').update(paramsToSign).digest('hex');

  // Build multipart form
  const form = new FormData();
  // Cloudinary accepts data URIs directly
  const mimeGuess = fileBase64.startsWith('/9j') ? 'image/jpeg' : 'image/png';
  form.append('file', `data:${mimeGuess};base64,${fileBase64}`);
  form.append('api_key',   apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder',    folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const response = await fetch(url, { method: 'POST', body: form });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(`Cloudinary upload failed: ${err?.error?.message ?? response.statusText}`);
  }

  return response.json() as Promise<CloudinaryUploadResult>;
}
