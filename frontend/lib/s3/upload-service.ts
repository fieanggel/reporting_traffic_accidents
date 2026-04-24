import { apiFetch } from "@/lib/api/client";

export type PresignedUploadRequest = {
  fileName: string;
  contentType: string;
};

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
  return `${uniqueId}.${safeExtension}`;
}

export async function uploadFileToS3(file: File): Promise<string> {
  const contentType = file.type || "image/jpeg";
  
  // 1. Minta Presigned URL dari backend
  const { uploadUrl, fileUrl } = await requestPresignedUpload({
    fileName: generateS3FileName(file),
    contentType,
  });

  // LOG UNTUK DEBUG
  console.log("Target S3 URL:", uploadUrl);

  // 2. Upload fisik ke S3 menggunakan fetch asli browser
  const uploadResponse = await window.fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("S3 Error Details:", errorText);
    throw new Error("Gagal mengunggah foto ke S3. Cek konfigurasi CORS di S3.");
  }

  return fileUrl;
} 