"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList, Map, History, LogOut, Siren, User } from "lucide-react";

import type { AuthUser } from "@/lib/auth/session";

const officerMenu = [
  { name: "Tugas Aktif", href: "/dashboard/officer", icon: ClipboardList },
  { name: "Peta Navigasi", href: "/dashboard/officer/map", icon: Map },
  { name: "Riwayat", href: "/dashboard/officer/history", icon: History },
];

type OfficerSidebarProps = {
  currentUser: AuthUser;
  onLogout: () => void;
};

export default function OfficerSidebar({
  currentUser,
  onLogout,
}: OfficerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-slate-950 text-slate-300">
      <div className="flex h-full flex-col px-4 py-8">
        {/* Logo Branding */}
        <div className="mb-12 flex items-center gap-4 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Siren className="text-white" size={26} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase">Officer<span className="text-primary">App</span></h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Unit Lapangan</p>
          </div>
        </div>

        {/* Menu Taktis */}
        <nav className="flex-1 space-y-2">
          {officerMenu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="relative group flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all">
                {isActive && (
                  <motion.div 
                    layoutId="activeNavOfficer"
                    className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={20} className={`relative z-10 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                <span className={`relative z-10 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto pt-6 border-t border-slate-900">
          <div className="flex items-center gap-3 px-3 mb-6">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <User size={16} />
            </div>
            <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                <p className="text-xs font-bold text-white uppercase">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500">
                  {currentUser.zone || "Wilayah belum diatur"}
                  {currentUser.officer_id ? ` • ${currentUser.officer_id}` : ""}
                </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            Keluar Shift
          </button>
        </div>
      </div>
    </aside>
  );
}   