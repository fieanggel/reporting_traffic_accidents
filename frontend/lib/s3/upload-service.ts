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

  return `reports/${uniqueId}.${safeExtension || "jpg"}`;
}

export async function uploadFileToS3(file: File) {
  const contentType = file.type || "application/octet-stream";
  const { uploadUrl, fileUrl } = await requestPresignedUpload({
    fileName: generateS3FileName(file),
    contentType,
  });

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Gagal upload foto ke Amazon S3.");
  }

  return fileUrl;
}
