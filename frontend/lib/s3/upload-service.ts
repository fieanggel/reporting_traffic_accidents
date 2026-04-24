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

  // FIX: Kembalikan nama file saja tanpa folder 'reports/'
  return `${uniqueId}.${safeExtension}`;
}

export async function uploadFileToS3(file: File): Promise<string> {
  const contentType = file.type || "image/jpeg";
  
  // 1. Minta Presigned URL
  const { uploadUrl, fileUrl } = await requestPresignedUpload({
    fileName: generateS3FileName(file),
    contentType,
  });

  // 2. Upload fisik ke S3 menggunakan fetch asli
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("S3 Error:", errorText);
    throw new Error("Gagal upload ke S3. Cek CORS!");
  }

  return fileUrl;
}