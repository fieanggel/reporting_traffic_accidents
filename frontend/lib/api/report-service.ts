import { apiFetch } from "@/lib/api/client";
import type { AuthUser } from "@/lib/auth/session";

// --- TYPES ---

export type ReportCategory = "Kecelakaan" | "Kemacetan";
export type ReportStatus = "Pending" | "Proses" | "Selesai";

export type ReportRecord = {
  id: string;
  category: ReportCategory;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  image_url: string;
  status: ReportStatus;
  officer_id?: number | null;
  created_at: string;
  updated_at: string;
  officer?: AuthUser | null;
};

export type CreateReportPayload = {
  category: ReportCategory;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  image_url?: string;
};

export type AdminReportFilters = {
  status?: ReportStatus;
  startDate?: string;
  endDate?: string;
};

export type AdminUpdateReportPayload = {
  status?: ReportStatus;
  officer_id?: number;
};

type ReportListResponse = {
  data: ReportRecord[];
};

type ReportWriteResponse = {
  message: string;
  data: ReportRecord;
};

// --- FUNCTIONS ---

/**
 * FUNGSI KRUSIAL: Mengupload file fisik langsung ke Amazon S3.
 * Menggunakan tiket (Presigned URL) yang didapat dari Backend.
 */
export async function uploadFileToS3(file: File): Promise<string> {
  // 1. Minta Presigned URL dari Backend
  // Endpoint ini akan memanggil r.RequestUploadURL di Go kamu
  const { uploadUrl, fileUrl } = await apiFetch<{ uploadUrl: string; fileUrl: string }>(
    "/uploads/presign",
    {
      method: "POST",
      body: JSON.stringify({
        fileName: `${Date.now()}-${file.name.replace(/\s+/g, "-")}`,
        contentType: file.type,
      }),
    }
  );

  /**
   * 2. Upload fisik ke link S3 menggunakan window.fetch
   * Kenapa window.fetch? Agar tidak otomatis tertambah prefix API_BASE_URL (IP Server).
   * Browser akan langsung mengirim file ke domain s3.amazonaws.com.
   */
  const uploadResponse = await window.fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Gagal mengunggah foto ke S3. Periksa konfigurasi CORS di AWS Console.");
  }

  // Mengembalikan URL S3 permanen (fileUrl) untuk disimpan di Database via CreateReport
  return fileUrl;
}

/**
 * Membuat laporan baru (Public)
 */
export async function createPublicReport(
  payload: CreateReportPayload,
): Promise<ReportRecord> {
  const response = await apiFetch<ReportWriteResponse>("/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

/**
 * Admin: Mengambil semua laporan dengan filter
 */
export async function getAdminReports(
  token: string,
  filters: AdminReportFilters = {},
): Promise<ReportRecord[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.startDate) params.set("start_date", filters.startDate);
  if (filters.endDate) params.set("end_date", filters.endDate);

  const query = params.toString();
  const endpoint = query ? `/admin/reports?${query}` : "/admin/reports";
  
  const response = await apiFetch<ReportListResponse>(endpoint, {
    method: "GET",
    token,
  });

  return response.data;
}

/**
 * Admin: Update status atau Assign petugas
 */
export async function updateAdminReport(
  token: string,
  reportID: string,
  payload: AdminUpdateReportPayload,
): Promise<ReportRecord> {
  const response = await apiFetch<ReportWriteResponse>(`/admin/reports/${reportID}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });

  return response.data;
}

/**
 * Officer: Melihat daftar tugas laporan
 */
export async function getOfficerReports(
  token: string,
  status?: ReportStatus,
): Promise<ReportRecord[]> {
  const endpoint = status
    ? `/officer/reports?status=${encodeURIComponent(status)}`
    : "/officer/reports";

  const response = await apiFetch<ReportListResponse>(endpoint, {
    method: "GET",
    token,
  });

  return response.data;
}

/**
 * Officer: Menandai laporan selesai
 */
export async function completeOfficerReport(
  token: string,
  reportID: string,
): Promise<ReportRecord> {
  const response = await apiFetch<ReportWriteResponse>(
    `/officer/reports/${reportID}/complete`,
    {
      method: "PUT",
      token,
      body: JSON.stringify({}),
    },
  );

  return response.data;
}