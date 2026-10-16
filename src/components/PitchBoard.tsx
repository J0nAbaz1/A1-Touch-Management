"use client";

import React from "react";
import { PitchSlot, Player } from "@/lib/types";
import { getFormDetails } from "@/lib/recommendation";
import { Plus, X, User, Flame } from "lucide-react";

interface PitchBoardProps {
  slots: PitchSlot[];
  playerMap: Map<number, Player>;
  onSlotClick: (slot: PitchSlot) => void;
  onRemovePlayerFromSlot: (slotId: string, e: React.MouseEvent) => void;
  onOpenPlayerProfile: (playerId: number, e: React.MouseEvent) => void;
  canManage: boolean;
}

export const PitchBoard: React.FC<PitchBoardProps> = ({
  slots,
  playerMap,
  onSlotClick,
  onRemovePlayerFromSlot,
  onOpenPlayerProfile,
  canManage,
}) => {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-emerald-950/70 shadow-2xl bg-slate-950">
      {/* Stadium Pitch Aspect Ratio Container */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] max-h-[760px] pitch-pattern select-none">
        {/* Pitch Texture Overlay */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40 bg-[radial-gradient(circle_at_center,rgba(26,188,156,0.12)_0%,rgba(0,0,0,0.6)_100%)]" />

        {/* Pitch Markings (White / Chalk Lines) */}
        <div className="absolute inset-4 sm:inset-6 border-2 border-white/25 rounded-lg pointer-events-none">
          {/* Halfway Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/25 -translate-y-1/2" />

          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-28 sm:w-36 h-28 sm:h-36 border-2 border-white/25 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            {/* Center Spot */}
            <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
          </div>

          {/* Top Penalty Area (Opponent Box) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-24 sm:h-32 border-b-2 border-l-2 border-r-2 border-white/25">
            {/* Top 6-yard Box */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-10 sm:h-14 border-b-2 border-l-2 border-r-2 border-white/20" />
            {/* Top Penalty Spot */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/40" />
          </div>

          {/* Bottom Penalty Area (Our Box / GK) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-24 sm:h-32 border-t-2 border-l-2 border-r-2 border-white/25">
            {/* Bottom 6-yard Box */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-10 sm:h-14 border-t-2 border-l-2 border-r-2 border-white/20" />
            {/* Bottom Penalty Spot */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/40" />
          </div>

          {/* Corner Arcs */}
          <div className="absolute top-0 left-0 w-6 h-6 border-b-2 border-r-2 border-white/25 rounded-br-full" />
          <div className="absolute top-0 right-0 w-6 h-6 border-b-2 border-l-2 border-white/25 rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-t-2 border-r-2 border-white/25 rounded-tr-full" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-t-2 border-l-2 border-white/25 rounded-tl-full" />
        </div>

        {/* Pitch Slots */}
        {slots.map((slot) => {
          const player = slot.playerId ? playerMap.get(slot.playerId) : null;
          const formInfo = player ? getFormDetails(player.formRating) : null;

          return (
            <div
              key={slot.slotId}
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => onSlotClick(slot)}
              className="absolute z-20 group cursor-pointer"
            >
              {player ? (
                /* Assigned Player Card Card Badge */
                <div className="relative flex flex-col items-center transition-all duration-200 group-hover:scale-105">
                  {/* Remove Player Button for Management */}
                  {canManage && (
                    <button
                      onClick={(e) => onRemovePlayerFromSlot(slot.slotId, e)}
                      title="Remove from Starting XI"
                      className="absolute -top-2 -right-2 z-30 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}

                  {/* Player Avatar Circle */}
                  <div
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all border-2 ${
                      player.availability === "AVAILABLE"
                        ? "bg-slate-900 border-teal-400 shadow-teal-500/20"
                        : player.availability === "MAYBE"
                        ? "bg-slate-900 border-amber-400 shadow-amber-500/20"
                        : "bg-slate-900 border-rose-500/80 shadow-rose-500/20"
                    }`}
                  >
                    {/* Kit Number */}
                    <span className="text-sm sm:text-base font-black text-white tracking-tight">
                      #{player.playerNumber}
                    </span>

                    {/* Position Badge in corner */}
                    <span className="absolute -bottom-1 -left-1 px-1 py-0.2 rounded bg-slate-950 border border-slate-700 text-[9px] font-black text-teal-300">
                      {slot.label}
                    </span>

                    {/* Form Rating Pill in top right */}
                    <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded bg-slate-950 border border-slate-700 text-[9px] font-bold text-amber-300 flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      {player.formRating}
                    </span>

                    {/* Availability Dot */}
                    <div
                      className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                        player.availability === "AVAILABLE"
                          ? "bg-emerald-400"
                          : player.availability === "MAYBE"
                          ? "bg-amber-400"
                          : "bg-rose-500"
                      }`}
                      title={`Status: ${player.availability}`}
                    />
                  </div>

                  {/* Player Name Pill */}
                  <div className="mt-1 flex items-center gap-1 bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-800 text-center shadow-md max-w-[90px] sm:max-w-[110px]">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPlayerProfile(player.id, e);
                      }}
                      className="text-[10px] sm:text-[11px] font-bold text-slate-100 truncate hover:text-teal-300 hover:underline cursor-pointer"
                    >
                      {player.displayName}
                    </span>
                  </div>
                </div>
              ) : (
                /* Unassigned / Empty Position Slot */
                <div className="flex flex-col items-center group-hover:scale-105 transition-all">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl border-2 border-dashed border-teal-400/50 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-teal-300 shadow-md group-hover:border-teal-400 group-hover:bg-teal-950/40">
                    <span className="text-[10px] font-black tracking-wider text-teal-200 uppercase">
                      {slot.label}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-teal-400 mt-0.5" />
                  </div>
                  <span className="mt-1 text-[9px] font-semibold text-teal-300/80 bg-slate-950/80 px-1.5 py-0.2 rounded border border-teal-500/20">
                    Click to pick
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pitch Footer / Quick Guide */}
      <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Maybe
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Unavailable
          </span>
        </div>
        <div className="text-teal-400 font-semibold flex items-center gap-1">
          <span>💡 Click any position on pitch to open ranked recommendations</span>
        </div>
      </div>
    </div>
  );
};
