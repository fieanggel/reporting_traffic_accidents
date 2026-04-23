"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileStack, Map as MapIcon, LogOut, Siren } from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Daftar Laporan", href: "/dashboard/reports", icon: FileStack },
  { name: "Peta Pantauan", href: "/dashboard/map", icon: MapIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-slate-950 text-slate-300">
      <div className="flex h-full flex-col px-4 py-8">
        <div className="mb-12 flex items-center gap-4 px-2">
          <div className="relative">
            <div className="absolute -inset-1 bg-primary rounded-xl blur opacity-25"></div>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-2xl">
              <Siren className="text-white" size={26} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white">RESPON<span className="text-primary">CEPAT</span></h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="relative group flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all">
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
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

        <div className="mt-auto pt-6 border-t border-slate-900">
          <button className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-red-500/10 hover:text-red-400">
            <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-red-500/20 transition-colors">
               <LogOut size={18} />
            </div>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}