"use client";

import { useState, useRef, useEffect } from "react";
import Dashboard from "./dashboard";
import StoreRoom from "./store-room";
import Donations from "./donations";
import CategoriesDepartments from "./categories-departments";
import { LayoutDashboard, Package2, Menu, Bell, Calendar, Search, PanelLeftClose, PanelLeft, Bot, LogOut, HeartHandshake, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

type Tab = "dashboard" | "storeroom" | "donations" | "categories";

export default function Admin() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; max-age=0; SameSite=Strict";
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">

      {/* SIDEBAR */}
      <aside
        className={`transition-all duration-500 ease-in-out bg-[#1E314D] border-r border-[#1E314D]/10 flex flex-col relative z-50
        ${collapsed ? "w-[80px]" : "w-[280px]"}`}
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 h-24 px-6 mb-4 border-b border-white/10">
          <div className="bg-primary min-w-10 min-h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-[#1E314D] font-black text-xl tracking-tighter">C.</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-in fade-in zoom-in duration-300">
              <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1">CARE</h1>
              <p className="text-[10px] uppercase tracking-widest text-primary/80 font-bold">Workspace</p>
            </div>
          )}
        </div>

        {/* NAV */}
        <nav className="flex flex-col gap-2 px-4">
          <SidebarItem
            label="Dashboard"
            icon={<LayoutDashboard size={20} strokeWidth={2.5} />}
            collapsed={collapsed}
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <SidebarItem
            label="Store Room"
            icon={<Package2 size={20} strokeWidth={2.5} />}
            collapsed={collapsed}
            active={activeTab === "storeroom"}
            onClick={() => setActiveTab("storeroom")}
          />
          <SidebarItem
            label="Donations"
            icon={<HeartHandshake size={20} strokeWidth={2.5} />}
            collapsed={collapsed}
            active={activeTab === "donations"}
            onClick={() => setActiveTab("donations")}
          />
          <SidebarItem
            label="Department/Category"
            icon={<Layers size={20} strokeWidth={2.5} />}
            collapsed={collapsed}
            active={activeTab === "categories"}
            onClick={() => setActiveTab("categories")}
          />
        </nav>

        {/* BOTTOM AREA */}
        <div className="mt-auto p-4 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95"
          >
            {collapsed ? <PanelLeft size={20} /> : (
              <>
                <PanelLeftClose size={18} />
                <span className="font-bold text-sm">Collapse Menu</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">

        {/* TOP BAR */}
        <header className="h-24 sticky top-0 z-40 flex justify-between items-center px-8 bg-white/60 backdrop-blur-xl border-b border-border/40 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">

          {/* LEFT */}
          <div className="flex items-center gap-4">
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="bg-primary/20 text-primary p-2 rounded-xl hover:bg-primary/30 transition-colors"
              >
                <Menu size={24} />
              </button>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                <Search size={18} strokeWidth={2.5} />
              </div>
              <input
                placeholder="Search resources, animals..."
                className="bg-white px-12 py-3.5 rounded-full w-[320px] outline-none border-2 border-border/50 hover:border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-muted-foreground/50 shadow-sm"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex gap-3 items-center">
            <div className="h-8 w-[2px] bg-border/50 mx-2"></div>
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-foreground leading-tight">Admin User</p>
                  <p className="text-xs font-semibold text-muted-foreground">Systems Manager</p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary">
                  <Bot size={24} strokeWidth={2.5} />
                </div>
              </div>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-border/50 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="font-semibold">Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-[1600px] mx-auto w-full h-full pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "storeroom" && <StoreRoom />}
            {activeTab === "donations" && <Donations />}
            {activeTab === "categories" && <CategoriesDepartments />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ---------- SIDEBAR ITEM ----------
function SidebarItem({
  label,
  icon,
  active,
  onClick,
  collapsed,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center w-full rounded-2xl cursor-pointer transition-all duration-300 group overflow-hidden
      ${collapsed ? 'h-14 justify-center' : 'h-14 px-4'}
      ${active
          ? "bg-primary text-[#1E314D] shadow-lg shadow-primary/20"
          : "text-white/60 hover:text-white hover:bg-white/5"
        }`}
    >
      <div className={`flex items-center justify-center z-10 transition-transform duration-300 ${!collapsed && active ? 'scale-110' : ''}`}>
        {icon}
      </div>

      {!collapsed && (
        <span className={`ml-4 font-bold text-base z-10 tracking-wide transition-all ${active ? 'opacity-100' : 'opacity-80'}`}>
          {label}
        </span>
      )}

      {active && !collapsed && (
        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#1E314D] opacity-40"></div>
      )}
    </button>
  );
}