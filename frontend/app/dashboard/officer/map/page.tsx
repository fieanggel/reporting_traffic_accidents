"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Navigation, ExternalLink, Compass } from "lucide-react";

import { getErrorMessage } from "@/lib/api/client";
import { getOfficerReports, type ReportRecord } from "@/lib/api/report-service";
import { getSession } from "@/lib/auth/session";

const LocationPickerMap = dynamic(
  () => import("@/components/report/LocationPickerMap"),
  { 
    ssr: false, 
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-3xl" /> 
  }
);

export default function OfficerMapPage() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      const session = getSession();
      if (!session) {
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await getOfficerReports(session.token);
        setReports(data.filter((report) => report.status !== "Selesai"));
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error, "Gagal mengambil titik navigasi penugasan."),
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadReports();
  }, []);

  const targetReport = useMemo(() => {
    return reports[0] ?? null;
  }, [reports]);

  const openInGoogleMaps = () => {
    if (!targetReport) {
      return;
    }

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${targetReport.latitude},${targetReport.longitude}`,
      "_blank",
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Compass size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">Navigasi Tugas</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {targetReport ? targetReport.address : "Belum ada assignment aktif"}
            </p>
          </div>
        </div>
        <button 
          onClick={openInGoogleMaps}
          disabled={!targetReport}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-lg hover:bg-primary transition-all"
        >
          <ExternalLink size={16} /> Buka Google Maps
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="relative flex-1 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-200">
        {isLoading ? (
          <div className="flex h-full items-center justify-center bg-white text-sm font-semibold text-slate-500">
            Memuat titik navigasi...
          </div>
        ) : targetReport ? (
          <LocationPickerMap
            latitude={targetReport.latitude}
            longitude={targetReport.longitude}
            onLocationChange={() => {}}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-white text-sm font-semibold text-slate-500">
            Tidak ada assignment aktif untuk ditampilkan di peta.
          </div>
        )}
        
        {/* Overlay Instruksi Taktis */}
        <div className="absolute bottom-6 left-6 right-6 z-[1000]">
          <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-3xl border border-white/10 text-white shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center animate-pulse">
                <Navigation size={20} />
              </div>
              <p className="text-sm font-bold tracking-tight">Ikuti rute tercepat menuju lokasi insiden.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}