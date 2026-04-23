"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Map as MapIcon, ShieldAlert, Navigation, Layers } from "lucide-react";

// Load peta secara dinamis agar tidak error SSR
const LocationPickerMap = dynamic(
  () => import("@/components/report/LocationPickerMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="animate-pulse font-bold tracking-widest text-sm uppercase">Mengakses Citra Satelit...</p>
        </div>
      </div>
    )
  }
);

export default function AdminMapPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      {/* Header Kecil */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <MapIcon className="text-primary" /> Peta Pantauan Real-time
          </h1>
          <p className="text-sm text-slate-500 font-medium">Monitoring seluruh insiden aktif di wilayah tugas.</p>
        </div>
        <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border text-xs font-bold shadow-sm">
                <span className="h-2 w-2 rounded-full bg-red-500"></span> 12 Kecelakaan
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border text-xs font-bold shadow-sm">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span> 45 Macet
            </div>
        </div>
      </div>

      {/* Kontainer Peta */}
      <div className="relative flex-1 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-900">
        {/* Overlay Control (Agar terlihat makin pro) */}
        <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
            <button className="bg-white p-3 rounded-2xl shadow-lg hover:bg-slate-50 transition text-slate-700">
                <Layers size={20} />
            </button>
            <button className="bg-white p-3 rounded-2xl shadow-lg hover:bg-slate-50 transition text-slate-700">
                <Navigation size={20} />
            </button>
        </div>

        <div className="absolute top-6 right-6 z-[1000] w-64 space-y-2">
            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white shadow-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Insiden Terbaru</p>
                <div className="space-y-3">
                    <div className="flex items-start gap-3 border-l-2 border-primary pl-3">
                        <div>
                            <p className="text-xs font-bold">Kecelakaan Beruntun</p>
                            <p className="text-[10px] text-slate-400">Jl. Phh. Mustofa • 2m lalu</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Peta Leaflet */}
        <LocationPickerMap 
          latitude={-6.914744} 
          longitude={107.635873} 
          onLocationChange={() => {}} // Admin hanya memantau, tidak mengubah lokasi di sini
        />
      </div>
    </div>
  );
}