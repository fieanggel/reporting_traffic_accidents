"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, LogIn } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { login } from "@/lib/api/auth-service";
import { getErrorMessage } from "@/lib/api/client";
import { getSession, saveSession } from "@/lib/auth/session";

const roleLabelMap = {
  admin: "Admin",
  officer: "Petugas",
} as const;

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      return;
    }

    const redirectTarget =
      currentSession.user.role === "admin" ? "/dashboard" : "/dashboard/officer";
    router.replace(redirectTarget);
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isSubmitting) return;

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Isi username dan password terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await login({
        username: username.trim(),
        password,
      });

      saveSession(session);

      const roleLabel = roleLabelMap[session.user.role] ?? "User";
      setSuccessMessage(`Login berhasil sebagai ${roleLabel}. Mengarahkan...`);

      const redirectTarget =
        session.user.role === "admin" ? "/dashboard" : "/dashboard/officer";
      router.replace(redirectTarget);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Login gagal. Periksa kembali kredensial Anda."));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative isolate overflow-hidden px-5 pb-16 pt-8 md:pt-12">
      {/* Background Decorations */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-drift absolute -left-24 top-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="animate-drift absolute -right-20 top-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl [animation-delay:1.5s]" />
      </div>

      <section className="mx-auto w-full max-w-2xl space-y-8">
        {/* Header Section */}
        <div className="reveal rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/10 backdrop-blur md:p-8">
          <Link
            href="/#beranda"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>

          <div className="mt-4 space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <LogIn className="h-3.5 w-3.5" />
              Halaman Login
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Login Admin & Petugas
            </h1>
            <p className="text-sm leading-7 text-slate-600 md:text-base">
              Silakan masukkan kredensial Anda untuk mengakses dashboard sistem.
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <article className="reveal delay-1 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-900/10 backdrop-blur md:p-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/25"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/25"
              />
            </label>

            {errorMessage && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-600">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-5 text-sm font-semibold text-on-primary-container shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LockKeyhole className="h-4 w-4" />
              {isSubmitting ? "Memproses..." : "Masuk ke Sistem"}
            </button>
          </form>
        </article>
      </section>
    </div>
  );
}