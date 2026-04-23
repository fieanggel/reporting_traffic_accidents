"use client";

import dynamic from "next/dynamic";
import { FormEvent, useState } from "react";
import { Loader2, LocateFixed, MapPin, SendHorizontal, Navigation, AlertCircle, Car } from "lucide-react";

import { getErrorMessage } from "@/lib/api/client";
import {
  createPublicReport,
  type ReportCategory,
} from "@/lib/api/report-service";
import { uploadFileToS3 } from "@/lib/s3/upload-service";

const LocationPickerMap = dynamic(
  () => import("./report/LocationPickerMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 italic text-slate-400">
        <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Menghubungkan ke satelit...</p>
      </div>
    )
  }
);

export default function ReportForm() {
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<ReportCategory>("Kecelakaan");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [coordinates, setCoordinates] = useState({ 
    latitude: -6.914744, 
    longitude: 107.635873 
  });

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoordinates({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!description.trim()) {
      setFeedback({
        type: "error",
        message: "Deskripsi kejadian wajib diisi.",
      });
      return;
    }

    if (!address.trim()) {
      setFeedback({
        type: "error",
        message: "Nama jalan atau patokan lokasi wajib diisi.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      let imageURL = "";
      if (photoFile) {
        imageURL = await uploadFileToS3(photoFile);
      }

      const report = await createPublicReport({
        category,
        description: description.trim(),
        address: address.trim(),
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        image_url: imageURL,
      });

      setFeedback({
        type: "success",
        message: `Laporan berhasil dikirim dengan ID ${report.id}.`,
      });

      setDescription("");
      setAddress("");
      setPhotoFile(null);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Gagal mengirim laporan. Silakan coba lagi."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="reveal delay-2 rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-2xl backdrop-blur md:p-8">
      <form className="space-y-6" onSubmit={handleSubmit}>
        
        {/* PILIHAN KATEGORI (Baru) */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-800">Pilih Jenis Insiden</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setCategory("Kecelakaan")}
              className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                category === "Kecelakaan" 
                ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10" 
                : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
              }`}
            >
              <AlertCircle size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Kecelakaan</span>
            </button>
            <button
              type="button"
              onClick={() => setCategory("Kemacetan")}
              className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                category === "Kemacetan" 
                ? "border-secondary bg-secondary/5 text-secondary shadow-lg shadow-secondary/10" 
                : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
              }`}
            >
              <Car size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Kemacetan</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800">Deskripsi Kejadian</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 w-full rounded-xl border border-slate-300 p-4 text-sm outline-none focus:ring-4 focus:ring-primary/10" 
            placeholder={category === "Kecelakaan" ? "Contoh: Tabrakan dua motor..." : "Contoh: Pohon tumbang menutup jalan..."} 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800">Nama Jalan / Patokan Lokasi</label>
          <div className="relative">
            <Navigation className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:ring-4 focus:ring-primary/10"
              placeholder="Contoh: Depan Kampus Itenas, Jl. PHH. Mustofa"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800">Foto Kejadian (Opsional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setPhotoFile(file);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-primary/10"
          />
          {photoFile && (
            <p className="text-xs font-medium text-slate-500">File terpilih: {photoFile.name}</p>
          )}
        </div>

        {/* Bagian Peta Visual */}
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Titik Koordinat</h3>
            <button 
              type="button" 
              onClick={handleUseMyLocation}
              className="flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2 text-xs font-bold text-secondary transition hover:bg-secondary/20"
            >
              <LocateFixed className="h-4 w-4" /> Gunakan GPS
            </button>
          </div>

          <div className="relative h-[300px] w-full overflow-hidden rounded-2xl border-2 border-slate-200 shadow-inner bg-slate-200">
            <LocationPickerMap 
              latitude={coordinates.latitude} 
              longitude={coordinates.longitude} 
              onLocationChange={setCoordinates}
            />
          </div>
          
          <div className="flex items-center gap-2 text-[11px] text-slate-500 italic">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Pastikan pin merah tepat di atas posisi kejadian.</span>
          </div>
        </div>

        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 text-lg font-bold text-white transition hover:bg-primary active:scale-[0.98] shadow-xl shadow-slate-900/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <SendHorizontal className="h-5 w-5" />
          {isSubmitting ? "Mengirim Laporan..." : `Kirim Laporan ${category}`}
        </button>
      </form>
    </article>
  );
}