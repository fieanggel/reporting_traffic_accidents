"use client";

import { motion } from "framer-motion";
import { History, CheckCircle2, Calendar, MapPin, Search } from "lucide-react";

const historyData = [
  { id: "REP-002", type: "Kecelakaan", loc: "Jl. Suci", date: "22 Apr 2026", status: "Resolved" },
  { id: "REP-004", type: "Kemacetan", loc: "Gedung Sate", date: "21 Apr 2026", status: "Resolved" },
  { id: "REP-009", type: "Kecelakaan", loc: "Cikutra", date: "20 Apr 2026", status: "Resolved" },
];

export default function OfficerHistoryPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Riwayat Tugas</h1>
          <p className="text-slate-500 text-sm">Daftar penanganan insiden yang telah diselesaikan.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none w-64 shadow-sm" placeholder="Cari riwayat..." />
        </div>
      </div>

      <div className="grid gap-4">
        {historyData.map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={item.id}
            className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.id}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                  <span className="text-[10px] font-bold text-primary uppercase">{item.type}</span>
                </div>
                <h4 className="font-bold text-slate-900">{item.loc}</h4>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-slate-400 text-xs font-medium mb-1">
                <Calendar size={12} /> {item.date}
              </div>
              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-tighter">Mission Accomplished</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}