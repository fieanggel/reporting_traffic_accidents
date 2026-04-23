"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, CheckCircle2, Clock, Users, TrendingUp, 
  UserCircle, Plus, X, UserPlus, Lock, Mail, Trash2, Edit3
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import { getDashboardStats, DashboardStats } from "@/lib/api/stats-service";
import { apiFetch, getErrorMessage } from "@/lib/api/client";
import { getSession } from "@/lib/auth/session";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({ name: "User", role: "Admin" });
  
  // State untuk Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formOfficer, setFormOfficer] = useState({ name: "", username: "", password: "", role: "officer" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    const session = getSession(); 
    if (!session?.token) {
      setLoading(false);
      return;
    }

    if (session.user) {
      setUserProfile({
        name: session.user.name || "Admin",
        role: session.user.role || "Super Admin"
      });
    }

    try {
      const data = await getDashboardStats(session.token);
      setStats(data);
    } catch (err) {
      console.error("Gagal load data dashboard:", getErrorMessage(err, "Error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  // Fungsi Buka Modal Tambah
  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormOfficer({ name: "", username: "", password: "", role: "officer" });
    setIsModalOpen(true);
  };

  // Fungsi Buka Modal Edit
  const openEditModal = (officer: any) => {
    setIsEditMode(true);
    setSelectedId(officer.id);
    setFormOfficer({ 
      name: officer.name, 
      username: officer.username, 
      password: "", // Password dikosongkan saat edit kecuali mau diupdate
      role: officer.role 
    });
    setIsModalOpen(true);
  };

  // Fungsi Submit (Create atau Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const session = getSession();

    try {
      const url = isEditMode ? `/admin/officers/${selectedId}` : "/admin/officers";
      const method = isEditMode ? "PUT" : "POST";

      await apiFetch(url, {
        method: method,
        token: session?.token,
        body: JSON.stringify(formOfficer),
      });

      setIsModalOpen(false);
      fetchData();
      alert(isEditMode ? "Data petugas diperbarui!" : "Petugas berhasil ditambahkan!");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memproses data"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi Hapus
  const handleDeleteOfficer = async (id: number) => {
    if (!confirm("Yakin mau hapus petugas ini?")) return;
    const session = getSession();
    try {
      await apiFetch(`/admin/officers/${id}`, {
        method: "DELETE",
        token: session?.token,
      });
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus petugas"));
    }
  };

  if (!mounted) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 p-6 rounded-[2rem] border border-white/60 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
            <UserCircle size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{userProfile.name}</h2>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{userProfile.role} Center</p>
          </div>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg hover:bg-primary flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={18} /> Tambah Petugas
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Insiden" value={loading ? "..." : String(stats?.summary?.total_incidents || 0)} icon={AlertCircle} color="text-primary" bg="bg-primary/10" />
        <StatsCard title="Petugas Aktif" value={loading ? "..." : String(stats?.summary?.active_officers || 0)} icon={Users} color="text-blue-600" bg="bg-blue-100" />
        <StatsCard title="Pending" value={loading ? "..." : String(stats?.summary?.pending || 0)} icon={Clock} color="text-amber-600" bg="bg-amber-100" />
        <StatsCard title="Resolved" value={loading ? "..." : String(stats?.summary?.resolved || 0)} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-100" />
      </div>

      {/* OFFICER TABLE */}
      <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
          <Users className="text-primary" /> Manajemen Petugas
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="pb-4">Nama Petugas</th>
                <th className="pb-4">Username</th>
                <th className="pb-4">Role</th>
                <th className="pb-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats?.officers && stats.officers.length > 0 ? (
                stats.officers.map((off: any) => (
                  <tr key={off.id} className="group hover:bg-slate-50 transition">
                    <td className="py-4 font-bold text-slate-800">{off.name}</td>
                    <td className="py-4 text-sm text-slate-500">{off.username}</td>
                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-500">
                        {off.role}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(off)}
                          className="p-2 text-slate-300 hover:text-blue-500 transition-colors"
                        >
                          <Edit3 size={18}/>
                        </button>
                        <button 
                          onClick={() => handleDeleteOfficer(off.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-10 text-center text-slate-400 italic">Belum ada data petugas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (CREATE & EDIT) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">{isEditMode ? "Edit Data Petugas" : "Registrasi Petugas"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input required className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                      value={formOfficer.name} onChange={(e) => setFormOfficer({...formOfficer, name: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input required className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                      value={formOfficer.username} onChange={(e) => setFormOfficer({...formOfficer, username: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    {isEditMode ? "Password (Kosongkan jika tidak diubah)" : "Password"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input required={!isEditMode} type="password" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                      value={formOfficer.password} onChange={(e) => setFormOfficer({...formOfficer, password: e.target.value})} />
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="w-full py-4 mt-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? "Sedang Memproses..." : isEditMode ? "Simpan Perubahan" : "Daftarkan Petugas"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatsCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-2xl ${bg} ${color} flex items-center justify-center`}><Icon size={24} /></div>
      <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p><p className="text-2xl font-black text-slate-900">{value}</p></div>
    </div>
  );
}