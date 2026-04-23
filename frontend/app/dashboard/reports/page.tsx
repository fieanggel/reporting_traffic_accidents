"use client";

import { useState } from "react";
import { Search, Filter, Eye, MoreVertical, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import ReportDetailModal from "../ReportDetailModal";

const dummyReports = [
  { id: "REP-001", date: "2026-04-23", desc: "Kecelakaan beruntun melibatkan 3 kendaraan roda empat.", location: "-6.9147, 107.6098", status: "Pending" },
  { id: "REP-002", date: "2026-04-23", desc: "Kemacetan parah akibat pohon tumbang menutupi jalan.", location: "-6.9001, 107.6122", status: "Proses" },
  { id: "REP-003", date: "2026-04-22", desc: "Motor tergelincir akibat tumpahan solar di aspal.", location: "-6.9210, 107.6331", status: "Selesai" },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (item: any) => {
    setSelectedReport(item);
    setIsModalOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Data Laporan RDS</h1>
          <p className="text-slate-500 text-sm">Validasi laporan masyarakat dan pantau bukti S3.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-white shadow-sm">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input className="pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm outline-none w-64" placeholder="Cari ID Laporan..." />
           </div>
           <button className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-primary transition shadow-lg shadow-slate-900/10">
             <Filter size={18} />
           </button>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-white/70 bg-white/80 shadow-2xl shadow-slate-200/40 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="px-8 py-6">Incident ID</th>
                <th className="px-8 py-6">Waktu Kejadian</th>
                <th className="px-8 py-6">Keterangan</th>
                <th className="px-8 py-6">Status Laporan</th>
                <th className="px-8 py-6 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dummyReports.map((item) => (
                <tr key={item.id} className="group hover:bg-white transition-all cursor-pointer">
                  <td className="px-8 py-5">
                    <span className="font-black text-slate-900 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" /> {item.id}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-500 text-sm font-medium">{item.date}</td>
                  <td className="px-8 py-5 text-slate-600 text-sm max-w-[200px] truncate">{item.desc}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border 
                      ${item.status === 'Pending' ? 'bg-red-50 text-red-600 border-red-100' : 
                        item.status === 'Proses' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleOpenDetail(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-900 hover:text-white"
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReportDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        report={selectedReport} 
      />
    </motion.div>
  );
}