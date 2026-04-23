"use client";

import { motion } from "framer-motion";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Users, 
  TrendingUp, 
  Siren, 
  UserCircle,
  Plus,
  Search,
  MoreHorizontal
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Data simulasi kategori insiden
const categoryData = [
  { name: 'Kecelakaan', value: 65, color: '#af101a' }, // Merah Primary
  { name: 'Kemacetan', value: 35, color: '#005faf' },  // Biru Secondary
];

const weeklyData = [
  { day: 'Sen', kecelakaan: 12, macet: 18 },
  { day: 'Sel', kecelakaan: 19, macet: 12 },
  { day: 'Rab', kecelakaan: 15, macet: 25 },
  { day: 'Kam', kecelakaan: 22, macet: 10 },
  { day: 'Jum', kecelakaan: 30, macet: 15 },
];

export default function DashboardPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      {/* HEADER USER BARU */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 p-6 rounded-[2rem] border border-white/60 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white shadow-lg">
              <UserCircle size={32} strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Raelqiansyah P.</h2>
            <p className="text-xs font-bold text-primary uppercase tracking-[0.1em]">Super Admin Center</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Server</p>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              RDS Connected
            </div>
          </div>
          <button className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-primary transition-all flex items-center gap-2">
            <Plus size={18} /> Tambah Petugas
          </button>
        </div>
      </div>

      {/* STATS QUICK VIEW */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Insiden" value="128" icon={AlertCircle} color="text-primary" bg="bg-primary/10" />
        <StatsCard title="Petugas Aktif" value="24" icon={Users} color="text-blue-600" bg="bg-blue-100" />
        <StatsCard title="Pending" value="08" icon={Clock} color="text-amber-600" bg="bg-amber-100" />
        <StatsCard title="Resolved" value="96" icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-100" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* GRAFIK KATEGORI (KECELAKAN VS MACET) */}
        <div className="rounded-[2.5rem] border border-white/70 bg-white/80 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> Kategori Insiden
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs font-bold text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GRAFIK MINGGUAN */}
        <div className="lg:col-span-2 rounded-[2.5rem] border border-white/70 bg-white/80 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Analisis Mingguan</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="kecelakaan" fill="#af101a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="macet" fill="#005faf" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CRUD PETUGAS PREVIEW */}
      <div className="rounded-[2.5rem] border border-white/70 bg-white/80 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h3 className="text-xl font-bold text-slate-900">Manajemen Petugas Lapangan</h3>
          <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Cari petugas..." />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="pb-4">Nama Petugas</th>
                <th className="pb-4">ID Anggota</th>
                <th className="pb-4">Wilayah Tugas</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <OfficerRow name="Bripda Ahmad" id="POL-8821" zone="Sudirman" status="On Duty" />
              <OfficerRow name="Bripka Siti" id="POL-8822" zone="Tomang" status="Standby" />
              <OfficerRow name="Aiptu Bambang" id="POL-8823" zone="Kuningan" status="Break" />
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// Komponen Helper
function StatsCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/20 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-2xl ${bg} ${color} flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function OfficerRow({ name, id, zone, status }: any) {
  const statusColor = status === "On Duty" ? "text-emerald-500 bg-emerald-50" : status === "Standby" ? "text-blue-500 bg-blue-50" : "text-slate-400 bg-slate-50";
  return (
    <tr className="group hover:bg-slate-50/50 transition">
      <td className="py-4 font-bold text-slate-800">{name}</td>
      <td className="py-4 text-sm text-slate-500">{id}</td>
      <td className="py-4 text-sm text-slate-600">{zone}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor}`}>{status}</span>
      </td>
      <td className="py-4 text-right">
        <button className="p-2 text-slate-300 hover:text-slate-600 transition">
          <MoreHorizontal size={20} />
        </button>
      </td>
    </tr>
  );
}