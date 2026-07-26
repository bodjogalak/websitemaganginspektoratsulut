"use client";

import { useEffect, useState } from "react";
import { Users, Clock, CheckCircle2, AlertCircle, FolderCode, CalendarCheck } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Definisikan tipe struktur data peserta dari database
interface Participant {
  id: number;
  name?: string;
  email?: string;
  phone?: string;  // tambahkan ini
  agency?: string; // tambahkan ini
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalInterns: 0,
    presentToday: 0,
    pendingPermissions: 0,
    pendingApplications: 0,
    totalProjects: 0,
    allParticipants: [] as Participant[] // Tambahkan array penampung data peserta di sini
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
            const data = await res.json();
            setStats(data);
        }
      } catch (e) {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);


   // Function to generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();

    // --- BAGIAN 1: JUDUL UTAMA ---
    doc.setFontSize(18);
    doc.text("Laporan Rekapitulasi Peserta Magang", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString("id-ID")}`, 14, 27);

    // --- BAGIAN 2: TABEL RINGKASAN AKTIVITAS ---
    doc.setFontSize(12);
    doc.text("Ringkasan Aktivitas Aktivitas Magang", 14, 38);

    const summaryColumns = ["Kategori", "Jumlah"];
    const summaryRows = [
      ["Peserta Mahasiswa mendaftar (Hadir Hari Ini)", `${stats.presentToday} / ${stats.totalInterns}`],
      ["Pendaftar Baru yang belum di acc(disetujui)/terima", stats.pendingApplications.toString()],
    ];

    autoTable(doc, {
      startY: 43,
      head: [summaryColumns],
      body: summaryRows,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] }, // Warna biru
      margin: { bottom: 15 }
    });

    // Ambil batas koordinat bawah tabel pertama agar tabel kedua tidak menumpuk berantakan
    const finalY = (doc as any).lastAutoTable?.finalY || 70;

    // --- BAGIAN 3: TABEL RINCIAN PESERTA (DARI DATABASE PRISMA) ---
    doc.setFontSize(12);
    doc.text("Daftar Detail Seluruh Peserta Magang", 14, finalY + 12);

    // Tambahkan kolom "No. HP" dan "Instansi/Sekolah" di header tabel
    const participantColumns = ["ID", "Nama Peserta", "Email", "No. HP", "Instansi/Sekolah"];
    
    // Looping data array dari state stats untuk diubah menjadi baris tabel (termasuk phone & agency)
    const participantRows = (stats.allParticipants || []).map((peserta: any) => [
      peserta.id.toString(),
      peserta.name || "-",
      peserta.email || "-",
      peserta.phone || "-",  // <-- Menampilkan data phone
      peserta.agency || "-"   // <-- Menampilkan data agency
    ]);

    autoTable(doc, {
      startY: finalY + 18,
      head: [participantColumns],
      body: participantRows,
      theme: "striped", // Desain baris selang-seling agar terlihat profesional
      headStyles: { fillColor: [14, 122, 150] }, // Menyesuaikan warna gradasi teal dashboard Anda (#0e7a96)
      styles: { fontSize: 9 }, // Ukuran font sedikit dikecilkan ke 9 agar kolom yang banyak tidak terpotong ke samping
    });

    // Simpan PDF ke komputer admin
    doc.save("rekap-peserta-magang.pdf");
  };


  
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Control Panel</h1>
        <p className="text-gray-500 text-sm">Overview aktivitas peserta magang hari ini.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Hadir Hari Ini */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hadir Hari Ini</p>
                <h2 className="text-3xl font-bold text-gray-800">
                    {loading ? "-" : stats.presentToday}
                    <span className="text-sm text-gray-400 font-normal ml-1">/ {stats.totalInterns}</span>
                </h2>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <CalendarCheck size={24} />
            </div>
        </div>

        {/* Card 2: Izin Menunggu */}
        <Link href="/admin/permissions" className="group">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group-hover:border-blue-200 transition">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-blue-500">Izin Pending</p>
                    <h2 className="text-3xl font-bold text-gray-800 group-hover:text-blue-600">
                        {loading ? "-" : stats.pendingPermissions}
                    </h2>
                </div>
                <div className={`p-3 rounded-xl ${stats.pendingPermissions > 0 ? 'bg-yellow-50 text-yellow-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
                    <Clock size={24} />
                </div>
            </div>
        </Link>

        {/* Card 3: Pendaftar Baru */}
        <Link href="/admin/applications" className="group">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group-hover:border-blue-200 transition">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-blue-500">Pendaftar Baru</p>
                    <h2 className="text-3xl font-bold text-gray-800 group-hover:text-blue-600">
                        {loading ? "-" : stats.pendingApplications}
                    </h2>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Users size={24} />
                </div>
            </div>
        </Link>

        {/* Card 4: Total Project */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Project</p>
                <h2 className="text-3xl font-bold text-gray-800">
                    {loading ? "-" : stats.totalProjects}
                </h2>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <FolderCode size={24} />
            </div>
        </div>

        {/* Header dengan Tombol Download */}
        <div className="flex justify-between items-center">
          <button
            onClick={generatePDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            Cetak bentuk PDFnya
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS / INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#1193b5] to-[#0e7a96] rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Halo, Admin! 👋</h3>
            <p className="text-blue-100 text-sm mb-6 max-w-md">
                Jangan lupa untuk memeriksa permohonan izin dan absensi harian peserta magang.
            </p>
            <div className="flex gap-3">
                <Link href="/admin/permissions" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm transition">
                    Cek Izin ({stats.pendingPermissions})
                </Link>
                <Link href="/admin/applications" className="bg-white text-[#1193b5] hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold shadow-md transition">
                    Review Pendaftar ({stats.pendingApplications})
                </Link>
            </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="mb-2 p-3 bg-gray-50 rounded-full text-gray-400">
                <FolderCode size={24}/>
             </div>
             <h3 className="font-bold text-gray-800">Project Repository</h3>
             <p className="text-gray-500 text-xs mt-1 mb-4">Pantau hasil karya peserta magang.</p>
             <Link href="/admin/projects" className="text-[#1193b5] text-sm font-bold hover:underline">
                Lihat Semua Project ({stats.totalProjects})
             </Link>
        </div>
      </div>
    </div>
  );
}

