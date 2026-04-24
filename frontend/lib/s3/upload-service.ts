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

  // Return nama file unik
  return `${uniqueId}.${safeExtension}`;
}

/**
 * Alur Upload Lengkap:
 * 1. Minta tiket ke backend
 * 2. Upload fisik ke S3
 */
export async function uploadFileToS3(file: File): Promise<string> {
  // Pastikan contentType terdefinisi dengan benar
  const contentType = file.type || "image/jpeg";
  
  // 1. Minta Presigned URL
  const { uploadUrl, fileUrl } = await requestPresignedUpload({
    fileName: generateS3FileName(file),
    contentType,
  });

  // 2. Upload fisik ke S3 menggunakan window.fetch bawaan browser
  // Jangan gunakan apiFetch di sini karena apiFetch biasanya otomatis menyisipkan 
  // header Authorization (Bearer token) yang akan ditolak oleh S3 (CORS Signature Error)
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType, // Harus sama persis dengan yang di-presign di Go
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("S3 Error Response:", errorText);
    throw new Error("Gagal upload file ke S3. Cek apakah Content-Type sesuai.");
  }

  return fileUrl;
}