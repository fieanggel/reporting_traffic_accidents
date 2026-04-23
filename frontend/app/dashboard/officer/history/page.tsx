"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, Search } from "lucide-react";

import { getErrorMessage } from "@/lib/api/client";
import { getOfficerReports, type ReportRecord } from "@/lib/api/report-service";
import { getSession } from "@/lib/auth/session";

export default function OfficerHistoryPage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [historyReports, setHistoryReports] = useState<ReportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const session = getSession();
      if (!session) {
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const reports = await getOfficerReports(session.token, "Selesai");
        setHistoryReports(reports);
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error, "Gagal mengambil riwayat penugasan petugas."),
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      return historyReports;
    }

    return historyReports.filter((report) => {
      return (
        report.id.toLowerCase().includes(keyword) ||
        report.address.toLowerCase().includes(keyword) ||
        report.category.toLowerCase().includes(keyword)
      );
    });
  }, [historyReports, searchKeyword]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Riwayat Tugas</h1>
          <p className="text-slate-500 text-sm">Daftar penanganan insiden yang telah diselesaikan.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none w-64 shadow-sm"
            placeholder="Cari riwayat..."
          />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4">
        {isLoading && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">
            Memuat riwayat tugas...
          </div>
        )}

        {!isLoading && filteredHistory.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">
            Belum ada riwayat tugas yang selesai.
          </div>
        )}

        {!isLoading && filteredHistory.map((item, i) => (
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
                  <span className="text-[10px] font-bold text-primary uppercase">{item.category}</span>
                </div>
                <h4 className="font-bold text-slate-900">{item.address}</h4>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-slate-400 text-xs font-medium mb-1">
                <Calendar size={12} /> {new Date(item.updated_at).toLocaleDateString("id-ID")}
              </div>
              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-tighter">Mission Accomplished</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}