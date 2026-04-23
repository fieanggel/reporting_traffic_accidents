import Link from "next/link";
import { ArrowLeft, FileWarning } from "lucide-react";
import ReportForm from "@/components/ReportForm";

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-5 pb-16 pt-8 md:pt-12">
      <section className="mx-auto w-full max-w-5xl space-y-8">
        <div className="rounded-3xl border border-white bg-white/80 p-6 shadow-sm backdrop-blur md:p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <FileWarning className="h-4 w-4" /> Halaman Report
            </div>
            <h1 className="text-3xl font-black text-slate-900 md:text-4xl">Laporkan Kecelakaan</h1>
            <p className="max-w-2xl text-slate-600">
              Bantu tim respon bergerak cepat dengan memberikan data lokasi dan kronologi yang akurat.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl">
          <ReportForm />
        </div>
      </section>
    </div>
  );
}