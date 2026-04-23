"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  X, MapPin, Clock, FileText, CheckCircle2, AlertCircle, Camera,
  Navigation as NavIcon 
} from "lucide-react";

import { resolveMediaURL } from "@/lib/api/client";
import type { OfficerRecord } from "@/lib/api/officer-service";
import type {
  ReportRecord,
  ReportStatus,
  AdminUpdateReportPayload,
} from "@/lib/api/report-service";

type ReportDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  report: ReportRecord | null;
  officers: OfficerRecord[];
  isSaving: boolean;
  onSubmit: (payload: AdminUpdateReportPayload) => Promise<void>;
};

const statusOptions: Array<{
  label: ReportStatus;
  icon: typeof Clock;
  activeClassName: string;
}> = [
  {
    label: "Pending",
    icon: Clock,
    activeClassName: "bg-red-100 border-red-200 text-red-600",
  },
  {
    label: "Proses",
    icon: NavIcon,
    activeClassName: "bg-amber-100 border-amber-200 text-amber-600",
  },
  {
    label: "Selesai",
    icon: CheckCircle2,
    activeClassName: "bg-emerald-100 border-emerald-200 text-emerald-600",
  },
];

export default function ReportDetailModal({
  isOpen,
  onClose,
  report,
  officers,
  isSaving,
  onSubmit,
}: ReportDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>(
    report?.status ?? "Pending",
  );
  const [selectedOfficerID, setSelectedOfficerID] = useState<number | undefined>(
    report?.officer_id ?? undefined,
  );

  if (!report) return null;

  const imageURL = resolveMediaURL(report.image_url);

  const handleSave = async () => {
    const payload: AdminUpdateReportPayload = {
      status: selectedStatus,
    };

    if (selectedOfficerID !== undefined) {
      payload.officer_id = selectedOfficerID;
    }

    await onSubmit(payload);
  };

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
              {/* KIRI: AWS S3 / Upload Preview */}
              <div className="relative min-h-[300px] bg-slate-100 md:w-1/2">
                {imageURL ? (
                  <img
                    src={imageURL}
                    alt={`Bukti laporan ${report.id}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                    <Camera size={48} strokeWidth={1} className="mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      Bukti Foto Tidak Tersedia
                    </p>
                  </div>
                )}
                <div className="absolute left-6 top-6 rounded-full bg-slate-900/80 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
                  Bukti Foto
                </div>
              </div>

              {/* KANAN: RDS CONTROL PANEL */}
              <div className="flex flex-col p-8 md:w-1/2">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{report.id}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Laporan Masuk: {new Date(report.created_at).toLocaleString("id-ID")}
                    </p>
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
                      {report.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Koordinat RDS</p>
                      <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-slate-700">
                        <MapPin size={12} className="text-primary" />
                        {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
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
                      {statusOptions.map((status) => (
                        <button 
                          key={status.label}
                          type="button"
                          onClick={() => setSelectedStatus(status.label)}
                          className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all hover:scale-105 active:scale-95
                            ${selectedStatus === status.label ? status.activeClassName : "bg-slate-50 border-slate-100 text-slate-400"}`}
                        >
                          <status.icon size={16} />
                          <span className="text-[8px] font-black uppercase">{status.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Assign Petugas
                    </p>
                    <select
                      value={selectedOfficerID ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (!value) {
                          setSelectedOfficerID(undefined);
                          return;
                        }

                        setSelectedOfficerID(Number(value));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                    >
                      <option value="">Pilih petugas...</option>
                      {officers.map((officer) => (
                        <option key={officer.id} value={officer.id}>
                          {officer.name}
                          {officer.officer_id ? ` (${officer.officer_id})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="mt-8 w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? "Menyimpan..." : "Update Database RDS"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}