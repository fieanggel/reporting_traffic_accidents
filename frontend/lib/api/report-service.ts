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
 * Fungsi krusial untuk mengupload file langsung ke Amazon S3
 * menggunakan Presigned URL dari Backend.
 */
export async function uploadFileToS3(file: File): Promise<string> {
  // 1. Minta Presigned URL dan link file permanen ke Backend
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

  // 2. Upload file fisik LANGSUNG ke Amazon S3
  // Kita gunakan window.fetch agar tidak otomatis tertambah prefix URL dari apiFetch
  const uploadResponse = await window.fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Gagal mengunggah foto ke Amazon S3. Pastikan konfigurasi CORS S3 sudah benar.");
  }

  // Mengembalikan URL S3 permanen untuk disimpan ke Database RDS via CreateReport
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
 * Mengambil semua laporan untuk Admin
 */
export async function getAdminReports(
  token: string,
  filters: AdminReportFilters = {},
): Promise<ReportRecord[]> {
  const params = new URLSearchParams();
  if (filters.status) {
    params.set("status", filters.status);
  }
  if (filters.startDate) {
    params.set("start_date", filters.startDate);
  }
  if (filters.endDate) {
    params.set("end_date", filters.endDate);
  }

  const query = params.toString();
  const endpoint = query ? `/admin/reports?${query}` : "/admin/reports";
  const response = await apiFetch<ReportListResponse>(endpoint, {
    method: "GET",
    token,
  });

  return response.data;
}

/**
 * Admin mengupdate status atau menugaskan petugas
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
 * Petugas (Officer) melihat daftar laporan yang ditugaskan kepadanya
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
 * Petugas menandai laporan sebagai selesai
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