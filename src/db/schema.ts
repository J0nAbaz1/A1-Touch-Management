import { pgTable, serial, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 80 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 30 }).notNull().default("PLAYER"), // OWNER, MANAGER, ASSISTANT_MANAGER, PLAYER
  playerId: integer("player_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  discordUsername: varchar("discord_username", { length: 80 }).notNull(),
  eaFcUsername: varchar("ea_fc_username", { length: 80 }).notNull(),
  mainPosition: varchar("main_position", { length: 10 }).notNull(), // GK, LB, CB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST
  secondaryPosition: varchar("secondary_position", { length: 10 }).notNull(),
  thirdPosition: varchar("third_position", { length: 10 }),
  preferredFoot: varchar("preferred_foot", { length: 10 }).notNull().default("Right"), // Right, Left, Both
  playerNumber: integer("player_number").notNull().default(10),
  availability: varchar("availability", { length: 20 }).notNull().default("AVAILABLE"), // AVAILABLE, MAYBE, UNAVAILABLE
  availabilityReason: text("availability_reason"),
  availableAfter: varchar("available_after", { length: 30 }),
  formRating: integer("form_rating").notNull().default(75), // 0 to 100
  squadStatus: varchar("squad_status", { length: 30 }).notNull().default("RESERVE"), // STARTING_XI, BENCH, RESERVE, UNAVAILABLE, TRIALIST
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const playerNotes = pgTable("player_notes", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  authorName: varchar("author_name", { length: 100 }).notNull(),
  authorRole: varchar("author_role", { length: 50 }).notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const squadLineups = pgTable("squad_lineups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull().default("A1 Touch FC - Main Starting XI"),
  formation: varchar("formation", { length: 20 }).notNull().default("4-3-3"),
  isActive: boolean("is_active").notNull().default(true),
  // Array of { slotId: string, label: string, playerId: number | null, x: number, y: number }
  startingSlots: jsonb("starting_slots").notNull(),
  // Array of player ids for the 7 bench seats
  benchPlayerIds: jsonb("bench_player_ids").notNull().default([]),
  updatedBy: varchar("updated_by", { length: 100 }).notNull().default("Manager"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().unique(),
  games: integer("games").notNull().default(0),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  draws: integer("draws").notNull().default(0),
  cleanSheets: integer("clean_sheets").notNull().default(0),
  motm: integer("motm").notNull().default(0),
  avgRating: text("avg_rating").notNull().default("7.5"),
  recentRatings: jsonb("recent_ratings").notNull().default([7.8, 8.2, 7.5, 8.9, 8.0]),
});
