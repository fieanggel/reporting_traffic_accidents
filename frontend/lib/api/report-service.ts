import { apiFetch } from "@/lib/api/client";
import type { AuthUser } from "@/lib/auth/session";

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

export async function createPublicReport(
  payload: CreateReportPayload,
): Promise<ReportRecord> {
  const response = await apiFetch<ReportWriteResponse>("/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

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
