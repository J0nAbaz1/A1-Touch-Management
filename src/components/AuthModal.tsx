"use client";

import React, { useState } from "react";
import { AuthUser, Role } from "@/lib/types";
import { LogIn, X, Shield, KeyRound, User, Check, Sparkles } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  onQuickRoleSwitch: (role: Role) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onLoginSuccess,
  onQuickRoleSwitch,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Sign In to A1 Touch FC</h3>
            <p className="text-xs text-slate-400">Access tactical controls & personal player hub</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username or EA FC Handle
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                placeholder="e.g. manager, owner, or a1_messi10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                placeholder="Default: a1touch2027"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
          >
            {isSubmitting ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* 1-Click Role Switcher Demo Box */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Instant Role Demo Switch
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Quickly test permissions as different club staff:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                onQuickRoleSwitch("OWNER");
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left hover:bg-slate-850 transition-all"
            >
              <div className="font-bold text-amber-300">Club Owner</div>
              <div className="text-[10px] text-slate-500">Full management</div>
            </button>

            <button
              type="button"
              onClick={() => {
                onQuickRoleSwitch("MANAGER");
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 text-left hover:bg-slate-850 transition-all"
            >
              <div className="font-bold text-teal-300">Head Manager</div>
              <div className="text-[10px] text-slate-500">Tactics & notes</div>
            </button>

            <button
              type="button"
              onClick={() => {
                onQuickRoleSwitch("ASSISTANT_MANAGER");
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-left hover:bg-slate-850 transition-all"
            >
              <div className="font-bold text-blue-300">Assistant Mgr</div>
              <div className="text-[10px] text-slate-500">Lineup assistant</div>
            </button>

            <button
              type="button"
              onClick={() => {
                onQuickRoleSwitch("PLAYER");
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-left hover:bg-slate-850 transition-all"
            >
              <div className="font-bold text-purple-300">Player (Messi)</div>
              <div className="text-[10px] text-slate-500">Player hub view</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
