"use client";

import React, { useState } from "react";
import { Player, PitchSlot } from "@/lib/types";
import { Users, Plus, X, Flame, ShieldAlert, Award, UserPlus } from "lucide-react";

interface BenchReservesPanelProps {
  allPlayers: Player[];
  startingSlots: PitchSlot[];
  benchPlayerIds: number[];
  onUpdateBench: (benchIds: number[]) => void;
  onOpenPlayerProfile: (playerId: number) => void;
  canManage: boolean;
}

export const BenchReservesPanel: React.FC<BenchReservesPanelProps> = ({
  allPlayers,
  startingSlots,
  benchPlayerIds,
  onUpdateBench,
  onOpenPlayerProfile,
  canManage,
}) => {
  const [benchModalOpen, setBenchModalOpen] = useState(false);

  const startingIdSet = new Set(
    startingSlots.map((s) => s.playerId).filter((id): id is number => typeof id === "number")
  );

  const benchIdSet = new Set(benchPlayerIds);

  const benchPlayers = benchPlayerIds
    .map((id) => allPlayers.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));

  const reserves = allPlayers.filter((p) => !startingIdSet.has(p.id) && !benchIdSet.has(p.id));

  const handleRemoveFromBench = (playerId: number) => {
    onUpdateBench(benchPlayerIds.filter((id) => id !== playerId));
  };

  const handleAddToBench = (playerId: number) => {
    if (benchPlayerIds.length >= 7) {
      alert("Bench is already full (maximum 7 substitutes allowed). Remove one first.");
      return;
    }
    if (!benchPlayerIds.includes(playerId)) {
      onUpdateBench([...benchPlayerIds, playerId]);
    }
    setBenchModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Bench (Substitutes) Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Substitutes Bench ({benchPlayers.length}/7)
            </h3>
          </div>
          {canManage && benchPlayers.length < 7 && (
            <button
              onClick={() => setBenchModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Sub</span>
            </button>
          )}
        </div>

        {/* Bench Slots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {benchPlayers.map((player, idx) => (
            <div
              key={player.id}
              className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl flex items-center justify-between group transition-all"
            >
              <div
                className="flex items-center gap-2.5 cursor-pointer min-w-0"
                onClick={() => onOpenPlayerProfile(player.id)}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-teal-500/40 flex items-center justify-center text-xs font-black text-white shrink-0">
                  #{player.playerNumber}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate hover:text-teal-300">
                    {player.displayName}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span className="font-semibold text-teal-400">{player.mainPosition}</span>
                    <span>•</span>
                    <span className="flex items-center text-amber-300 font-bold">
                      <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400 mr-0.5" />
                      {player.formRating}
                    </span>
                    <span>•</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        player.availability === "AVAILABLE"
                          ? "bg-emerald-400"
                          : player.availability === "MAYBE"
                          ? "bg-amber-400"
                          : "bg-rose-500"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {canManage && (
                <button
                  onClick={() => handleRemoveFromBench(player.id)}
                  title="Remove from bench"
                  className="p-1 rounded bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {/* Empty bench placeholders */}
          {Array.from({ length: Math.max(0, 7 - benchPlayers.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              onClick={() => canManage && setBenchModalOpen(true)}
              className={`border border-dashed border-slate-800 rounded-xl p-2.5 flex items-center justify-center text-[11px] text-slate-500 gap-1.5 ${
                canManage ? "cursor-pointer hover:border-slate-700 hover:text-slate-400" : ""
              }`}
            >
              <Plus className="w-3 h-3 text-slate-600" />
              <span>Sub {benchPlayers.length + i + 1} Slot</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reserves List Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Reserves & Squad Depth ({reserves.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">Unassigned squad members</span>
        </div>

        {reserves.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            All registered club players are currently assigned to the Starting XI or Bench!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {reserves.map((player) => (
              <div
                key={player.id}
                className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div
                  className="flex items-center gap-2.5 cursor-pointer min-w-0"
                  onClick={() => onOpenPlayerProfile(player.id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                    #{player.playerNumber}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate hover:text-teal-300">
                      {player.displayName}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span className="text-slate-300 font-bold">{player.mainPosition}</span>
                      <span>•</span>
                      <span className="text-amber-300 font-medium">Form {player.formRating}</span>
                      <span>•</span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          player.availability === "AVAILABLE"
                            ? "bg-emerald-400"
                            : player.availability === "MAYBE"
                            ? "bg-amber-400"
                            : "bg-rose-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {canManage && benchPlayers.length < 7 && (
                  <button
                    onClick={() => handleAddToBench(player.id)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-300 text-[10px] font-bold transition-all"
                    title="Promote to Bench"
                  >
                    + Bench
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Select Substitute Modal */}
      {benchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                Select Substitute for Bench
              </h4>
              <button
                onClick={() => setBenchModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {reserves.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No available reserves found.
                </div>
              ) : (
                reserves.map((player) => (
                  <div
                    key={player.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-white">
                        #{player.playerNumber}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{player.displayName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span className="text-teal-400 font-bold">{player.mainPosition}</span>
                          <span>•</span>
                          <span>Form: {player.formRating}/100</span>
                          <span>•</span>
                          <span
                            className={
                              player.availability === "AVAILABLE"
                                ? "text-emerald-400"
                                : player.availability === "MAYBE"
                                ? "text-amber-400"
                                : "text-rose-400"
                            }
                          >
                            {player.availability}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToBench(player.id)}
                      className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold shadow-sm transition-all"
                    >
                      Put on Bench
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
