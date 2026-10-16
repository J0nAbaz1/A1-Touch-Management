import { Player, PlayerRecommendation, Position } from "./types";

export function getFormDetails(rating: number): {
  label: string;
  flames: string;
  flameCount: number;
  colorClass: string;
  badgeBg: string;
} {
  if (rating >= 90) {
    return {
      label: "Excellent",
      flames: "🔥🔥🔥🔥🔥",
      flameCount: 5,
      colorClass: "text-emerald-400",
      badgeBg: "bg-emerald-950/80 border-emerald-500/50 text-emerald-300",
    };
  }
  if (rating >= 80) {
    return {
      label: "Very Good",
      flames: "🔥🔥🔥🔥",
      flameCount: 4,
      colorClass: "text-teal-400",
      badgeBg: "bg-teal-950/80 border-teal-500/50 text-teal-300",
    };
  }
  if (rating >= 70) {
    return {
      label: "Good",
      flames: "🔥🔥🔥",
      flameCount: 3,
      colorClass: "text-cyan-400",
      badgeBg: "bg-cyan-950/80 border-cyan-500/50 text-cyan-300",
    };
  }
  if (rating >= 60) {
    return {
      label: "Average",
      flames: "🔥🔥",
      flameCount: 2,
      colorClass: "text-amber-400",
      badgeBg: "bg-amber-950/80 border-amber-500/50 text-amber-300",
    };
  }
  return {
    label: "Poor",
    flames: "🔥",
    flameCount: 1,
    colorClass: "text-rose-400",
    badgeBg: "bg-rose-950/80 border-rose-500/50 text-rose-300",
  };
}

export function rankPlayersForPosition(
  targetPosition: string,
  allPlayers: Player[],
  currentlyAssignedSlots: { slotId: string; playerId: number | null; label: string }[]
): PlayerRecommendation[] {
  const normTarget = targetPosition.trim().toUpperCase() as Position;

  const assignedMap = new Map<number, string>();
  for (const s of currentlyAssignedSlots) {
    if (s.playerId) {
      assignedMap.set(s.playerId, s.label);
    }
  }

  const recommendations: PlayerRecommendation[] = allPlayers.map((player) => {
    let positionScore = 0;
    let matchType: PlayerRecommendation["matchType"] = "NONE";

    if (player.mainPosition === normTarget) {
      positionScore = 100;
      matchType = "MAIN";
    } else if (player.secondaryPosition === normTarget) {
      positionScore = 70;
      matchType = "SECONDARY";
    } else if (player.thirdPosition === normTarget) {
      positionScore = 50;
      matchType = "THIRD";
    }

    const formScore = Number(player.formRating) || 0;

    let availabilityScore = 0;
    if (player.availability === "AVAILABLE") {
      availabilityScore = 25;
    } else if (player.availability === "MAYBE") {
      availabilityScore = -15;
    } else if (player.availability === "UNAVAILABLE") {
      availabilityScore = -60;
    }

    const totalScore = positionScore + formScore + availabilityScore;

    return {
      player,
      score: totalScore,
      matchType,
      breakdown: {
        positionScore,
        formScore,
        availabilityScore,
      },
      isAlreadyAssigned: assignedMap.has(player.id),
      currentAssignedSlot: assignedMap.get(player.id),
    };
  });

  // Sort according to system priority:
  // 1. Position match priority (MAIN > SECONDARY > THIRD > NONE)
  // 2. Score (which includes form + availability)
  recommendations.sort((a, b) => {
    const priorityWeight = (m: PlayerRecommendation["matchType"]) => {
      switch (m) {
        case "MAIN":
          return 4000;
        case "SECONDARY":
          return 3000;
        case "THIRD":
          return 2000;
        default:
          return 0;
      }
    };

    const netA = priorityWeight(a.matchType) + a.score;
    const netB = priorityWeight(b.matchType) + b.score;

    return netB - netA;
  });

  return recommendations;
}
