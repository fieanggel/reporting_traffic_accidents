"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Eye } from "lucide-react";
import { motion } from "framer-motion";

import ReportDetailModal from "../ReportDetailModal";
import { getErrorMessage } from "@/lib/api/client";
import { getAdminOfficers, type OfficerRecord } from "@/lib/api/officer-service";
import {
  getAdminReports,
  updateAdminReport,
  type AdminUpdateReportPayload,
  type ReportRecord,
  type ReportStatus,
} from "@/lib/api/report-service";
import { getSession } from "@/lib/auth/session";

const statusOptions: Array<{ label: string; value: "" | ReportStatus }> = [
  { label: "Semua", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Proses", value: "Proses" },
  { label: "Selesai", value: "Selesai" },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [officers, setOfficers] = useState<OfficerRecord[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ReportStatus>("");

  const fetchReports = async (filter: "" | ReportStatus) => {
    const session = getSession();
    if (!session) {
      return [] as ReportRecord[];
    }

    return getAdminReports(session.token, {
      status: filter || undefined,
    });
  };

  const handleOpenDetail = (item: ReportRecord) => {
    setSelectedReport(item);
    setIsModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialReports = async () => {
      try {
        const loadedReports = await fetchReports(statusFilter);
        if (!isMounted) {
          return;
        }
        setReports(loadedReports);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setErrorMessage(
          getErrorMessage(error, "Gagal mengambil data laporan dari server."),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialReports();

    return () => {
      isMounted = false;
    };
  }, [statusFilter]);

  useEffect(() => {
    let isMounted = true;

    const loadOfficers = async () => {
      const session = getSession();
      if (!session) {
        return;
      }

      try {
        const loadedOfficers = await getAdminOfficers(session.token);
        if (!isMounted) {
          return;
        }
        setOfficers(loadedOfficers);
      } catch {
        if (isMounted) {
          setOfficers([]);
        }
      }
    };

    void loadOfficers();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleReports = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      return reports;
    }

    return reports.filter((report) => {
      return (
        report.id.toLowerCase().includes(keyword) ||
        report.description.toLowerCase().includes(keyword) ||
        report.address.toLowerCase().includes(keyword) ||
        report.category.toLowerCase().includes(keyword)
      );
    });
  }, [reports, searchKeyword]);

  const handleUpdateReport = async (payload: AdminUpdateReportPayload) => {
    if (!selectedReport) {
      return;
    }

    const session = getSession();
    if (!session) {
      return;
    }

    setIsSaving(true);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await updateAdminReport(session.token, selectedReport.id, payload);
      setIsModalOpen(false);
      const loadedReports = await fetchReports(statusFilter);
      setReports(loadedReports);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Gagal memperbarui laporan. Silakan coba lagi."),
      );
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
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
             <input
               value={searchKeyword}
               onChange={(event) => setSearchKeyword(event.target.value)}
               className="pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm outline-none w-64"
               placeholder="Cari ID / lokasi / deskripsi..."
             />
           </div>
           <button
             type="button"
             className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-primary transition shadow-lg shadow-slate-900/10"
           >
             <Filter size={18} />
           </button>
           <select
             value={statusFilter}
             onChange={(event) => {
               setIsLoading(true);
               setStatusFilter(event.target.value as "" | ReportStatus);
             }}
             className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 outline-none"
           >
             {statusOptions.map((status) => (
               <option key={status.label} value={status.value}>
                 {status.label}
               </option>
             ))}
           </select>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="rounded-[2.5rem] border border-white/70 bg-white/80 shadow-2xl shadow-slate-200/40 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="px-8 py-6">Incident ID</th>
                <th className="px-8 py-6">Waktu Kejadian</th>
                <th className="px-8 py-6">Keterangan</th>
                <th className="px-8 py-6">Kategori</th>
                <th className="px-8 py-6">Status Laporan</th>
                <th className="px-8 py-6 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && (
                <tr>
                  <td className="px-8 py-10 text-center text-sm text-slate-500" colSpan={6}>
                    Memuat data laporan...
                  </td>
                </tr>
              )}
              {!isLoading && visibleReports.length === 0 && (
                <tr>
                  <td className="px-8 py-10 text-center text-sm text-slate-500" colSpan={6}>
                    Belum ada laporan yang cocok dengan filter.
                  </td>
                </tr>
              )}
              {!isLoading &&
                visibleReports.map((item) => (
                <tr key={item.id} className="group hover:bg-white transition-all cursor-pointer">
                  <td className="px-8 py-5">
                    <span className="font-black text-slate-900 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" /> {item.id}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-500 text-sm font-medium">
                    {new Date(item.created_at).toLocaleString("id-ID")}
                  </td>
                  <td className="px-8 py-5 text-slate-600 text-sm max-w-[280px] truncate">{item.description}</td>
                  <td className="px-8 py-5 text-slate-600 text-sm font-semibold">{item.category}</td>
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
        key={selectedReport?.id ?? "report-modal"}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        report={selectedReport}
        officers={officers}
        isSaving={isSaving}
        onSubmit={handleUpdateReport}
      />
    </motion.div>
  );
}