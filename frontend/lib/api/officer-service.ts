import { apiFetch } from "@/lib/api/client";
import type { AuthUser } from "@/lib/auth/session";

export type OfficerRecord = AuthUser;

type OfficersResponse = {
  data: OfficerRecord[];
};

export async function getAdminOfficers(token: string): Promise<OfficerRecord[]> {
  const response = await apiFetch<OfficersResponse>("/admin/officers", {
    method: "GET",
    token,
  });

  return response.data;
}
