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
      {/* Background Decor */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-drift absolute -left-24 top-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="animate-drift absolute -right-20 top-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl [animation-delay:1.5s]" />
        <div className="animate-drift absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-tertiary/15 blur-3xl [animation-delay:3s]" />
      </div>

      {/* Hero Section */}
      <section id="beranda" className="scroll-mt-32 px-5 pb-20 pt-10 md:pt-16">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <span className="reveal inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.16em] text-primary">
              <Siren className="h-4 w-4" /> Siaga 24/7
            </span>

            <div className="space-y-5">
              <h1 className="reveal delay-1 text-balance text-4xl font-extrabold leading-[1.03] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Respon Insiden Jalan <span className="mt-1 block text-primary">Dalam Hitungan Menit</span>
              </h1>
              <p className="reveal delay-2 max-w-xl text-lg leading-8 text-slate-600">
                Platform terpadu untuk laporan warga, validasi lokasi kejadian, dan distribusi informasi ke tim tanggap terdekat secara real-time.
              </p>
            </div>

            <div className="reveal delay-3 flex flex-col gap-4 sm:flex-row">
              <Link href="/lapor" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-primary/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                <AlertTriangle className="h-5 w-5" /> Lapor Insiden
              </Link>
              <Link href="#peta" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-secondary/50 px-8 text-base font-semibold text-secondary transition duration-300 hover:-translate-y-0.5 hover:bg-secondary/10">
                <MapPinned className="h-5 w-5" /> Pantau Hotspot
              </Link>
            </div>

            <div className="reveal delay-4 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Clock3, val: "8.4 Menit", desc: "Rata-rata respon", color: "text-primary" },
                { icon: ShieldCheck, val: "100% Valid", desc: "Verifikasi posko", color: "text-secondary" },
                { icon: Siren, val: "24/7 Online", desc: "Tanpa jeda", color: "text-tertiary" }
              ].map((item, i) => (
                <article key={i} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <p className="mt-2 text-xl font-bold text-slate-900">{item.val}</p>
                  <p className="text-xs text-slate-600">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>

          {/* Command Center Card */}
          <div className="reveal delay-2 relative">
            <div className="pointer-events-none absolute -inset-5 -z-10 rounded-[36px] bg-gradient-to-br from-primary/18 via-white/5 to-secondary/20 blur-2xl" />
            <article className="overflow-hidden rounded-[30px] border border-white/70 bg-white/90 shadow-2xl backdrop-blur">
              <div className="relative overflow-hidden bg-slate-900 p-6 text-white md:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Live Command Center</p>
                <h2 className="mt-2 text-2xl font-bold">Prioritas insiden saat ini</h2>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[10px] text-white/60 uppercase">Aktif</p>
                    <p className="text-xl font-bold text-white">12</p>
                  </div>
                  <div className="rounded-xl bg-red-500/20 p-3 border border-red-500/30">
                    <p className="text-[10px] text-red-300 uppercase">Kritis</p>
                    <p className="text-xl font-bold text-red-400">4</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[10px] text-white/60 uppercase">Posko</p>
                    <p className="text-xl font-bold text-white">8</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center text-red-600"><AlertTriangle size={16}/></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">Kecelakaan Sudirman</p><p className="text-xs text-slate-500">2 menit lalu</p></div>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">KRITIS</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Map Hotspot Section */}
      <section id="peta" className="scroll-mt-32 border-y border-slate-200 bg-white/50 px-5 py-20 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl text-center space-y-10">
          <div className="reveal space-y-3">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Peta Rawan</p>
            <h2 className="text-3xl font-bold md:text-4xl">Area kecelakaan terkini</h2>
          </div>
          <div className="reveal delay-1 relative h-[500px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-2xl">
            <div className="ambient-grid absolute inset-0 opacity-40" />
            {hotspots.map((spot, index) => (
              <div key={spot.name} className="group absolute cursor-pointer" style={{ left: spot.left, top: spot.top }}>
                <span className="dot-ping" style={{ animationDelay: `${index * 0.5}s` }} />
                <div className="relative h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <AlertTriangle size={16} />
                </div>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-white p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs text-left border border-slate-100">
                  <p className="font-bold text-slate-900">{spot.name}</p>
                  <p className="text-slate-500">{spot.reports}</p>
                </div>
              </div>
            ))}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                <button className="h-10 w-10 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full text-white font-bold border border-white/20">+</button>
                <button className="h-10 w-10 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full text-white font-bold border border-white/20">-</button>
            </div>
          </div>
        </div>
      </section>

      {/* Hotline Footer */}
      <section id="kontak" className="px-5 py-20">
        <div className="reveal mx-auto max-w-7xl rounded-[2rem] bg-slate-900 p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl font-bold">Butuh Bantuan Darurat?</h2>
            <p className="text-slate-400">Tim kami siaga 24 jam untuk membantu evakuasi dan koordinasi medis.</p>
          </div>
          <Link href="tel:112" className="h-16 px-10 bg-red-600 hover:bg-red-700 rounded-2xl flex items-center gap-3 text-lg font-bold shadow-xl shadow-red-600/20 transition-all active:scale-95">
            <Siren /> Hubungi 112
          </Link>
        </div>
      </section>
    </div>
  );
}