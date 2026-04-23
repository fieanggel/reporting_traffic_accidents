export type PresignedUploadRequest = {
  fileName: string;
  contentType: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

export async function requestPresignedUpload(
  payload: PresignedUploadRequest,
) {
  const response = await fetch(`${API_BASE_URL}/uploads/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Gagal meminta URL upload S3.");
  }

  return response.json() as Promise<{
    uploadUrl: string;
    fileUrl: string;
  }>;
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
