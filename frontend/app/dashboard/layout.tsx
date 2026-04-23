"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";
import OfficerSidebar from "@/components/dashboard/OfficerSidebar";
import { clearSession, getSession } from "@/lib/auth/session";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // 1. Gunakan state untuk session dan mounted
  const [session, setSession] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const isOfficerPath = useMemo(() => {
    return pathname.startsWith("/dashboard/officer");
  }, [pathname]);

  useEffect(() => {
    // 2. Tandai bahwa komponen sudah terpasang di client
    setMounted(true);
    
    // 3. Ambil session hanya di sisi client
    const currentSession = getSession();
    setSession(currentSession);

    if (!currentSession) {
      router.replace("/login");
      return;
    }

    if (currentSession.user.role === "officer" && !isOfficerPath) {
      router.replace("/dashboard/officer");
      return;
    }

    if (currentSession.user.role === "admin" && isOfficerPath) {
      router.replace("/dashboard");
    }
  }, [isOfficerPath, router, pathname]); // Tambahkan pathname agar re-check saat pindah halaman

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  // 4. JANGAN render apapun yang berbeda sebelum mounted
  // Tampilan ini akan sama baik di Server maupun Client saat pertama kali load
  if (!mounted || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-slate-500 shadow-sm">
          Memverifikasi sesi pengguna...
        </div>
      </div>
    );
  }

  const shouldUseOfficerSidebar = session.user.role === "officer";

  return (
    <div className="relative flex min-h-screen bg-[#f7f9fc]">
      {shouldUseOfficerSidebar ? (
        <OfficerSidebar currentUser={session.user} onLogout={handleLogout} />
      ) : (
        <Sidebar currentUser={session.user} onLogout={handleLogout} />
      )}
      
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8 mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}