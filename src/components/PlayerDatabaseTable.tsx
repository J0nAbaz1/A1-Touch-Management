"use client";

import React, { useState, useMemo } from "react";
import { Player, Position, AvailabilityStatus, SquadStatus, Role } from "@/lib/types";
import { AVAILABLE_POSITIONS } from "@/lib/formations";
import { getFormDetails } from "@/lib/recommendation";
import { Search, Filter, Flame, Eye, Trash2, Edit3, Shield, UserCheck, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface PlayerDatabaseTableProps {
  players: Player[];
  onOpenProfile: (playerId: number) => void;
  onDeletePlayer?: (playerId: number) => void;
  currentUserRole?: Role;
  onRefresh: () => void;
}

export const PlayerDatabaseTable: React.FC<PlayerDatabaseTableProps> = ({
  players,
  onOpenProfile,
  onDeletePlayer,
  currentUserRole,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");
  const [formFilter, setFormFilter] = useState("ALL");
  const [squadStatusFilter, setSquadStatusFilter] = useState("ALL");

  const isOwner = currentUserRole === "OWNER";
  const canManage = currentUserRole === "OWNER" || currentUserRole === "MANAGER";

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = player.displayName.toLowerCase().includes(q);
        const matchesEa = player.eaFcUsername.toLowerCase().includes(q);
        const matchesDiscord = player.discordUsername.toLowerCase().includes(q);
        if (!matchesName && !matchesEa && !matchesDiscord) return false;
      }

      // Position filter
      if (positionFilter !== "ALL") {
        const hasPos =
          player.mainPosition === positionFilter ||
          player.secondaryPosition === positionFilter ||
          player.thirdPosition === positionFilter;
        if (!hasPos) return false;
      }

      // Availability filter
      if (availabilityFilter !== "ALL" && player.availability !== availabilityFilter) {
        return false;
      }

      // Squad status filter
      if (squadStatusFilter !== "ALL" && player.squadStatus !== squadStatusFilter) {
        return false;
      }

      // Form filter
      if (formFilter !== "ALL") {
        const f = player.formRating;
        if (formFilter === "EXCELLENT" && f < 90) return false;
        if (formFilter === "VERY_GOOD" && (f < 80 || f >= 90)) return false;
        if (formFilter === "GOOD" && (f < 70 || f >= 80)) return false;
        if (formFilter === "AVERAGE" && (f < 60 || f >= 70)) return false;
        if (formFilter === "POOR" && f >= 60) return false;
      }

      return true;
    });
  }, [players, searchTerm, positionFilter, availabilityFilter, formFilter, squadStatusFilter]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setPositionFilter("ALL");
    setAvailabilityFilter("ALL");
    setFormFilter("ALL");
    setSquadStatusFilter("ALL");
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Search input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by player name, EA FC gamertag, or Discord handle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <button
            onClick={handleResetFilters}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors shrink-0"
          >
            Reset Filters
          </button>
        </div>

        {/* Filter Selectors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Position */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Position
            </label>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Positions</option>
              {AVAILABLE_POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Availability
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Availability</option>
              <option value="AVAILABLE">🟢 Available</option>
              <option value="MAYBE">🟡 Maybe</option>
              <option value="UNAVAILABLE">🔴 Unavailable</option>
            </select>
          </div>

          {/* Form */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Form Rating
            </label>
            <select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Form Levels</option>
              <option value="EXCELLENT">🔥🔥🔥🔥🔥 Excellent (90+)</option>
              <option value="VERY_GOOD">🔥🔥🔥🔥 Very Good (80-89)</option>
              <option value="GOOD">🔥🔥🔥 Good (70-79)</option>
              <option value="AVERAGE">🔥🔥 Average (60-69)</option>
              <option value="POOR">🔥 Poor (&lt;60)</option>
            </select>
          </div>

          {/* Squad Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Squad Status
            </label>
            <select
              value={squadStatusFilter}
              onChange={(e) => setSquadStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="STARTING_XI">Starting XI</option>
              <option value="BENCH">Bench</option>
              <option value="RESERVE">Reserve</option>
              <option value="TRIALIST">Trialist</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Counter Banner */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400">
        <div>
          Showing <span className="font-bold text-white">{filteredPlayers.length}</span> of{" "}
          <span className="font-bold text-white">{players.length}</span> registered squad members
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-3">Main Pos</th>
                <th className="py-3 px-3">Secondary</th>
                <th className="py-3 px-3">Third</th>
                <th className="py-3 px-4">Form</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No players found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => {
                  const formDetails = getFormDetails(player.formRating);

                  return (
                    <tr
                      key={player.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onOpenProfile(player.id)}
                    >
                      {/* Player info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-white text-xs shrink-0 group-hover:border-teal-500/50">
                            #{player.playerNumber}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-teal-300 transition-colors">
                              {player.displayName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              EA: {player.eaFcUsername} • {player.discordUsername}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Main Pos */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-black border border-teal-500/40 text-[11px]">
                          {player.mainPosition}
                        </span>
                      </td>

                      {/* Secondary */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 font-bold border border-blue-500/30 text-[11px]">
                          {player.secondaryPosition}
                        </span>
                      </td>

                      {/* Third */}
                      <td className="py-3 px-3">
                        {player.thirdPosition ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-medium border border-purple-500/30 text-[11px]">
                            {player.thirdPosition}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Form */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-amber-300">{player.formRating}/100</span>
                          <span className="text-xs">{formDetails.flames}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {formDetails.label}
                        </div>
                      </td>

                      {/* Availability */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              player.availability === "AVAILABLE"
                                ? "bg-emerald-400"
                                : player.availability === "MAYBE"
                                ? "bg-amber-400"
                                : "bg-rose-500"
                            }`}
                          />
                          <div>
                            <span
                              className={`font-bold ${
                                player.availability === "AVAILABLE"
                                  ? "text-emerald-400"
                                  : player.availability === "MAYBE"
                                  ? "text-amber-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {player.availability === "AVAILABLE"
                                ? "Available"
                                : player.availability === "MAYBE"
                                ? "Maybe"
                                : "Unavailable"}
                            </span>
                            {player.availabilityReason && (
                              <div className="text-[10px] text-slate-400 max-w-[120px] truncate" title={player.availabilityReason}>
                                {player.availabilityReason}
                                {player.availableAfter ? ` (after ${player.availableAfter})` : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Squad Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            player.squadStatus === "STARTING_XI"
                              ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                              : player.squadStatus === "BENCH"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                              : player.squadStatus === "TRIALIST"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {player.squadStatus.replace("_", " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenProfile(player.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Player Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isOwner && onDeletePlayer && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove ${player.displayName} from the club?`)) {
                                  onDeletePlayer(player.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete Player (Owner only)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
