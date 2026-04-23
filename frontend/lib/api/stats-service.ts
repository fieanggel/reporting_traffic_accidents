import { apiFetch } from "./client";

// Interface untuk data user/petugas
export interface OfficerData {
  id: number;
  name: string;
  username: string;
  role: string;
  officer_id?: string; // Sesuai kolom di DB kamu
  zone?: string;
}

export interface DashboardStats {
  summary: {
    total_incidents: number;
    active_officers: number;
    pending: number;
    resolved: number;
  };
  categories: {
    label: string;
    value: number;
  }[];
  // PERBAIKAN: Tambahkan properti officers di sini
  officers: OfficerData[];
}

export const getDashboardStats = async (token: string): Promise<DashboardStats> => {
  return apiFetch<DashboardStats>("/admin/stats", {
    method: "GET",
    token: token,
  });
};