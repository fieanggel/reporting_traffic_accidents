export type UserRole = "admin" | "officer";

export type AuthUser = {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  officer_id?: string | null;
  zone?: string | null;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

const SESSION_KEY = "responcepat_session";

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveSession(session: AuthSession) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.token || !parsed?.user?.role) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
}
