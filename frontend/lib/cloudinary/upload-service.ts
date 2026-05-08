// frontend/lib/cloudinary/upload-service.ts

const CLOUDINARY_CLOUD_NAME = "dizxhou7e";
const CLOUDINARY_UPLOAD_PRESET = "reporting_diffie";

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Upload to Cloudinary failed");
  }

  const data: CloudinaryUploadResponse = await response.json();
  return data.secure_url;
}