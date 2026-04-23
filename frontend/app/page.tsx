import Link from "next/link";
import {
  AlertTriangle,
  BellRing,
  Clock3,
  MapPinned,
  ShieldCheck,
  Siren,
  Zap,
} from "lucide-react";

const hotspots = [
  { name: "Sudirman", reports: "12 laporan", left: "26%", top: "34%" },
  { name: "Tomang", reports: "8 laporan", left: "58%", top: "45%" },
  { name: "Kuningan", reports: "5 laporan", left: "72%", top: "25%" },
];

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden pb-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="animate-drift absolute -left-24 top-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="animate-drift absolute -right-20 top-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl [animation-delay:1.5s]" />
        <div className="animate-drift absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-tertiary/15 blur-3xl [animation-delay:3s]" />
      </div>

      <section id="beranda" className="scroll-mt-32 px-5 pb-20 pt-10 md:pt-16">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <span className="reveal inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.16em] text-primary">
              <Siren className="h-4 w-4" />
              Siaga 24/7
            </span>

            <div className="space-y-5">
              <h1 className="reveal delay-1 text-balance text-4xl font-extrabold leading-[1.03] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Respon Insiden Jalan
                <span className="mt-1 block text-primary">Dalam Hitungan Menit</span>
              </h1>
              <p className="reveal delay-2 max-w-xl text-lg leading-8 text-on-surface-variant">
                Platform terpadu untuk laporan warga, validasi lokasi kejadian,
                dan distribusi informasi ke tim tanggap terdekat secara real-time.
              </p>
            </div>

            <div className="reveal delay-3 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/lapor"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary-container px-8 text-base font-semibold text-on-primary-container shadow-lg shadow-primary/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <AlertTriangle className="h-5 w-5" />
                Lapor Insiden
              </Link>
              <Link
                href="#peta"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-secondary/50 px-8 text-base font-semibold text-secondary transition duration-300 hover:-translate-y-0.5 hover:bg-secondary/10"
              >
                <MapPinned className="h-5 w-5" />
                Pantau Hotspot
              </Link>
            </div>

            <div className="reveal delay-4 grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm shadow-slate-300/30 backdrop-blur">
                <Clock3 className="h-4 w-4 text-primary" />
                <p className="mt-2 text-xl font-bold text-slate-900">8.4 Menit</p>
                <p className="text-xs leading-6 text-slate-600">Rata-rata waktu respon</p>
              </article>

              <article className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm shadow-slate-300/30 backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                <p className="mt-2 text-xl font-bold text-slate-900">100% Valid</p>
                <p className="text-xs leading-6 text-slate-600">Verifikasi posko aktif</p>
              </article>

              <article className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm shadow-slate-300/30 backdrop-blur">
                <Siren className="h-4 w-4 text-tertiary" />
                <p className="mt-2 text-xl font-bold text-slate-900">24/7 Online</p>
                <p className="text-xs leading-6 text-slate-600">Pemantauan tanpa jeda</p>
              </article>
            </div>
          </div>

          <div className="reveal delay-2 relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-5 -z-10 rounded-[36px] bg-gradient-to-br from-primary/18 via-white/5 to-secondary/20 blur-2xl"
            />

            <article className="overflow-hidden rounded-[30px] border border-white/70 bg-white/90 shadow-[0_24px_60px_rgba(20,35,66,0.2)] backdrop-blur">
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#243b6b] to-primary p-6 text-white md:p-7">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
                <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-secondary/30 blur-2xl" />

                <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  Live Command Center
                </p>
                <h2 className="relative mt-2 text-3xl font-bold tracking-tight">
                  Prioritas insiden kota saat ini
                </h2>
                <p className="relative mt-3 text-sm leading-7 text-white/85">
                  Data laporan masuk disusun berdasarkan urgensi agar tim lapangan
                  dapat bergerak lebih cepat pada area dengan risiko tertinggi.
                </p>

                <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.12em] text-white/70">Aktif</p>
                    <p className="mt-1 text-2xl font-bold">12</p>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.12em] text-white/70">Kritis</p>
                    <p className="mt-1 text-2xl font-bold">4</p>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.12em] text-white/70">Posko Standby</p>
                    <p className="mt-1 text-2xl font-bold">8</p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Insiden Prioritas
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-outline-variant/50 bg-surface-container-low/70 p-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        Kecelakaan beruntun - Sudirman
                      </p>
                      <p className="truncate text-xs text-slate-600">
                        Diteruskan ke posko terdekat • 2 menit lalu
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
                      Kritis
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-outline-variant/50 bg-surface-container-low/70 p-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                      <MapPinned className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        Titik padat - Tomang arah barat
                      </p>
                      <p className="truncate text-xs text-slate-600">
                        Rute dialihkan oleh sistem • 5 menit lalu
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary">
                      Tinggi
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/lapor"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-container px-4 text-sm font-semibold text-on-primary-container shadow-lg shadow-primary/25 transition hover:-translate-y-0.5"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Buat Laporan
                  </Link>
                  <Link
                    href="#peta"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-secondary/40 px-4 text-sm font-semibold text-secondary transition hover:bg-secondary/10"
                  >
                    <MapPinned className="h-4 w-4" />
                    Lihat Semua Titik
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="layanan" className="scroll-mt-28 px-5 py-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="reveal mb-8 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Layanan Utama
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Dari laporan warga ke tindakan lapangan
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <article className="reveal delay-1 rounded-2xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-300/30 backdrop-blur">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Siren className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Laporan Instan</h3>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Pengguna dapat mengirim kejadian hanya dalam beberapa detik dengan
                dukungan lokasi otomatis.
              </p>
            </article>

            <article className="reveal delay-2 rounded-2xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-300/30 backdrop-blur">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <BellRing className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Notifikasi Zona</h3>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Sistem memberi peringatan saat Anda mendekati area dengan tingkat
                kecelakaan tinggi.
              </p>
            </article>

            <article className="reveal delay-3 rounded-2xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-300/30 backdrop-blur">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-tertiary/10 text-tertiary">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Prioritas Respon</h3>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Algoritma memprioritaskan insiden kritis agar tim respon bergerak
                lebih tepat dan cepat.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        id="peta"
        className="scroll-mt-32 border-y border-slate-200/70 bg-white/75 px-5 py-20 backdrop-blur"
      >
        <div className="mx-auto w-full max-w-7xl space-y-10">
          <div className="reveal space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Peta Rawan
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Area kecelakaan terkini di kota
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-7 text-on-surface-variant">
              Pantau konsentrasi insiden untuk menentukan rute paling aman sebelum
              memulai perjalanan.
            </p>
          </div>

          <div className="grid items-stretch gap-6 lg:grid-cols-12">
            <article className="reveal delay-1 relative overflow-hidden rounded-3xl border border-outline-variant bg-slate-900 shadow-2xl shadow-slate-900/20 lg:col-span-8">
              <div className="ambient-grid absolute inset-0 opacity-70" />
              <div className="absolute left-6 top-6 rounded-lg border border-white/25 bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                Live Hotspots
              </div>

              <div className="h-[470px]">
                {hotspots.map((spot, index) => (
                  <div
                    key={spot.name}
                    className="group absolute"
                    style={{ left: spot.left, top: spot.top }}
                  >
                    <span
                      className="dot-ping"
                      style={{ animationDelay: `${index * 0.45}s` }}
                    />
                    <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/35">
                      <AlertTriangle className="h-4 w-4" />
                    </span>

                    <div className="pointer-events-none absolute left-9 top-1/2 w-max -translate-y-1/2 rounded-lg border border-white/20 bg-slate-950/70 px-3 py-2 text-xs text-white opacity-0 transition duration-300 group-hover:opacity-100">
                      <p className="font-semibold">{spot.name}</p>
                      <p className="text-white/75">{spot.reports}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-6 right-6 flex gap-2">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="Perbesar peta"
                >
                  +
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="Perkecil peta"
                >
                  -
                </button>
              </div>
            </article>

            <aside className="space-y-5 lg:col-span-4">
              <article className="reveal delay-2 rounded-3xl border border-outline-variant bg-surface-container p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Update 1 Menit Lalu
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">Ringkasan Kota</h3>

                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-outline-variant/50 bg-white p-4">
                    <p className="text-sm text-slate-600">Kecelakaan Aktif</p>
                    <p className="mt-1 text-3xl font-bold text-primary">12</p>
                  </div>
                  <div className="rounded-xl border border-outline-variant/50 bg-white p-4">
                    <p className="text-sm text-slate-600">Titik Kemacetan</p>
                    <p className="mt-1 text-3xl font-bold text-secondary">45</p>
                  </div>
                </div>
              </article>

              <article className="reveal delay-3 rounded-3xl bg-primary p-6 text-white shadow-lg shadow-primary/25">
                <h3 className="text-2xl font-bold">Terjebak di Area Rawan?</h3>
                <p className="mt-3 text-sm leading-7 text-white/85">
                  Aktifkan notifikasi pintar dan dapatkan peringatan sebelum memasuki
                  zona dengan potensi kecelakaan tinggi.
                </p>
                <button
                  type="button"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-white/90"
                >
                  Aktifkan Notifikasi
                </button>
              </article>
            </aside>
          </div>
        </div>
      </section>

      <section id="kontak" className="scroll-mt-28 px-5 pb-8 pt-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="reveal rounded-3xl border border-white/70 bg-gradient-to-r from-primary to-primary-container p-8 text-white shadow-2xl shadow-primary/25 md:p-10">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  Kontak Darurat
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  Tim kami siap membantu kapan pun Anda membutuhkan.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 md:text-base">
                  Kirim laporan detail atau langsung hubungi hotline agar petugas,
                  ambulans, dan pihak terkait bisa segera menuju lokasi.
                </p>
              </div>
              <Link
                href="tel:112"
                className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 text-sm font-bold uppercase tracking-[0.14em] text-primary transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Hubungi Darurat 112
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-5 pb-8 pt-4">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-200 py-6 text-center text-sm text-slate-600 md:flex-row md:text-left">
          <p>ResponCepat © 2026. Melayani dengan sigap dan akurat.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="transition hover:text-primary">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="transition hover:text-primary">
              Syarat Ketentuan
            </Link>
            <Link href="#" className="transition hover:text-primary">
              Pusat Bantuan
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
