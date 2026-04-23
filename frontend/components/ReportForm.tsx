"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Camera,
  CheckCircle2,
  Loader2,
  LocateFixed,
  MapPin,
  SendHorizontal,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { simulateReportInsertToRds } from "@/lib/api/report-service";
import { uploadFileToS3 } from "@/lib/s3/upload-service";

const LocationPickerMap = dynamic(
  () => import("@/components/report/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Memuat peta...
      </div>
    ),
  },
);

type Coordinates = {
  latitude: number;
  longitude: number;
};

const INITIAL_COORDINATES: Coordinates = {
  latitude: -6.200000,
  longitude: 106.816666,
};

const MIN_DESCRIPTION_LENGTH = 20;

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

export default function ReportForm() {
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [coordinates, setCoordinates] =
    useState<Coordinates>(INITIAL_COORDINATES);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const photoPreviewUrl = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  );

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setPhotoFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("File harus berupa gambar (jpg, png, webp, dll).");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setPhotoFile(file);
  };

  const handleUseMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoMessage("Browser ini tidak mendukung Geolocation API.");
      return;
    }

    setGeoMessage(null);
    setErrorMessage(null);
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoMessage("Lokasi berhasil diambil. Geser pin bila kurang akurat.");
        setIsLocating(false);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Akses lokasi ditolak. Izinkan akses lokasi pada browser."
            : "Gagal mengambil lokasi. Coba lagi beberapa saat.";

        setGeoMessage(message);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  };

  const handleCoordinateChange =
    (field: keyof Coordinates) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const numericValue = Number(event.target.value);

      if (Number.isNaN(numericValue)) {
        return;
      }

      setCoordinates((previous) => ({
        ...previous,
        [field]: numericValue,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      setErrorMessage(
        `Deskripsi kejadian minimal ${MIN_DESCRIPTION_LENGTH} karakter agar kronologi jelas.`,
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    let photoUrl: string | undefined;

    try {
      if (photoFile) {
        setIsUploadingPhoto(true);

        try {
          photoUrl = await uploadFileToS3(photoFile);
        } catch {
          setGeoMessage(
            "Upload S3 tidak dapat dijangkau. Laporan tetap disimpan dalam mode simulasi tanpa URL foto.",
          );
        } finally {
          setIsUploadingPhoto(false);
        }
      }

      const result = await simulateReportInsertToRds({
        reporterName: "Pelapor Publik",
        description: description.trim(),
        location: `${formatCoordinate(coordinates.latitude)}, ${formatCoordinate(coordinates.longitude)}`,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        occurredAt: new Date().toISOString(),
        photoUrl,
      });

      setSuccessMessage(
        `Laporan ${result.reportId} berhasil disimpan (simulasi RDS) pada ${new Date(result.storedAt).toLocaleTimeString("id-ID")}.`,
      );
      setDescription("");
      setPhotoFile(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi masalah saat mengirim laporan.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
      setIsUploadingPhoto(false);
    }
  };

  return (
    <article
      id="lapor"
      className="reveal delay-2 rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_60px_rgba(20,35,66,0.2)] backdrop-blur md:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
            Form Publik
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Pelaporan Kecelakaan
          </h2>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Tanpa Login
        </span>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="deskripsi">
            Deskripsi Kejadian
          </label>
          <textarea
            id="deskripsi"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Contoh: tabrakan beruntun 2 mobil di jalur cepat, lalu lintas tersendat..."
            className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
          <p className="text-xs text-slate-500">
            Minimal {MIN_DESCRIPTION_LENGTH} karakter. Jelaskan kondisi korban, jalur, dan hambatan.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="foto-kecelakaan">
            Upload Foto Bukti
          </label>
          <label
            htmlFor="foto-kecelakaan"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            <Camera className="h-4 w-4" />
            Pilih Foto
          </label>
          <input
            id="foto-kecelakaan"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="sr-only"
          />

          {photoPreviewUrl ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Image
                src={photoPreviewUrl}
                alt="Preview foto kecelakaan"
                width={768}
                height={320}
                unoptimized
                className="h-44 w-full object-cover"
              />
            </div>
          ) : (
            <p className="text-xs text-slate-500">Belum ada foto dipilih.</p>
          )}
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-800">Lokasi Real-time</p>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-secondary/25 bg-secondary/10 px-3 py-2 text-xs font-semibold text-secondary transition hover:bg-secondary/15 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLocating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="h-4 w-4" />
              )}
              Gunakan Lokasi Saya
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Latitude
              <input
                type="number"
                step="0.000001"
                value={coordinates.latitude}
                onChange={handleCoordinateChange("latitude")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Longitude
              <input
                type="number"
                step="0.000001"
                value={coordinates.longitude}
                onChange={handleCoordinateChange("longitude")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>
          </div>

          <div className="h-56 overflow-hidden rounded-xl border border-slate-300">
            <LocationPickerMap
              latitude={coordinates.latitude}
              longitude={coordinates.longitude}
              onLocationChange={setCoordinates}
            />
          </div>

          <p className="inline-flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Klik peta atau geser pin untuk koreksi titik lokasi.
          </p>
        </div>

        {geoMessage ? <p className="text-xs text-secondary">{geoMessage}</p> : null}
        {errorMessage ? <p className="text-xs text-red-600">{errorMessage}</p> : null}
        {successMessage ? (
          <p className="inline-flex items-center gap-2 text-xs text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {successMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-5 text-sm font-semibold text-on-primary-container shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
          {isSubmitting
            ? isUploadingPhoto
              ? "Upload ke S3..."
              : "Menyimpan ke RDS (simulasi)..."
            : "Kirim Laporan"}
        </button>
      </form>
    </article>
  );
}
