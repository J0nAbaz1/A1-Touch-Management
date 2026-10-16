"use client";

import React from "react";
import { Player } from "@/lib/types";
import { Trophy, Award, Flame, Star, ShieldCheck, Zap } from "lucide-react";

interface ClubStatsTabProps {
  players: Player[];
  onOpenPlayerProfile: (playerId: number) => void;
}

export const ClubStatsTab: React.FC<ClubStatsTabProps> = ({ players, onOpenPlayerProfile }) => {
  // Mock match fixtures & results showcasing future system
  const recentMatches = [
    {
      opponent: "Nemesis FC",
      competition: "FC 27 Division 1 League",
      result: "WIN",
      score: "7 - 4",
      date: "Last Matchday",
      highlights: "Messi (3 goals, 2 assists), Apex (2 goals), Matrix (1 goal, 3 assists)",
      motm: "Messi (9.8 Rating)",
    },
    {
      opponent: "Shadow Wolves",
      competition: "Pro Clubs Champions Cup",
      result: "WIN",
      score: "4 - 2",
      date: "3 days ago",
      highlights: "Apex (2 goals), Viper (1 goal), Kante (1 goal, 8 tackles)",
      motm: "A1_Apex (9.4 Rating)",
    },
    {
      opponent: "Prime United",
      competition: "FC 27 Division 1 League",
      result: "DRAW",
      score: "3 - 3",
      date: "1 week ago",
      highlights: "Viper (2 goals), Modric (1 goal, 94% pass accuracy)",
      motm: "A1_Viper (8.9 Rating)",
    },
  ];

  // Top performers
  const topFormPlayers = [...players].sort((a, b) => b.formRating - a.formRating).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Club Accolades Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">A1 TOUCH FC Club Analytics</h2>
              <p className="text-xs text-slate-400">
                Official FC 27 Match Performance Engine & Automated Form Tracking System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold">
              Division 1 Elite Roster
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              Form Trending: +4.2%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Match Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-400" />
                Recent Matchday Results
              </h3>
              <span className="text-[11px] text-slate-500">FC 27 Competitive Hub</span>
            </div>

            <div className="space-y-3">
              {recentMatches.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          m.result === "WIN"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {m.result}
                      </span>
                      <span className="text-sm font-black text-white">
                        A1 Touch FC <span className="text-teal-400">{m.score}</span> {m.opponent}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{m.date}</span>
                  </div>

                  <div className="mt-2 text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 text-[11px]">Key Performers:</span>
                    <span>{m.highlights}</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-900 text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Man of the Match: {m.motm}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Top Form Power Rankings */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Squad Form Power Rankings
            </h3>

            <div className="space-y-2.5">
              {topFormPlayers.map((player, rank) => (
                <div
                  key={player.id}
                  onClick={() => onOpenPlayerProfile(player.id)}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-teal-500/50 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-xs font-black text-slate-400">
                      #{rank + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white hover:text-teal-300">
                        {player.displayName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {player.mainPosition} • #{player.playerNumber}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-amber-300">{player.formRating}/100</div>
                    <div className="text-[9px] text-teal-400 font-bold uppercase">Peak Form</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
