"use client";

import React, { useState, useMemo } from "react";
import { PitchSlot, Player, PlayerRecommendation } from "@/lib/types";
import { rankPlayersForPosition, getFormDetails } from "@/lib/recommendation";
import { X, Flame, Check, AlertTriangle, ArrowRightLeft, Sparkles, User, Info } from "lucide-react";

interface PositionRecommendationModalProps {
  slot: PitchSlot | null;
  allPlayers: Player[];
  allSlots: PitchSlot[];
  onClose: () => void;
  onAssignPlayer: (slotId: string, playerId: number) => void;
  onClearSlot: (slotId: string) => void;
  onOpenPlayerProfile: (playerId: number) => void;
  canManage: boolean;
}

export const PositionRecommendationModal: React.FC<PositionRecommendationModalProps> = ({
  slot,
  allPlayers,
  allSlots,
  onClose,
  onAssignPlayer,
  onClearSlot,
  onOpenPlayerProfile,
  canManage,
}) => {
  const [filterQuery, setFilterQuery] = useState("");

  const recommendations = useMemo(() => {
    if (!slot) return [];
    const assignedSlots = allSlots.map((s) => ({
      slotId: s.slotId,
      playerId: s.playerId,
      label: s.label,
    }));
    return rankPlayersForPosition(slot.label, allPlayers, assignedSlots);
  }, [slot, allPlayers, allSlots]);

  if (!slot) return null;

  const currentAssignedPlayer = slot.playerId
    ? allPlayers.find((p) => p.id === slot.playerId)
    : null;

  const filteredRecommendations = recommendations.filter((rec) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      rec.player.displayName.toLowerCase().includes(q) ||
      rec.player.eaFcUsername.toLowerCase().includes(q) ||
      rec.player.mainPosition.toLowerCase().includes(q) ||
      rec.player.secondaryPosition.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-black text-base shadow-inner">
              {slot.label}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Position Selector: {slot.label}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-500/30">
                  AI Fit Rank
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Algorithm matches: Main (+100) • Secondary (+70) • Third (+50) • Form • Availability
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currently assigned player banner */}
        {currentAssignedPlayer && (
          <div className="bg-teal-950/40 border-b border-teal-500/20 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Currently in slot:</span>
              <span className="font-bold text-teal-300">
                #{currentAssignedPlayer.playerNumber} {currentAssignedPlayer.displayName}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-700">
                Main: {currentAssignedPlayer.mainPosition}
              </span>
            </div>
            {canManage && (
              <button
                onClick={() => onClearSlot(slot.slotId)}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 underline"
              >
                Remove from slot
              </button>
            )}
          </div>
        )}

        {/* Filter Input */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Filter candidates for ${slot.label}...`}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Candidate List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredRecommendations.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No registered players match your search filter.
            </div>
          ) : (
            filteredRecommendations.map((rec, index) => {
              const { player, score, matchType, breakdown, isAlreadyAssigned, currentAssignedSlot } = rec;
              const isCurrentInThisSlot = player.id === slot.playerId;
              const formDetails = getFormDetails(player.formRating);

              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrentInThisSlot
                      ? "bg-teal-950/40 border-teal-500/50 shadow-sm shadow-teal-500/10"
                      : isAlreadyAssigned
                      ? "bg-slate-900/40 border-slate-800 opacity-80"
                      : "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                  }`}
                >
                  {/* Left: Player Info & Rank */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 text-slate-400 text-xs font-black shrink-0">
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => onOpenPlayerProfile(player.id)}
                          className="font-bold text-white text-sm hover:text-teal-300 hover:underline cursor-pointer"
                        >
                          #{player.playerNumber} {player.displayName}
                        </span>
                        <span className="text-[10px] text-slate-400">({player.eaFcUsername})</span>

                        {/* Position Match Badge */}
                        {matchType === "MAIN" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                            ⭐ Main Position Match (+100)
                          </span>
                        )}
                        {matchType === "SECONDARY" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            Secondary Position (+70)
                          </span>
                        )}
                        {matchType === "THIRD" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Third Position (+50)
                          </span>
                        )}
                      </div>

                      {/* Sub-row: Positions, Form, Availability */}
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 flex-wrap">
                        <span>
                          Pos: <strong className="text-slate-200">{player.mainPosition}</strong> /{" "}
                          {player.secondaryPosition}
                          {player.thirdPosition ? ` / ${player.thirdPosition}` : ""}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-amber-300">
                          <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {player.formRating}/100 {formDetails.flames}
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              player.availability === "AVAILABLE"
                                ? "bg-emerald-400"
                                : player.availability === "MAYBE"
                                ? "bg-amber-400"
                                : "bg-rose-500"
                            }`}
                          />
                          <span
                            className={
                              player.availability === "AVAILABLE"
                                ? "text-emerald-400"
                                : player.availability === "MAYBE"
                                ? "text-amber-400"
                                : "text-rose-400"
                            }
                          >
                            {player.availability === "AVAILABLE"
                              ? "Available (+25)"
                              : player.availability === "MAYBE"
                              ? `Maybe (-15)${player.availabilityReason ? ` (${player.availabilityReason})` : ""}`
                              : `Unavailable (-60)${player.availabilityReason ? ` (${player.availabilityReason})` : ""}`}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score Pill & Selection Action */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {/* Recommendation Score pill */}
                    <div className="text-right">
                      <div className="text-xs font-black text-teal-400">{score} pts</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">Fit Score</div>
                    </div>

                    {/* Action Button */}
                    {canManage ? (
                      isCurrentInThisSlot ? (
                        <button
                          disabled
                          className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center gap-1 cursor-default"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Assigned
                        </button>
                      ) : isAlreadyAssigned ? (
                        <button
                          onClick={() => {
                            onAssignPlayer(slot.slotId, player.id);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-colors"
                          title={`Currently playing ${currentAssignedSlot}. Click to swap here.`}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Swap from {currentAssignedSlot}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onAssignPlayer(slot.slotId, player.id);
                            onClose();
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold shadow-sm transition-all"
                        >
                          Select
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => onOpenPlayerProfile(player.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
                      >
                        Profile
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer with quick scoring guide */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Ranking: Main Pos match (+100) &gt; Secondary (+70) &gt; Third (+50) &gt; Form &gt; Availability</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
