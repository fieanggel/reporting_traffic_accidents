"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MapPin, Clock, FileText, CheckCircle2, AlertCircle, Camera,
  Navigation as NavIcon 
} from "lucide-react";

export default function ReportDetailModal({ isOpen, onClose, report }: any) {
  if (!report) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-45%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-45%" }}
            className="fixed left-1/2 top-1/2 z-[101] w-[95%] max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/20 bg-white shadow-2xl shadow-slate-900/40 md:w-full"
          >
            <div className="flex h-full flex-col md:flex-row">
              {/* KIRI: AWS S3 PREVIEW */}
              <div className="relative min-h-[300px] bg-slate-100 md:w-1/2">
                <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                  <Camera size={48} strokeWidth={1} className="mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">S3 Bucket Image</p>
                </div>
                <div className="absolute left-6 top-6 rounded-full bg-slate-900/80 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
                  Bukti Foto
                </div>
              </div>

              {/* KANAN: RDS CONTROL PANEL */}
              <div className="flex flex-col p-8 md:w-1/2">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{report.id}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Laporan Masuk: {report.date}</p>
                  </div>
                  <button onClick={onClose} className="rounded-xl bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 transition">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                      <FileText size={14} /> Deskripsi Kejadian
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {report.desc}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Koordinat RDS</p>
                      <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-slate-700">
                        <MapPin size={12} className="text-primary" /> {report.location}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Tingkat Urgensi</p>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-red-600 uppercase">
                        <AlertCircle size={12} /> Kritis
                      </div>
                    </div>
                  </div>

                  {/* UPDATE STATUS ACTION */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Dispatch Status</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Pending', color: 'red', icon: Clock },
                        { label: 'Proses', color: 'amber', icon: NavIcon },
                        { label: 'Selesai', color: 'emerald', icon: CheckCircle2 }
                      ].map((status) => (
                        <button 
                          key={status.label}
                          className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all hover:scale-105 active:scale-95
                            ${report.status === status.label ? `bg-${status.color}-100 border-${status.color}-200 text-${status.color}-600` : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                        >
                          <status.icon size={16} />
                          <span className="text-[8px] font-black uppercase">{status.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="mt-8 w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-primary active:scale-95">
                  Update Database RDS
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}