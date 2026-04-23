import { apiFetch } from "@/lib/api/client";
import type { AuthSession } from "@/lib/auth/session";

type LoginPayload = {
  username: string;
  password: string;
};

type AuthResponse = AuthSession & {
  message: string;
};

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const response = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    token: response.token,
    user: response.user,
  };
}
