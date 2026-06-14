/**
 * Cloudinary configuration + signed-upload helper (server-only).
 * For unsigned browser uploads, use NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 * and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET directly in the client.
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

/** Maximum file size: 50 MB */
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

/** Allowed MIME types for design uploads */
export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/**
 * Validate a file before upload.
 * Throws a descriptive error string if invalid.
 */
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
 * Upload a file buffer to Cloudinary via REST API (server-side, signed).
 * Returns the secure URL and public_id.
 */
export async function uploadToCloudinary(
  fileBase64: string,
  options: {
    folder?: string;
    publicId?: string;
    resourceType?: 'image' | 'raw' | 'auto';
  } = {}
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      '[cloudinary] Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET env variables.'
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = options.folder ?? 'offgrid/designs';
  const resourceType = options.resourceType ?? 'auto';

  // Build signature string
  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
  };
  if (options.publicId) paramsToSign.public_id = options.publicId;

  const sigString =
    Object.keys(paramsToSign)
      .sort()
      .map((k) => `${k}=${paramsToSign[k]}`)
      .join('&') + apiSecret;

  // SHA-1 hash via Web Crypto (works in Node 18+)
  const encoder = new TextEncoder();
  const data = encoder.encode(sigString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const signature = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const formData = new FormData();
  formData.append('file', `data:application/octet-stream;base64,${fileBase64}`);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);
  if (options.publicId) formData.append('public_id', options.publicId);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const response = await fetch(uploadUrl, { method: 'POST', body: formData });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`[cloudinary] Upload failed: ${JSON.stringify(err)}`);
  }

  return response.json() as Promise<CloudinaryUploadResult>;
}
