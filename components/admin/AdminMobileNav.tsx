"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    Menu,
    X,
    LayoutDashboard,
    FileText,
    Users,
    LogOut,
    Shield,
    ClipboardCheck,
    CalendarDays,
    FolderCode
} from "lucide-react"; 
import { signOut } from "next-auth/react";
import { Session } from "next-auth";

export default function AdminMobileNav({ session }: { session: Session | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/applications", label: "Permohonan", icon: FileText },
    { href: "/admin/permissions", label: "Izin & Absensi", icon: ClipboardCheck }, 
    { href: "/admin/users", label: "Pengguna", icon: Users },
    { href: "/admin/attendance", label: "Rekap Absensi", icon: CalendarDays },
    { href: "/admin/projects", label: "Project Monitor", icon: FolderCode },
    { href: "/admin/sertifikat", label: "Buat Sertifikat", icon: FileText }, 
  ];

  return (
    <>
      {/* 1. Mobile Top Bar (Visible only on Mobile) */}
      <div className="md:hidden bg-[#1e293b] text-white p-4 flex justify-between items-center shadow-md shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="bg-blue-500 p-1.5 rounded-lg">
              <Shield size={18} className="text-white"/>
           </div>
           <h1 className="font-bold text-base tracking-wide">Admin Panel</h1>
        </div>
        {/* Hamburger Button */}
        <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-white/10 rounded-lg transition">
          <Menu size={24} />
        </button>
      </div>

      {/* 2. Backdrop & Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex flex-col w-full max-w-xs bg-[#1e293b] text-white h-full p-4 shadow-xl z-10 overflow-y-auto">
            {/* Close Button */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X size={24} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-blue-600 text-white" 
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div>
  <div className="p-4 border-t border-gray-700">
  {/* Mengubah <button> menjadi <a> */}
  <a
    href="/" 
    onClick={(e) => {
      e.preventDefault(); // Wajib ditambahkan agar tidak langsung mental ke localhost saat di-klik
      signOut({ callbackUrl: "/" });
    }}
    className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition text-sm font-medium cursor-pointer"
  >
    <LogOut size={18} />
    Keluar
  </a>
</div>

</div>

          </div>
        </div>
      )}
    </>
  );
}
