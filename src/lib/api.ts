const rawApiBase = (import.meta as any).env?.VITE_API_BASE_URL?.trim() ?? '';

export function apiPath(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return rawApiBase ? `${rawApiBase.replace(/\/$/, '')}${normalized}` : normalized;
}

export async function apiJson<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiPath(path), init);
  const text = await res.text();

  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`API returned non-JSON response (${res.status}). Check your API base URL.`);
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data as T;
}
