// frontend/lib/api/client.ts

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "http://alb-difie-1157039190.us-east-1.elb.amazonaws.com/api";

export const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL 
  ?? "http://alb-difie-1157039190.us-east-1.elb.amazonaws.com";

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type ApiFetchOptions = RequestInit & {
  token?: string;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, headers, ...requestInit } = options;
  
  // FIX: Jika path sudah berisi URL lengkap (seperti link Cloudinary), gunakan langsung.
  // Jika hanya path API (seperti /auth/login), tambahkan API_BASE_URL.
  const finalUrl = path.startsWith("http") 
    ? path 
    : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const finalHeaders = new Headers(headers);
  if (token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (
    requestInit.body &&
    !(requestInit.body instanceof FormData) &&
    !finalHeaders.has("Content-Type")
  ) {
    finalHeaders.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(finalUrl, {
      ...requestInit,
      headers: finalHeaders,
    });
  } catch (error) {
    throw new ApiError(
      "Tidak dapat terhubung ke server backend. Pastikan backend sudah berjalan.",
      0,
      error,
    );
  }

  const rawBody = await response.text();
  const parsedBody = parseResponseBody(rawBody);

  if (!response.ok) {
    const errorMessage = extractApiMessage(parsedBody) ?? `Request gagal (${response.status})`;
    throw new ApiError(errorMessage, response.status, parsedBody);
  }

  return parsedBody as T;
}

/**
 * Mengubah objek error menjadi string yang bisa dibaca user
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/**
 * Mengubah path gambar menjadi URL yang bisa ditampilkan di <img> tag
 * Untuk Cloudinary (sudah https), langsung return tanpa tambahan prefix
 */
export function resolveMediaURL(url?: string | null) {
  if (!url) return "";
  // Cloudinary URL (https://res.cloudinary.com/...) langsung return
  if (url.startsWith("http")) return url;
  // Fallback untuk path lokal (jika ada)
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${API_ORIGIN}${cleanUrl}`;
}

function parseResponseBody(rawBody: string): unknown {
  if (!rawBody) return null;
  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

function extractApiMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  if (body && "message" in body && typeof body.message === "string") {
    return (body as { message: string }).message;
  }
  return null;
}