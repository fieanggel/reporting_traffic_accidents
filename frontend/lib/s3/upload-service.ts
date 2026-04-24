import { apiFetch } from "@/lib/api/client";

export type PresignedUploadRequest = {
  fileName: string;
  contentType: string;
};

/**
 * Meminta URL Presigned dari backend Go
 */
export async function requestPresignedUpload(
  payload: PresignedUploadRequest,
) {
  // apiFetch digunakan untuk bicara ke Backend Go kamu
  return apiFetch<{
    uploadUrl: string;
    fileUrl: string;
  }>("/uploads/presign", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function generateS3FileName(file: File) {
  const extension = file.name.includes(".")
    ? file.name.split(".").pop() ?? "jpg"
    : "jpg";
  const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "");
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${uniqueId}.${safeExtension}`;
}

/**
 * Alur Upload Lengkap
 */
export async function uploadFileToS3(file: File): Promise<string> {
  const contentType = file.type || "image/jpeg";
  
  // 1. Dapatkan Presigned URL dari backend
  const { uploadUrl, fileUrl } = await requestPresignedUpload({
    fileName: generateS3FileName(file),
    contentType,
  });

  // LOG UNTUK DEBUG: Cek di console browser, pastikan uploadUrl dimulai dengan "https://s3..."
  console.log("S3 Upload Target:", uploadUrl);

  /**
   * 2. Upload fisik ke S3
   * KRUSIAL: Gunakan window.fetch (bukan apiFetch) agar tidak terkena 
   * prefix API_BASE_URL (IP 98.80.187.179). 
   */
  const uploadResponse = await window.fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      // JANGAN tambahkan header Authorization di sini
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("S3 Error Details:", errorText);
    throw new Error("Gagal upload fisik ke S3. Cek CORS di AWS Console.");
  }

  return fileUrl;
}