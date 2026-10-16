"use client";

import React, { useState, useEffect } from "react";
import { Player, PlayerNote, Position, AvailabilityStatus, SquadStatus, PreferredFoot, Role } from "@/lib/types";
import { AVAILABLE_POSITIONS } from "@/lib/formations";
import { getFormDetails } from "@/lib/recommendation";
import {
  X,
  Flame,
  Shield,
  FileText,
  Activity,
  Edit2,
  Check,
  Plus,
  Lock,
  Trophy,
  Calendar,
  Sparkles,
  Award,
} from "lucide-react";

interface PlayerProfileModalProps {
  playerId: number | null;
  onClose: () => void;
  currentUserRole?: Role;
  currentUserId?: number;
  onPlayerUpdated: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  playerId,
  onClose,
  currentUserRole,
  currentUserId,
  onPlayerUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "stats" | "edit">("overview");
  const [player, setPlayer] = useState<Player | null>(null);
  const [notes, setNotes] = useState<PlayerNote[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [canSeeNotes, setCanSeeNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Note state
  const [newNoteText, setNewNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Edit Player State
  const [editData, setEditData] = useState<{
    displayName: string;
    discordUsername: string;
    eaFcUsername: string;
    mainPosition: Position;
    secondaryPosition: Position;
    thirdPosition: Position | "";
    preferredFoot: PreferredFoot;
    playerNumber: number;
    availability: AvailabilityStatus;
    availabilityReason: string;
    availableAfter: string;
    formRating: number;
    squadStatus: SquadStatus;
    bio: string;
  } | null>(null);

  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const isManagement = currentUserRole === "OWNER" || currentUserRole === "MANAGER" || currentUserRole === "ASSISTANT_MANAGER";
  const isOwnerOrManager = currentUserRole === "OWNER" || currentUserRole === "MANAGER";
  const isSelf = player?.userId === currentUserId || currentUserRole === "PLAYER";

  const fetchPlayerDetails = async () => {
    if (!playerId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/players/${playerId}`);
      if (!res.ok) throw new Error("Failed to load player");
      const data = await res.json();
      setPlayer(data.player);
      setNotes(data.notes || []);
      setStats(data.stats || null);
      setCanSeeNotes(Boolean(data.canSeeNotes));

      setEditData({
        displayName: data.player.displayName,
        discordUsername: data.player.discordUsername,
        eaFcUsername: data.player.eaFcUsername,
        mainPosition: data.player.mainPosition,
        secondaryPosition: data.player.secondaryPosition,
        thirdPosition: data.player.thirdPosition || "",
        preferredFoot: data.player.preferredFoot,
        playerNumber: data.player.playerNumber,
        availability: data.player.availability,
        availabilityReason: data.player.availabilityReason || "",
        availableAfter: data.player.availableAfter || "",
        formRating: data.player.formRating,
        squadStatus: data.player.squadStatus,
        bio: data.player.bio || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerDetails();
  }, [playerId]);

  if (!playerId) return null;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    try {
      setIsSubmittingNote(true);
      const res = await fetch(`/api/players/${playerId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNoteText }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      setNewNoteText("");
      fetchPlayerDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;

    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/players/${playerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      await fetchPlayerDetails();
      onPlayerUpdated();
      setActiveTab("overview");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const formDetails = player ? getFormDetails(player.formRating) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Loading state */}
        {isLoading || !player ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading player profile...
          </div>
        ) : (
          <>
            {/* Modal Header / Banner */}
            <div className="relative p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
                <div className="flex items-center gap-4">
                  {/* Kit Number Emblem */}
                  <div className="relative w-14 h-14 rounded-2xl bg-slate-950 border-2 border-teal-400/80 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-teal-500/20 shrink-0">
                    #{player.playerNumber}
                    <div className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-teal-500 text-slate-950 text-[9px] font-black">
                      {player.mainPosition}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {player.displayName}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {player.squadStatus.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>EA FC: <strong className="text-teal-400">{player.eaFcUsername}</strong></span>
                      <span>•</span>
                      <span>Discord: {player.discordUsername}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Button for authorized roles */}
                {(isManagement || isSelf) && (
                  <button
                    onClick={() => setActiveTab(activeTab === "edit" ? "overview" : "edit")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold self-start sm:self-center transition-colors border border-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>{activeTab === "edit" ? "View Profile" : "Edit Profile"}</span>
                  </button>
                )}
              </div>

              {/* Sub-Tabs */}
              <div className="flex items-center gap-2 mt-5 border-t border-slate-800/80 pt-3">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === "overview"
                      ? "bg-teal-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Overview & Form
                </button>

                {canSeeNotes && (
                  <button
                    onClick={() => setActiveTab("notes")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                      activeTab === "notes"
                        ? "bg-teal-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Manager Notes ({notes.length})</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab("stats")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "stats"
                      ? "bg-teal-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Trophy className="w-3 h-3" />
                  <span>FC 27 Match Stats</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Key Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Positions */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Positions
                      </div>
                      <div className="text-sm font-black text-white flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs">
                          {player.mainPosition}
                        </span>
                        <span className="text-slate-400 text-xs">{player.secondaryPosition}</span>
                        {player.thirdPosition && (
                          <span className="text-slate-500 text-xs">{player.thirdPosition}</span>
                        )}
                      </div>
                    </div>

                    {/* Form Rating */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Form Rating
                      </div>
                      <div className="text-sm font-black text-amber-300 flex items-center gap-1">
                        <span>{player.formRating}/100</span>
                        <span className="text-xs">{formDetails?.flames}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{formDetails?.label}</div>
                    </div>

                    {/* Availability */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Availability
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            player.availability === "AVAILABLE"
                              ? "bg-emerald-400"
                              : player.availability === "MAYBE"
                              ? "bg-amber-400"
                              : "bg-rose-500"
                          }`}
                        />
                        <span
                          className={`text-xs font-bold ${
                            player.availability === "AVAILABLE"
                              ? "text-emerald-400"
                              : player.availability === "MAYBE"
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {player.availability}
                        </span>
                      </div>
                      {player.availabilityReason && (
                        <div className="text-[10px] text-slate-400 truncate mt-0.5" title={player.availabilityReason}>
                          {player.availabilityReason}
                        </div>
                      )}
                    </div>

                    {/* Foot & Number */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Preferred Foot
                      </div>
                      <div className="text-xs font-bold text-white">{player.preferredFoot} Foot</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Kit #{player.playerNumber}</div>
                    </div>
                  </div>

                  {/* Bio / Playstyle */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
                      Player Playstyle & Profile
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {player.bio || "No custom bio provided yet."}
                    </p>
                  </div>

                  {/* Availability Specific Details Banner */}
                  {player.availability !== "AVAILABLE" && (
                    <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-amber-200">
                          Availability Notice: {player.availability}
                        </div>
                        {player.availabilityReason && (
                          <div className="text-xs text-amber-300/80 mt-0.5">
                            Reason: <strong>{player.availabilityReason}</strong>
                          </div>
                        )}
                        {player.availableAfter && (
                          <div className="text-xs text-amber-300/80 mt-0.5">
                            Available after: <strong>{player.availableAfter}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Manager Notes Preview (if authorized) */}
                  {canSeeNotes && notes.length > 0 && (
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                          <Lock className="w-3 h-3" />
                          Manager Notes (Private)
                        </h4>
                        <button
                          onClick={() => setActiveTab("notes")}
                          className="text-[11px] text-teal-400 hover:underline font-semibold"
                        >
                          View All ({notes.length})
                        </button>
                      </div>
                      <div className="space-y-2">
                        {notes.slice(0, 2).map((n) => (
                          <div key={n.id} className="text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            <div className="text-slate-200 font-medium">"{n.note}"</div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              By {n.authorName} ({n.authorRole})
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MANAGER NOTES (RESTRICTED) */}
              {activeTab === "notes" && canSeeNotes && (
                <div className="space-y-5">
                  <div className="bg-teal-950/30 border border-teal-500/30 p-3 rounded-xl text-xs text-teal-200 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>
                      Private Management Notes: These records are strictly invisible to regular players.
                    </span>
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="space-y-3">
                    <label className="block text-xs font-bold text-slate-300">
                      Add New Management Evaluation
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Excellent 1v1 dribbler. Good passing under press. Needs to track back faster on defensive transitions."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingNote}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isSubmittingNote ? "Adding..." : "Add Note"}</span>
                      </button>
                    </div>
                  </form>

                  {/* Notes List */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    {notes.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-500">
                        No manager notes recorded for this player yet.
                      </div>
                    ) : (
                      notes.map((n) => (
                        <div
                          key={n.id}
                          className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl space-y-1.5"
                        >
                          <div className="text-xs text-slate-200 leading-relaxed font-normal">
                            "{n.note}"
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span className="font-semibold text-teal-400">{n.authorName}</span>
                            <span>•</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              {n.authorRole}
                            </span>
                            <span>•</span>
                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FC 27 MATCH STATS */}
              {activeTab === "stats" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Matches</div>
                      <div className="text-xl font-black text-white mt-0.5">{stats?.games ?? 18}</div>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Goals</div>
                      <div className="text-xl font-black text-teal-400 mt-0.5">{stats?.goals ?? 12}</div>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Assists</div>
                      <div className="text-xl font-black text-blue-400 mt-0.5">{stats?.assists ?? 8}</div>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Rating</div>
                      <div className="text-xl font-black text-amber-300 mt-0.5">{stats?.avgRating ?? "8.6"}</div>
                    </div>
                  </div>

                  {/* Recent Ratings Trend */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
                      <span>Recent 5 Match Performance Ratings</span>
                      <span className="text-teal-400 text-[11px] font-semibold">FC 27 Matchday Engine</span>
                    </h4>
                    <div className="flex items-center justify-between gap-2">
                      {((stats?.recentRatings as number[]) || [8.5, 9.1, 7.8, 9.4, 8.9]).map((val, i) => (
                        <div key={i} className="flex-1 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-center">
                          <div className="text-[10px] text-slate-500">M-{i + 1}</div>
                          <div className="text-sm font-black text-amber-300 mt-0.5">{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
                      <div className="text-slate-400 text-[10px] uppercase">Clean Sheets</div>
                      <div className="text-base font-bold text-white mt-0.5">{stats?.cleanSheets ?? 6}</div>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
                      <div className="text-slate-400 text-[10px] uppercase">MOTM Awards</div>
                      <div className="text-base font-bold text-white mt-0.5">{stats?.motm ?? 4}</div>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
                      <div className="text-slate-400 text-[10px] uppercase">Win Ratio</div>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">78%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: EDIT PROFILE */}
              {activeTab === "edit" && editData && (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={editData.displayName}
                        onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Kit Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={editData.playerNumber}
                        onChange={(e) =>
                          setEditData({ ...editData, playerNumber: parseInt(e.target.value, 10) || 10 })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Form Rating & Squad Status (Management only) */}
                  {isOwnerOrManager && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <div>
                        <label className="block text-xs font-semibold text-amber-300 mb-1">
                          Form Rating (0 - 100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editData.formRating}
                          onChange={(e) =>
                            setEditData({ ...editData, formRating: parseInt(e.target.value, 10) || 75 })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-teal-300 mb-1">
                          Squad Status
                        </label>
                        <select
                          value={editData.squadStatus}
                          onChange={(e) =>
                            setEditData({ ...editData, squadStatus: e.target.value as SquadStatus })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                        >
                          <option value="STARTING_XI">STARTING_XI</option>
                          <option value="BENCH">BENCH</option>
                          <option value="RESERVE">RESERVE</option>
                          <option value="TRIALIST">TRIALIST</option>
                          <option value="UNAVAILABLE">UNAVAILABLE</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Availability Status
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["AVAILABLE", "MAYBE", "UNAVAILABLE"] as AvailabilityStatus[]).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setEditData({ ...editData, availability: status })}
                          className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                            editData.availability === status
                              ? "bg-teal-500/20 text-teal-300 border-teal-500/50"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Reason (if Maybe/Unavailable)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. School, Exam, Work"
                        value={editData.availabilityReason}
                        onChange={(e) => setEditData({ ...editData, availabilityReason: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Available After (e.g. 21:00)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 21:00"
                        value={editData.availableAfter}
                        onChange={(e) => setEditData({ ...editData, availableAfter: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Preferred Foot */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Preferred Foot
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Right", "Left", "Both"] as PreferredFoot[]).map((foot) => (
                        <button
                          key={foot}
                          type="button"
                          onClick={() => setEditData({ ...editData, preferredFoot: foot })}
                          className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                            editData.preferredFoot === foot
                              ? "bg-teal-500/20 text-teal-300 border-teal-500/50"
                              : "bg-slate-950 border-slate-800 text-slate-400"
                          }`}
                        >
                          {foot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Playstyle / Bio
                    </label>
                    <textarea
                      rows={3}
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("overview")}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black transition-all shadow-md"
                    >
                      {isSavingEdit ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
