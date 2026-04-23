"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import OfficerSidebar from "@/components/dashboard/OfficerSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Tentukan Sidebar mana yang mau dipakai
  const isOfficerPath = pathname.includes("/officer");

  return (
    <div className="relative flex min-h-screen bg-[#f7f9fc]">
      {/* Switch Sidebar secara otomatis */}
      {isOfficerPath ? <OfficerSidebar /> : <Sidebar />}
      
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8 mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}