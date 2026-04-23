"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Navigation, MapPin, ExternalLink, Compass } from "lucide-react";

const LocationPickerMap = dynamic(
  () => import("@/components/report/LocationPickerMap"),
  { 
    ssr: false, 
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-3xl" /> 
  }
);

export default function OfficerMapPage() {
  const targetLoc = { lat: -6.9147, lng: 107.6098, name: "Jl. Phh. Mustofa" };

  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${targetLoc.lat},${targetLoc.lng}`, "_blank");
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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{targetLoc.name}</p>
          </div>
        </div>
        <button 
          onClick={openInGoogleMaps}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-lg hover:bg-primary transition-all"
        >
          <ExternalLink size={16} /> Buka Google Maps
        </button>
      </div>

      <div className="relative flex-1 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-200">
        <LocationPickerMap 
          latitude={targetLoc.lat} 
          longitude={targetLoc.lng} 
          onLocationChange={() => {}} 
        />
        
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