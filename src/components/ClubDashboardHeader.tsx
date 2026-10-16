"use client";

import React from "react";
import { AuthUser } from "@/lib/types";
import { Activity, Flame, Users, CheckCircle2, AlertCircle, XCircle, Shield, Award } from "lucide-react";

interface ClubDashboardHeaderProps {
  currentFormation: string;
  formationName: string;
  statsSummary: {
    totalPlayers: number;
    availablePlayers: number;
    maybePlayers: number;
    unavailablePlayers: number;
    goodFormPlayers: number;
    squadBreakdown: {
      starting: number;
      bench: number;
      reserves: number;
      trialists: number;
    };
  } | null;
  currentUser: AuthUser | null;
  startingAssignedCount: number;
}

export const ClubDashboardHeader: React.FC<ClubDashboardHeaderProps> = ({
  currentFormation,
  formationName,
  statsSummary,
  currentUser,
  startingAssignedCount,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-4 sm:p-6 mb-6 shadow-xl relative overflow-hidden">
      {/* Background visual flair */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Club Details */}
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  A1 TOUCH FC
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold uppercase tracking-wider">
                  FC 27 Season
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Tactical Command & Squad Registration Hub</span>
                <span className="text-slate-600">•</span>
                <span className="text-teal-400 font-medium">Active Formation: {currentFormation} ({formationName})</span>
              </p>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Starting XI count */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Starting XI</div>
              <div className="text-lg font-black text-white leading-tight">
                {startingAssignedCount} <span className="text-xs text-slate-500 font-normal">/ 11</span>
              </div>
            </div>
          </div>

          {/* Available count */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Available</div>
              <div className="text-lg font-black text-emerald-400 leading-tight">
                {statsSummary?.availablePlayers ?? 0}
                <span className="text-xs text-slate-500 font-normal ml-1">
                  ({statsSummary?.maybePlayers ?? 0} maybe)
                </span>
              </div>
            </div>
          </div>

          {/* Unavailable count */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Unavailable</div>
              <div className="text-lg font-black text-rose-400 leading-tight">
                {statsSummary?.unavailablePlayers ?? 0}
              </div>
            </div>
          </div>

          {/* In-form players */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">In-Form (75+)</div>
              <div className="text-lg font-black text-amber-300 leading-tight">
                {statsSummary?.goodFormPlayers ?? 0}
                <span className="text-xs text-slate-500 font-normal ml-1">
                  / {statsSummary?.totalPlayers ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
