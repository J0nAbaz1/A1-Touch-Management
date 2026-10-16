"use client";

import React, { useState } from "react";
import { AuthUser, Role } from "@/lib/types";
import { Shield, Users, UserPlus, Trophy, LogOut, LogIn, ChevronDown, Sparkles, Check, Settings } from "lucide-react";

interface NavbarProps {
  currentUser: AuthUser | null;
  activeTab: "tactics" | "players" | "register" | "stats";
  setActiveTab: (tab: "tactics" | "players" | "register" | "stats") => void;
  onQuickSwitchRole: (role: Role) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onQuickSwitchRole,
  onOpenAuthModal,
  onLogout,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roles: { role: Role; label: string; desc: string; badgeColor: string }[] = [
    {
      role: "OWNER",
      label: "Club Owner",
      desc: "Full Club Control • Delete Players • Manage Roles",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    {
      role: "MANAGER",
      label: "Head Manager",
      desc: "Starting XI • Formations • Form • Manager Notes",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    },
    {
      role: "ASSISTANT_MANAGER",
      label: "Asst. Manager",
      desc: "Assist Starting XI • Notes • View All Players",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    {
      role: "PLAYER",
      label: "Player (Messi)",
      desc: "View Squad • Update Own Availability • Personal Bio",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("tactics")}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 shadow-md shadow-teal-500/20 border border-teal-300/30">
              <Shield className="w-5 h-5 text-slate-950 font-bold" />
              <div className="absolute -bottom-1 -right-1 text-[9px] font-black bg-slate-900 text-teal-400 px-1 py-0.2 rounded border border-teal-500/40">
                27
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-wider text-lg text-white">A1 TOUCH</span>
                <span className="text-teal-400 font-extrabold text-sm tracking-widest px-1.5 py-0.5 rounded bg-teal-950/60 border border-teal-500/30">
                  FC
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                FC 27 Squad Management Platform
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("tactics")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "tactics"
                  ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Tactics & Starting XI
            </button>
            <button
              onClick={() => setActiveTab("players")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "players"
                  ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Player Database
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "register"
                  ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Player Registration
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "stats"
                  ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Club Stats
            </button>
          </nav>

          {/* User & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Role Tester Menu */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-teal-500/60 text-xs font-medium text-slate-200 transition-colors shadow-sm"
                title="Switch active role to test system permissions"
              >
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-slate-400 text-[11px]">Role:</span>
                <span className="font-bold text-teal-300">
                  {currentUser ? currentUser.role.replace("_", " ") : "MANAGER"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 text-xs space-y-1"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-2 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>TEST ROLE PERMISSIONS</span>
                    <span className="text-[10px] text-teal-400">1-Click Switch</span>
                  </div>
                  {roles.map((r) => {
                    const isSelected = currentUser?.role === r.role || (!currentUser && r.role === "MANAGER");
                    return (
                      <button
                        key={r.role}
                        onClick={() => {
                          onQuickSwitchRole(r.role);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-start justify-between transition-colors ${
                          isSelected
                            ? "bg-teal-950/60 border border-teal-500/40 text-teal-100"
                            : "hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold">{r.label}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border ${r.badgeColor}`}>
                              {r.role}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Auth Actions */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-xs font-medium text-slate-300">
                  {currentUser.displayName}
                </span>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab("tactics")}
            className={`px-2 py-1 rounded ${activeTab === "tactics" ? "text-teal-400 font-bold" : "text-slate-400"}`}
          >
            Tactics
          </button>
          <button
            onClick={() => setActiveTab("players")}
            className={`px-2 py-1 rounded ${activeTab === "players" ? "text-teal-400 font-bold" : "text-slate-400"}`}
          >
            Players
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`px-2 py-1 rounded ${activeTab === "register" ? "text-teal-400 font-bold" : "text-slate-400"}`}
          >
            Register
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-2 py-1 rounded ${activeTab === "stats" ? "text-teal-400 font-bold" : "text-slate-400"}`}
          >
            Stats
          </button>
        </div>
      </div>
    </header>
  );
};
