"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AuthUser, PitchSlot, Player, Role, SquadLineup } from "@/lib/types";
import { FORMATIONS } from "@/lib/formations";
import { rankPlayersForPosition } from "@/lib/recommendation";
import { PERMISSIONS } from "@/lib/permissions";
import { Navbar } from "@/components/Navbar";
import { ClubDashboardHeader } from "@/components/ClubDashboardHeader";
import { PitchBoard } from "@/components/PitchBoard";
import { FormationSelector } from "@/components/FormationSelector";
import { PositionRecommendationModal } from "@/components/PositionRecommendationModal";
import { BenchReservesPanel } from "@/components/BenchReservesPanel";
import { PlayerRegistrationForm } from "@/components/PlayerRegistrationForm";
import { PlayerDatabaseTable } from "@/components/PlayerDatabaseTable";
import { PlayerProfileModal } from "@/components/PlayerProfileModal";
import { AuthModal } from "@/components/AuthModal";
import { ClubStatsTab } from "@/components/ClubStatsTab";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"tactics" | "players" | "register" | "stats">("tactics");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [lineup, setLineup] = useState<SquadLineup | null>(null);
  const [statsSummary, setStatsSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingLineup, setIsSavingLineup] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals
  const [activeSlotForModal, setActiveSlotForModal] = useState<PitchSlot | null>(null);
  const [inspectedPlayerId, setInspectedPlayerId] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Role permissions
  const canManage = PERMISSIONS.canManageSquad(currentUser?.role);

  // Load Session & Initial Data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      // 1. Session
      const sessionRes = await fetch("/api/auth");
      const sessionData = await sessionRes.json();
      setCurrentUser(sessionData.user || null);

      // 2. Players
      const playersRes = await fetch("/api/players");
      const playersData = await playersRes.json();
      setPlayers(playersData.players || []);

      // 3. Lineup
      const lineupRes = await fetch("/api/lineup");
      const lineupData = await lineupRes.json();
      setLineup(lineupData.lineup || null);

      // 4. Stats Summary
      const summaryRes = await fetch("/api/stats-summary");
      const summaryData = await summaryRes.json();
      setStatsSummary(summaryData);
    } catch (err) {
      console.error("Error initializing dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Player Map for fast lookups
  const playerMap = useMemo(() => {
    const map = new Map<number, Player>();
    for (const p of players) {
      map.set(p.id, p);
    }
    return map;
  }, [players]);

  // Current formation slots
  const currentSlots: PitchSlot[] = useMemo(() => {
    if (!lineup) return FORMATIONS["4-3-3"].slots;
    return (lineup.startingSlots as PitchSlot[]) || FORMATIONS[lineup.formation]?.slots || FORMATIONS["4-3-3"].slots;
  }, [lineup]);

  const assignedCount = useMemo(() => {
    return currentSlots.filter((s) => s.playerId !== null).length;
  }, [currentSlots]);

  // Flash Notification helper
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Switch Active Formation
  const handleSelectFormation = (formationCode: string) => {
    const targetDef = FORMATIONS[formationCode];
    if (!targetDef) return;

    // Smart repositioning: transfer assigned players where possible
    const currentAssigned = currentSlots.map((s) => s.playerId).filter(Boolean) as number[];
    const assignedSet = new Set<number>();

    const newSlots = targetDef.slots.map((newSlot, idx) => {
      // Check if slot with matching label previously had a player
      const matchingPrevious = currentSlots.find(
        (prev) => prev.label === newSlot.label && prev.playerId && !assignedSet.has(prev.playerId)
      );

      if (matchingPrevious && matchingPrevious.playerId) {
        assignedSet.add(matchingPrevious.playerId);
        return { ...newSlot, playerId: matchingPrevious.playerId };
      }

      // Or fill with next unassigned from previous starting XI
      const nextAvailable = currentAssigned.find((id) => !assignedSet.has(id));
      if (nextAvailable) {
        assignedSet.add(nextAvailable);
        return { ...newSlot, playerId: nextAvailable };
      }

      return { ...newSlot, playerId: null };
    });

    if (lineup) {
      setLineup({
        ...lineup,
        formation: formationCode,
        startingSlots: newSlots,
      });
    }
    showNotification("success", `Formation changed to ${targetDef.name} (${formationCode}). Click Save to persist.`);
  };

  // Slot clicked on pitch
  const handleSlotClick = (slot: PitchSlot) => {
    setActiveSlotForModal(slot);
  };

  // Assign player to slot (prevents duplicate in Starting XI)
  const handleAssignPlayerToSlot = (slotId: string, playerId: number) => {
    if (!lineup) return;

    // Check if player is already assigned elsewhere in the starting XI
    const updatedSlots = currentSlots.map((s) => {
      if (s.slotId === slotId) {
        return { ...s, playerId };
      }
      if (s.playerId === playerId) {
        // Player was in another slot; clear previous slot to prevent duplicates
        return { ...s, playerId: null };
      }
      return s;
    });

    // Also remove from bench if they were on bench
    const updatedBench = (lineup.benchPlayerIds || []).filter((id) => id !== playerId);

    setLineup({
      ...lineup,
      startingSlots: updatedSlots,
      benchPlayerIds: updatedBench,
    });

    const chosenPlayer = playerMap.get(playerId);
    showNotification("success", `${chosenPlayer?.displayName || "Player"} placed into Starting XI!`);
  };

  // Remove player from pitch slot
  const handleRemovePlayerFromSlot = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lineup) return;

    const updatedSlots = currentSlots.map((s) => (s.slotId === slotId ? { ...s, playerId: null } : s));

    setLineup({
      ...lineup,
      startingSlots: updatedSlots,
    });
    showNotification("success", "Player removed from Starting XI slot.");
  };

  // Clear slot from recommendation modal
  const handleClearSlotFromModal = (slotId: string) => {
    if (!lineup) return;
    const updatedSlots = currentSlots.map((s) => (s.slotId === slotId ? { ...s, playerId: null } : s));

    setLineup({
      ...lineup,
      startingSlots: updatedSlots,
    });
    setActiveSlotForModal(null);
  };

  // Clear all pitch positions
  const handleClearFormation = () => {
    if (!lineup) return;
    if (!confirm("Clear all starting players from the pitch?")) return;

    const cleared = currentSlots.map((s) => ({ ...s, playerId: null }));
    setLineup({
      ...lineup,
      startingSlots: cleared,
    });
    showNotification("success", "Starting XI pitch cleared.");
  };

  // Auto-Fill Best XI using recommendation algorithm
  const handleAutoRecommendSquad = () => {
    if (!lineup) return;

    const targetDef = FORMATIONS[lineup.formation] || FORMATIONS["4-3-3"];
    const assignedPlayerIds = new Set<number>();
    const newSlots = [...targetDef.slots];

    // Priority order: First GK, then Defenders, then Attackers, then Midfielders
    const sortedSlots = [...newSlots].sort((a, b) => {
      const order = { GK: 1, DEF: 2, ATT: 3, MID: 4 };
      return (order[a.roleType] || 5) - (order[b.roleType] || 5);
    });

    for (const slot of sortedSlots) {
      // Rank available players who are not yet assigned
      const unassigned = players.filter((p) => !assignedPlayerIds.has(p.id));
      const ranked = rankPlayersForPosition(slot.label, unassigned, []);

      if (ranked.length > 0 && ranked[0].player) {
        const bestCandidate = ranked[0].player;
        assignedPlayerIds.add(bestCandidate.id);

        const targetIndex = newSlots.findIndex((s) => s.slotId === slot.slotId);
        if (targetIndex !== -1) {
          newSlots[targetIndex] = {
            ...newSlots[targetIndex],
            playerId: bestCandidate.id,
          };
        }
      }
    }

    setLineup({
      ...lineup,
      startingSlots: newSlots,
    });
    showNotification("success", "Auto-filled Starting XI with highest-scoring in-form available players!");
  };

  // Update Bench Substitutes
  const handleUpdateBench = (newBenchIds: number[]) => {
    if (!lineup) return;
    setLineup({
      ...lineup,
      benchPlayerIds: newBenchIds,
    });
    showNotification("success", "Substitutes bench updated.");
  };

  // Save Lineup to Backend
  const handleSaveLineup = async () => {
    if (!lineup) return;
    try {
      setIsSavingLineup(true);
      const res = await fetch("/api/lineup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formation: lineup.formation,
          startingSlots: currentSlots,
          benchPlayerIds: lineup.benchPlayerIds,
          name: lineup.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save lineup");

      setLineup(data.lineup);
      await loadData();
      showNotification("success", "Starting XI and tactical lineup saved successfully to database!");
    } catch (err: any) {
      showNotification("error", err.message || "Failed to save lineup");
    } finally {
      setIsSavingLineup(false);
    }
  };

  // Quick switch role
  const handleQuickSwitchRole = async (targetRole: Role) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "quick_switch", targetRole }),
      });
      const data = await res.json();
      if (data.ok) {
        setCurrentUser(data.user);
        showNotification("success", `Active Role switched to ${targetRole}. Permissions updated.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setCurrentUser(null);
    showNotification("success", "Signed out successfully.");
  };

  // Delete player (Owner only)
  const handleDeletePlayer = async (playerId: number) => {
    try {
      const res = await fetch(`/api/players/${playerId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete player");

      showNotification("success", "Player removed from club database.");
      await loadData();
    } catch (err: any) {
      showNotification("error", err.message || "Could not delete player");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickSwitchRole={handleQuickSwitchRole}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Floating Alert Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-semibold backdrop-blur-md ${
              notification.type === "success"
                ? "bg-slate-900/95 border-teal-500/60 text-teal-200 shadow-teal-500/10"
                : "bg-slate-900/95 border-rose-500/60 text-rose-200 shadow-rose-500/10"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Club Dashboard Header */}
        <ClubDashboardHeader
          currentFormation={lineup?.formation || "4-3-3"}
          formationName={FORMATIONS[lineup?.formation || "4-3-3"]?.name || "4-3-3 Attack"}
          statsSummary={statsSummary}
          currentUser={currentUser}
          startingAssignedCount={assignedCount}
        />

        {/* TAB 1: TACTICS & STARTING XI BUILDER */}
        {activeTab === "tactics" && (
          <div className="space-y-6">
            {/* Formation Selector & Controls */}
            <FormationSelector
              currentFormation={lineup?.formation || "4-3-3"}
              onSelectFormation={handleSelectFormation}
              onSaveLineup={handleSaveLineup}
              onClearFormation={handleClearFormation}
              onAutoRecommend={handleAutoRecommendSquad}
              isSaving={isSavingLineup}
              canManage={canManage}
            />

            {/* Pitch & Bench Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Pitch Visualizer (Main visual element) */}
              <div className="lg:col-span-7 xl:col-span-8">
                <PitchBoard
                  slots={currentSlots}
                  playerMap={playerMap}
                  onSlotClick={handleSlotClick}
                  onRemovePlayerFromSlot={handleRemovePlayerFromSlot}
                  onOpenPlayerProfile={(playerId) => setInspectedPlayerId(playerId)}
                  canManage={canManage}
                />
              </div>

              {/* Bench & Reserves Sidebar */}
              <div className="lg:col-span-5 xl:col-span-4">
                <BenchReservesPanel
                  allPlayers={players}
                  startingSlots={currentSlots}
                  benchPlayerIds={lineup?.benchPlayerIds || []}
                  onUpdateBench={handleUpdateBench}
                  onOpenPlayerProfile={(playerId) => setInspectedPlayerId(playerId)}
                  canManage={canManage}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLAYER DATABASE & SEARCH / FILTERS */}
        {activeTab === "players" && (
          <PlayerDatabaseTable
            players={players}
            onOpenProfile={(playerId) => setInspectedPlayerId(playerId)}
            onDeletePlayer={handleDeletePlayer}
            currentUserRole={currentUser?.role}
            onRefresh={loadData}
          />
        )}

        {/* TAB 3: PLAYER REGISTRATION FORM */}
        {activeTab === "register" && (
          <PlayerRegistrationForm
            onSuccess={() => {
              loadData();
            }}
          />
        )}

        {/* TAB 4: FC 27 CLUB STATS & MATCHES */}
        {activeTab === "stats" && (
          <ClubStatsTab
            players={players}
            onOpenPlayerProfile={(playerId) => setInspectedPlayerId(playerId)}
          />
        )}
      </main>

      {/* Position Recommendation Modal */}
      {activeSlotForModal && (
        <PositionRecommendationModal
          slot={activeSlotForModal}
          allPlayers={players}
          allSlots={currentSlots}
          onClose={() => setActiveSlotForModal(null)}
          onAssignPlayer={handleAssignPlayerToSlot}
          onClearSlot={handleClearSlotFromModal}
          onOpenPlayerProfile={(id) => {
            setActiveSlotForModal(null);
            setInspectedPlayerId(id);
          }}
          canManage={canManage}
        />
      )}

      {/* Player Profile & Notes Modal */}
      {inspectedPlayerId !== null && (
        <PlayerProfileModal
          playerId={inspectedPlayerId}
          onClose={() => setInspectedPlayerId(null)}
          currentUserRole={currentUser?.role}
          currentUserId={currentUser?.id}
          onPlayerUpdated={loadData}
        />
      )}

      {/* Sign In / Auth Modal */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            showNotification("success", `Signed in as ${user.displayName}`);
          }}
          onQuickRoleSwitch={handleQuickSwitchRole}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">A1 TOUCH FC</span>
            <span>•</span>
            <span>EA FC 27 Tactical Management System</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Engineered with Next.js, PostgreSQL Drizzle ORM, &amp; Python SQLite Schema Compatible.
          </div>
        </div>
      </footer>
    </div>
  );
}
