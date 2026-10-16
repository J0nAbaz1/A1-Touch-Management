export type Position =
  | "GK"
  | "LB"
  | "CB"
  | "RB"
  | "CDM"
  | "CM"
  | "CAM"
  | "LM"
  | "RM"
  | "LW"
  | "RW"
  | "ST";

export type Role = "OWNER" | "MANAGER" | "ASSISTANT_MANAGER" | "PLAYER";

export type AvailabilityStatus = "AVAILABLE" | "MAYBE" | "UNAVAILABLE";

export type SquadStatus = "STARTING_XI" | "BENCH" | "RESERVE" | "UNAVAILABLE" | "TRIALIST";

export type PreferredFoot = "Right" | "Left" | "Both";

export interface Player {
  id: number;
  userId?: number | null;
  displayName: string;
  discordUsername: string;
  eaFcUsername: string;
  mainPosition: Position;
  secondaryPosition: Position;
  thirdPosition?: Position | null;
  preferredFoot: PreferredFoot;
  playerNumber: number;
  availability: AvailabilityStatus;
  availabilityReason?: string | null;
  availableAfter?: string | null;
  formRating: number; // 0 - 100
  squadStatus: SquadStatus;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerNote {
  id: number;
  playerId: number;
  authorName: string;
  authorRole: string;
  note: string;
  createdAt: string;
}

export interface PitchSlot {
  slotId: string;
  label: Position | string;
  roleType: "GK" | "DEF" | "MID" | "ATT";
  x: number; // 0 to 100% from left
  y: number; // 0 to 100% from top (GK at ~88%, ST at ~12%)
  playerId: number | null;
}

export interface FormationDefinition {
  name: string;
  code: string;
  description: string;
  slots: PitchSlot[];
}

export interface SquadLineup {
  id: number;
  name: string;
  formation: string;
  isActive: boolean;
  startingSlots: PitchSlot[];
  benchPlayerIds: number[];
  updatedBy: string;
  updatedAt: string;
}

export interface PlayerRecommendation {
  player: Player;
  score: number;
  matchType: "MAIN" | "SECONDARY" | "THIRD" | "NONE";
  breakdown: {
    positionScore: number;
    formScore: number;
    availabilityScore: number;
  };
  isAlreadyAssigned: boolean;
  currentAssignedSlot?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  role: Role;
  playerId?: number | null;
}
