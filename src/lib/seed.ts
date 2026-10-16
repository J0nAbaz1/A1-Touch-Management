import { db } from "@/db";
import { users, players, playerNotes, squadLineups, playerStats } from "@/db/schema";
import { hashPassword } from "./auth";
import { FORMATIONS } from "./formations";
import { eq, sql } from "drizzle-orm";

export async function seedDatabaseIfEmpty() {
  try {
    const existingPlayers = await db.select().from(players).limit(1);
    if (existingPlayers.length > 0) {
      return { seeded: false, message: "Database already contains players" };
    }

    const defaultPasswordHash = await hashPassword("a1touch2027");

    // 1. Create Default Users (Owner, Manager, Assistant Manager)
    const [ownerUser] = await db
      .insert(users)
      .values({
        username: "owner",
        displayName: "A1 Touch Chairman (Owner)",
        passwordHash: defaultPasswordHash,
        role: "OWNER",
      })
      .returning();

    const [managerUser] = await db
      .insert(users)
      .values({
        username: "manager",
        displayName: "Head Coach Marcus",
        passwordHash: defaultPasswordHash,
        role: "MANAGER",
      })
      .returning();

    const [asstManagerUser] = await db
      .insert(users)
      .values({
        username: "asst_manager",
        displayName: "Assistant Coach Cole",
        passwordHash: defaultPasswordHash,
        role: "ASSISTANT_MANAGER",
      })
      .returning();

    // 2. Initial Squad of 16 players
    const initialPlayers = [
      {
        displayName: "Messi",
        discordUsername: "messi_a1#1010",
        eaFcUsername: "A1_Messi10",
        mainPosition: "RW",
        secondaryPosition: "CAM",
        thirdPosition: "ST",
        preferredFoot: "Right",
        playerNumber: 10,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 92,
        squadStatus: "STARTING_XI",
        bio: "Elite playmaker and clinical finisher. Dangerous cutting inside on the left foot.",
      },
      {
        displayName: "A1_Apex",
        discordUsername: "apex_touch#0001",
        eaFcUsername: "A1_ApexStrike",
        mainPosition: "ST",
        secondaryPosition: "LW",
        thirdPosition: "RW",
        preferredFoot: "Right",
        playerNumber: 9,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 94,
        squadStatus: "STARTING_XI",
        bio: "Prolific talisman striker with explosive speed and lethal weak-foot finishing.",
      },
      {
        displayName: "A1_Viper",
        discordUsername: "viper_fc#7777",
        eaFcUsername: "A1_ViperLW",
        mainPosition: "LW",
        secondaryPosition: "ST",
        thirdPosition: "CAM",
        preferredFoot: "Left",
        playerNumber: 11,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 88,
        squadStatus: "STARTING_XI",
        bio: "Pacy inverted winger capable of beating any full-back on the dribble.",
      },
      {
        displayName: "A1_Matrix",
        discordUsername: "matrix_cm#8888",
        eaFcUsername: "A1_Matrix8",
        mainPosition: "CAM",
        secondaryPosition: "CM",
        thirdPosition: "RM",
        preferredFoot: "Both",
        playerNumber: 8,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 91,
        squadStatus: "STARTING_XI",
        bio: "Engine room conductor with 5-star skill moves and pinpoint through-balls.",
      },
      {
        displayName: "A1_Kante",
        discordUsername: "kante_engine#0006",
        eaFcUsername: "A1_Kante6",
        mainPosition: "CDM",
        secondaryPosition: "CM",
        thirdPosition: "CB",
        preferredFoot: "Right",
        playerNumber: 6,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 95,
        squadStatus: "STARTING_XI",
        bio: "Relentless ball-winner who intercepts everything in the midfield third.",
      },
      {
        displayName: "A1_Modric",
        discordUsername: "luka_play#1414",
        eaFcUsername: "A1_Luka14",
        mainPosition: "CM",
        secondaryPosition: "CAM",
        thirdPosition: "CDM",
        preferredFoot: "Right",
        playerNumber: 14,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 89,
        squadStatus: "STARTING_XI",
        bio: "Maestro with trivela passes and tactical tempo control.",
      },
      {
        displayName: "A1_Wall",
        discordUsername: "wall_def#0404",
        eaFcUsername: "A1_Wall4",
        mainPosition: "CB",
        secondaryPosition: "CDM",
        thirdPosition: "LB",
        preferredFoot: "Right",
        playerNumber: 4,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 93,
        squadStatus: "STARTING_XI",
        bio: "Towering central defender, impenetrable in aerial duels and standing tackles.",
      },
      {
        displayName: "A1_Titan",
        discordUsername: "titan_cb#0505",
        eaFcUsername: "A1_Titan5",
        mainPosition: "CB",
        secondaryPosition: "RB",
        thirdPosition: "CDM",
        preferredFoot: "Right",
        playerNumber: 5,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 87,
        squadStatus: "STARTING_XI",
        bio: "Physical monster who dominates opposition target men and leads backline communications.",
      },
      {
        displayName: "A1_Turbo",
        discordUsername: "turbo_lb#0303",
        eaFcUsername: "A1_Turbo3",
        mainPosition: "LB",
        secondaryPosition: "LM",
        thirdPosition: "CB",
        preferredFoot: "Left",
        playerNumber: 3,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 84,
        squadStatus: "STARTING_XI",
        bio: "High stamina wing-back who provides overlapping width and whipped crosses.",
      },
      {
        displayName: "A1_Flash",
        discordUsername: "flash_rb#0202",
        eaFcUsername: "A1_Flash2",
        mainPosition: "RB",
        secondaryPosition: "RM",
        thirdPosition: "CB",
        preferredFoot: "Right",
        playerNumber: 2,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 86,
        squadStatus: "STARTING_XI",
        bio: "Speedy recovery defender and reliable build-up outlet under heavy press.",
      },
      {
        displayName: "A1_Shield",
        discordUsername: "shield_gk#0101",
        eaFcUsername: "A1_Shield1",
        mainPosition: "GK",
        secondaryPosition: "CB",
        thirdPosition: null,
        preferredFoot: "Right",
        playerNumber: 1,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 90,
        squadStatus: "STARTING_XI",
        bio: "Cat-like reflexes, commanding presence in the box and quick counter distributions.",
      },
      {
        displayName: "A1_Ghost",
        discordUsername: "ghost_sub#1717",
        eaFcUsername: "A1_Ghost17",
        mainPosition: "ST",
        secondaryPosition: "CAM",
        thirdPosition: "RW",
        preferredFoot: "Both",
        playerNumber: 17,
        availability: "MAYBE",
        availabilityReason: "School exam revision",
        availableAfter: "21:00",
        formRating: 81,
        squadStatus: "BENCH",
        bio: "Super-sub poacher who always finds space in tight penalty boxes.",
      },
      {
        displayName: "A1_Shadow",
        discordUsername: "shadow_sub#1919",
        eaFcUsername: "A1_Shadow19",
        mainPosition: "CM",
        secondaryPosition: "CDM",
        thirdPosition: "CAM",
        preferredFoot: "Right",
        playerNumber: 19,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 78,
        squadStatus: "BENCH",
        bio: "Hard-working box-to-box midfielder with high defensive work rate.",
      },
      {
        displayName: "A1_Blaze",
        discordUsername: "blaze_sub#2121",
        eaFcUsername: "A1_Blaze21",
        mainPosition: "RW",
        secondaryPosition: "RM",
        thirdPosition: "LW",
        preferredFoot: "Left",
        playerNumber: 21,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 83,
        squadStatus: "BENCH",
        bio: "Direct dribbler with sharp finesse shots into the far top corner.",
      },
      {
        displayName: "A1_Sentinel",
        discordUsername: "sentinel_sub#2323",
        eaFcUsername: "A1_Sentinel23",
        mainPosition: "CB",
        secondaryPosition: "LB",
        thirdPosition: "RB",
        preferredFoot: "Right",
        playerNumber: 23,
        availability: "MAYBE",
        availabilityReason: "Work shift finishes at 20:30",
        availableAfter: "20:30",
        formRating: 79,
        squadStatus: "BENCH",
        bio: "Versatile defensive cover across the entire back four.",
      },
      {
        displayName: "A1_Gloves",
        discordUsername: "gloves_gk#1212",
        eaFcUsername: "A1_Gloves12",
        mainPosition: "GK",
        secondaryPosition: "CB",
        thirdPosition: null,
        preferredFoot: "Left",
        playerNumber: 12,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 76,
        squadStatus: "BENCH",
        bio: "Reliable backup shot-stopper with great penalty saving record.",
      },
      {
        displayName: "A1_Rookie",
        discordUsername: "rookie_trial#9999",
        eaFcUsername: "A1_Rookie99",
        mainPosition: "ST",
        secondaryPosition: "LW",
        thirdPosition: "CAM",
        preferredFoot: "Right",
        playerNumber: 29,
        availability: "UNAVAILABLE",
        availabilityReason: "Out of town this weekend",
        availableAfter: null,
        formRating: 64,
        squadStatus: "TRIALIST",
        bio: "New trialist showcasing high technical ceiling, needs tactical cohesion.",
      },
      {
        displayName: "A1_Iron",
        discordUsername: "iron_res#1818",
        eaFcUsername: "A1_Iron18",
        mainPosition: "CDM",
        secondaryPosition: "CB",
        thirdPosition: "CM",
        preferredFoot: "Right",
        playerNumber: 18,
        availability: "AVAILABLE",
        availabilityReason: null,
        availableAfter: null,
        formRating: 75,
        squadStatus: "RESERVE",
        bio: "No-nonsense ball destroyer providing solid depth for tournaments.",
      },
    ];

    const insertedPlayers: any[] = [];
    for (const p of initialPlayers) {
      // create user account for player
      const username = p.eaFcUsername.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const [u] = await db
        .insert(users)
        .values({
          username,
          displayName: p.displayName,
          passwordHash: defaultPasswordHash,
          role: "PLAYER",
        })
        .returning();

      const [newPlayer] = await db
        .insert(players)
        .values({
          userId: u.id,
          displayName: p.displayName,
          discordUsername: p.discordUsername,
          eaFcUsername: p.eaFcUsername,
          mainPosition: p.mainPosition,
          secondaryPosition: p.secondaryPosition,
          thirdPosition: p.thirdPosition,
          preferredFoot: p.preferredFoot,
          playerNumber: p.playerNumber,
          availability: p.availability,
          availabilityReason: p.availabilityReason,
          availableAfter: p.availableAfter,
          formRating: p.formRating,
          squadStatus: p.squadStatus,
          bio: p.bio,
        })
        .returning();

      await db.update(users).set({ playerId: newPlayer.id }).where(eq(users.id, u.id));
      insertedPlayers.push(newPlayer);

      // Create future-proof player stats
      await db.insert(playerStats).values({
        playerId: newPlayer.id,
        games: Math.floor(Math.random() * 20) + 5,
        goals: ["ST", "LW", "RW", "CAM"].includes(p.mainPosition) ? Math.floor(Math.random() * 18) + 4 : Math.floor(Math.random() * 3),
        assists: ["CAM", "CM", "LW", "RW"].includes(p.mainPosition) ? Math.floor(Math.random() * 15) + 3 : Math.floor(Math.random() * 4),
        wins: Math.floor(Math.random() * 15) + 5,
        losses: Math.floor(Math.random() * 5) + 1,
        draws: Math.floor(Math.random() * 4),
        cleanSheets: ["GK", "CB", "LB", "RB", "CDM"].includes(p.mainPosition) ? Math.floor(Math.random() * 10) + 3 : 0,
        motm: Math.floor(Math.random() * 5),
        avgRating: (7.2 + Math.random() * 1.8).toFixed(1),
        recentRatings: [8.5, 9.1, 7.8, 9.4, 8.9],
      });
    }

    // 3. Add management notes for key players (like in prompt example)
    const messi = insertedPlayers.find((p) => p.displayName === "Messi");
    if (messi) {
      await db.insert(playerNotes).values([
        {
          playerId: messi.id,
          authorName: "Head Coach Marcus",
          authorRole: "MANAGER",
          note: "Very good 1v1. Strong passing and vision under pressure. Can play CAM seamlessly.",
        },
        {
          playerId: messi.id,
          authorName: "Assistant Coach Cole",
          authorRole: "ASSISTANT_MANAGER",
          note: "Needs to improve defensive tracking when opposition wing-backs overlap.",
        },
      ]);
    }

    const apex = insertedPlayers.find((p) => p.displayName === "A1_Apex");
    if (apex) {
      await db.insert(playerNotes).values([
        {
          playerId: apex.id,
          authorName: "Head Coach Marcus",
          authorRole: "MANAGER",
          note: "First choice ST. Outstanding speed on breakaways. Clinical finish with both feet.",
        },
      ]);
    }

    const kante = insertedPlayers.find((p) => p.displayName === "A1_Kante");
    if (kante) {
      await db.insert(playerNotes).values([
        {
          playerId: kante.id,
          authorName: "Head Coach Marcus",
          authorRole: "MANAGER",
          note: "Indispensable CDM. High defensive awareness, breaks counter-attacks effortlessly.",
        },
      ]);
    }

    // 4. Initial Squad Lineup: 4-3-3 with full 11 starters and bench
    const defaultFormation = FORMATIONS["4-3-3"];
    const startingMap: Record<string, number | null> = {
      "pos-gk": insertedPlayers.find((p) => p.mainPosition === "GK")?.id || null,
      "pos-lb": insertedPlayers.find((p) => p.displayName === "A1_Turbo")?.id || null,
      "pos-lcb": insertedPlayers.find((p) => p.displayName === "A1_Wall")?.id || null,
      "pos-rcb": insertedPlayers.find((p) => p.displayName === "A1_Titan")?.id || null,
      "pos-rb": insertedPlayers.find((p) => p.displayName === "A1_Flash")?.id || null,
      "pos-cdm": insertedPlayers.find((p) => p.displayName === "A1_Kante")?.id || null,
      "pos-lcm": insertedPlayers.find((p) => p.displayName === "A1_Modric")?.id || null,
      "pos-rcm": insertedPlayers.find((p) => p.displayName === "A1_Matrix")?.id || null,
      "pos-lw": insertedPlayers.find((p) => p.displayName === "A1_Viper")?.id || null,
      "pos-st": insertedPlayers.find((p) => p.displayName === "A1_Apex")?.id || null,
      "pos-rw": messi?.id || null,
    };

    const slotsWithPlayers = defaultFormation.slots.map((slot) => ({
      ...slot,
      playerId: startingMap[slot.slotId] ?? null,
    }));

    const benchPlayers = insertedPlayers
      .filter((p) => ["BENCH"].includes(p.squadStatus))
      .map((p) => p.id)
      .slice(0, 7);

    await db.insert(squadLineups).values({
      name: "A1 Touch FC - FC 27 Matchday Starting XI",
      formation: "4-3-3",
      isActive: true,
      startingSlots: slotsWithPlayers,
      benchPlayerIds: benchPlayers,
      updatedBy: "Head Coach Marcus",
    });

    return { seeded: true, count: insertedPlayers.length };
  } catch (err) {
    console.error("Error seeding database:", err);
    throw err;
  }
}
