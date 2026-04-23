"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, CheckCircle2, Phone, AlertCircle, Car, Clock } from "lucide-react";

import { getErrorMessage } from "@/lib/api/client";
import {
  completeOfficerReport,
  getOfficerReports,
  type ReportRecord,
} from "@/lib/api/report-service";
import { getSession } from "@/lib/auth/session";

export default function OfficerDashboard() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [officerName, setOfficerName] = useState("Petugas");
  const [officerZone, setOfficerZone] = useState("Wilayah belum diatur");
  const [isLoading, setIsLoading] = useState(true);
  const [isCompletingID, setIsCompletingID] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeTasks = useMemo(() => {
    return reports.filter((report) => report.status !== "Selesai");
  }, [reports]);

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      const session = getSession();
      if (!session) {
        return;
      }

      try {
        const data = await getOfficerReports(session.token);
        if (!isMounted) {
          return;
        }

        setReports(data);
        setOfficerName(session.user.name);
        setOfficerZone(session.user.zone || "Wilayah belum diatur");
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getErrorMessage(error, "Gagal mengambil daftar tugas petugas."),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenMaps = (report: ReportRecord) => {
    const destination = `${report.latitude},${report.longitude}`;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
      "_blank",
    );
  };

  const handleComplete = async (reportID: string) => {
    const session = getSession();
    if (!session) {
      return;
    }

    setIsCompletingID(reportID);
    setErrorMessage(null);
    try {
      await completeOfficerReport(session.token, reportID);
      const refreshedReports = await getOfficerReports(session.token);
      setReports(refreshedReports);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Gagal memperbarui status laporan menjadi selesai."),
      );
    } finally {
      setIsCompletingID(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER PETUGAS */}
      <div className="flex items-center justify-between bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-1">Status: On Duty</p>
          <h1 className="text-3xl font-black tracking-tight text-white">Halo, {officerName}</h1>
          <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
             <MapPin size={14} className="text-primary" /> Wilayah Tugas: {officerZone}
          </p>
        </div>
        <Car size={120} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {/* DAFTAR TUGAS */}
      <div className="grid gap-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="text-primary" /> Penugasan Aktif
        </h3>

        {isLoading && (
          <div className="rounded-2xl border border-white bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">
            Memuat daftar tugas aktif...
          </div>
        )}

        {!isLoading && activeTasks.length === 0 && (
          <div className="rounded-2xl border border-white bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">
            Belum ada penugasan aktif untuk akun ini.
          </div>
        )}
        
        {!isLoading && activeTasks.map((task, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={task.id} 
            className="group relative overflow-hidden rounded-[2rem] border border-white bg-white p-6 shadow-xl shadow-slate-200/50"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 ${task.category === 'Kecelakaan' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                   {task.category === 'Kecelakaan' ? <AlertCircle size={32} /> : <Car size={32} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{task.id}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${task.category === 'Kecelakaan' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                        {task.category}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mt-1">{task.address}</h4>
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-1">
                    <Clock size={12} /> Dilaporkan {new Date(task.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenMaps(task)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary transition-all"
                >
                  <Navigation size={18} /> Navigasi
                </button>
                <button
                  type="button"
                  onClick={() => handleComplete(task.id)}
                  disabled={isCompletingID === task.id}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <CheckCircle2 size={18} />
                  {isCompletingID === task.id ? "Memproses..." : "Selesai"}
                </button>
                <button
                  type="button"
                  className="h-12 w-12 flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
                >
                  <Phone size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}