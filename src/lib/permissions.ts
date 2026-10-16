import { Role } from "./types";

export const PERMISSIONS = {
  canManageEverything: (role?: Role) => role === "OWNER",
  canManageSquad: (role?: Role) => role === "OWNER" || role === "MANAGER" || role === "ASSISTANT_MANAGER",
  canSaveLineup: (role?: Role) => role === "OWNER" || role === "MANAGER",
  canEditNotes: (role?: Role) => role === "OWNER" || role === "MANAGER" || role === "ASSISTANT_MANAGER",
  canEditAnyPlayer: (role?: Role) => role === "OWNER" || role === "MANAGER",
  canEditForm: (role?: Role) => role === "OWNER" || role === "MANAGER",
};
