// Ground truth power mappings and catalog discovered through reverse engineering MDickie: Infinite Lives

export const POWER_MAPPINGS = {
  powerAttack: {
    key: "powerAttack",
    name: "Attack Power",
    shortDesc: "Offensive ranged projectile or energy beam",
    icon: "zap",
    proven: [
      { id: 0, label: "None", badge: "Standard" },
      { id: 12, label: "Rockets (Explosive Projectile)", badge: "Verified" },
      { id: 1, label: "Laser (Energy Beam / Red Eye)", badge: "Probable" },
      { id: 10, label: "Arrows (Piercing Projectile)", badge: "Probable" },
      { id: 100, label: "Cell Division Beam", badge: "Observed" },
      { id: 110, label: "Grinder Pulse", badge: "Observed" },
    ],
    observed: [
      -18, -17, -15, -14, -13, -9, -8, -6, -5, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6,
      7, 8, 9, 10, 11, 12, 20, 21, 22, 23, 24, 31, 41, 42, 100, 110,
    ],
    tip: "Internal IDs differ completely from in-game alphabetical dropdowns (e.g. Rockets is #26 in UI, but ID 12 internally).",
  },
  projectileLimb: {
    key: "projectileLimb",
    name: "Projectile Limb",
    shortDesc: "The limb from which projectiles or beams emit",
    icon: "crosshair",
    proven: [
      { id: 0, label: "None", badge: "Default" },
      { id: 1, label: "Eyes (Laser Vision)", badge: "Verified" },
      { id: 2, label: "Mouth (Fire / Frost)", badge: "Verified" },
      { id: 3, label: "Hands (Energy Blast)", badge: "Verified" },
      { id: 4, label: "Feet (Kinetic Kick)", badge: "Verified" },
      { id: 5, label: "Torso (Chest Beam)", badge: "Verified" },
    ],
    observed: [0, 1, 2, 3, 4, 5],
    tip: "Stored as 3 slots (0, 1, 2) in save data. Typically set symmetrically across all three.",
  },
  powerFlight: {
    key: "powerFlight",
    name: "Movement Power",
    shortDesc: "Movement traversal, flight style, and speed enhancements",
    icon: "wind",
    proven: [
      { id: 1, label: "Default (Running)", badge: "Standard" },
      { id: -4, label: "Flight + Speed Boost", badge: "Verified" },
      { id: 0, label: "None (Grounded)", badge: "Observed" },
      { id: 2, label: "Flight Hover", badge: "Observed" },
      { id: 3, label: "Flight Levitation", badge: "Observed" },
      { id: 55, label: "Super Speed Sprint", badge: "Observed" },
      { id: -55, label: "Super Speed + Flight Combo", badge: "Observed" },
    ],
    observed: [-55, -4, -3, -2, 0, 1, 2, 3, 4, 5, 6, 55],
    tip: "Negative numbers encode combined flight with high-speed boosts.",
  },
  powerCraft: {
    key: "powerCraft",
    name: "Craft Power",
    shortDesc: "Object manipulation, duplication, and telekinetic grab",
    icon: "sparkles",
    proven: [
      { id: 0, label: "None", badge: "Standard" },
      { id: 4, label: "Duplication", badge: "Verified" },
      { id: -4, label: "Attraction + Duplication", badge: "Verified" },
      { id: -1, label: "Attraction / Magnetism", badge: "Observed" },
      { id: 2, label: "Item Crafting", badge: "Observed" },
      { id: 3, label: "Transmutation", badge: "Observed" },
    ],
    observed: [-5, -4, -3, -2, -1, 0, 2, 3, 4, 5],
    tip: "Positive IDs = Single power (e.g. 4 = Duplication). Negative IDs = Compound powers (e.g. -4 = Attraction + Duplication).",
  },
  powerInnate: {
    key: "powerInnate",
    name: "Innate Power",
    shortDesc: "Passive background superpowers and permanent buffs",
    icon: "infinity",
    proven: [
      { id: 0, label: "None", badge: "Standard" },
      { id: 12, label: "Infinite Ammo", badge: "Verified" },
      { id: 1, label: "Regeneration / Armor Buff", badge: "Observed" },
      { id: 4, label: "Synthetic Body", badge: "Observed" },
      { id: 13, label: "Weapon Specialist", badge: "Observed" },
    ],
    observed: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    tip: "Passive perks like infinite ammo.",
  },
  powerGrapple: {
    key: "powerGrapple",
    name: "Grapple Power",
    shortDesc: "Special supernatural maneuvers when grabbing an opponent",
    icon: "swords",
    proven: [
      { id: 0, label: "None", badge: "Standard" },
      { id: 41, label: "Insemination", badge: "Verified" },
      { id: 31, label: "Rope", badge: "Observed" },
      { id: 32, label: "Chain", badge: "Observed" },
      { id: 23, label: "Petrification", badge: "Observed" },
      { id: 21, label: "Wind", badge: "Observed" },
    ],
    observed: [
      -21, -20, -18, -17, -16, -15, -14, -13, -11, -10, -7, -6, -3, -2, 0, 2, 9,
      20, 21, 22, 23, 24, 31, 32, 33, 40, 41, 42,
    ],
    tip: "Triggers automatically when locking hands or grappling.",
  },
  powerManipulate: {
    key: "powerManipulate",
    name: "Interact Power",
    shortDesc: "environmental interaction",
    icon: "wand",
    proven: [
      { id: 0, label: "None", badge: "Standard" },
      { id: -1, label: "Disintegration (Touch of Death)", badge: "Verified" },
      { id: 1590, label: "Wind Manipulation", badge: "Observed" },
      { id: 1591, label: "Lightning Storm", badge: "Observed" },
      { id: 1592, label: "Earth Manipulation", badge: "Observed" },
      { id: 1593, label: "Fire Manipulation", badge: "Observed" },
      {
        id: 10000,
        label: "Invisibility",
        badge: "Observed",
      },
    ],
    observed: [
      -21, -20, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5,
      -4, -3, -2, -1, 0, 2, 9, 21, 23, 24, 40, 41, 42, 1590, 1591, 1592, 1593,
      10000,
    ],
    tip: "Values around 1590-1593 control elemental powers in MDickie games.",
  },
  transform: {
    key: "transform",
    name: "Transformation",
    shortDesc: "Trigger conditions and duration for alter-ego costume shifts",
    icon: "refresh",
    proven: [
      { id: 0, label: "None", badge: "Standard" },
      { id: 55, label: "Random Form Shift", badge: "Verified" },
      { id: 69, label: "Permanent", badge: "Verified" },
      { id: 120, label: "Costume Morph", badge: "Observed" },
      { id: -120, label: "Costume Morph -120", badge: "Observed" },
      { id: -500, label: "Inactive/Mecha", badge: "Observed" },
      { id: 838, label: "Beast Morph", badge: "Observed" },
      { id: 70, label: "Hold", badge: "Observed" },
    ],
    observed: [
      -838, -600, -500, -400, -300, -200, -120, -100, -70, -69, -68, -60, -55,
      -2, -1, 0, 1, 2, 55, 60, 68, 69, 70, 100, 120, 200, 300, 400, 500, 600,
      838,
    ],
    tip: "55 = Random form shifts. 69 = Permanent super alter-ego. Large numbers map to costume IDs.",
  },
  weakness: {
    key: "weakness",
    name: "Weakness",
    shortDesc: "Vulnerability",
    icon: "shield-alert",
    proven: [
      { id: 0, label: "None (Immune)", badge: "Verified" },
      { id: 5, label: "Active Weakness Slot 5", badge: "Verified" },
      { id: 1, label: "Thermal / Fire", badge: "Observed" },
      { id: 2, label: "Water / Submersion", badge: "Observed" },
      { id: 3, label: "Blunt Impact", badge: "Observed" },
      { id: 4, label: "Elemental", badge: "Observed" },
    ],
    observed: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    tip: "0 grants complete immunity from special superpower vulnerabilities.",
  },
};

// Stat and SuperStat attribute definitions
export const STAT_MAPPINGS = [
  {
    key: "0",
    name: "Strength",
    icon: "zap",
    shortDesc:
      "Strike damage, throwing force, lifting heavy objects & opponents",
    color: "text-amber-400",
    barColor: "bg-amber-500",
  },
  {
    key: "1",
    name: "Speed",
    icon: "wind",
    shortDesc:
      "Running velocity, flight traversal speed, attack cadence & recovery",
    color: "text-cyan-400",
    barColor: "bg-cyan-500",
  },
  {
    key: "2",
    name: "Stamina",
    icon: "shield-check",
    shortDesc:
      "Cardiovascular stamina, energy drain mitigation, health recovery",
    color: "text-emerald-400",
    barColor: "bg-emerald-500",
  },
  {
    key: "3",
    name: "Skill",
    icon: "crosshair",
    shortDesc:
      "Grapple dominance, submission defense, move accuracy & reversals",
    color: "text-purple-400",
    barColor: "bg-purple-500",
  },
  {
    key: "4",
    name: "Toughness",
    icon: "shield-alert",
    shortDesc: "Damage absorption, resistance to knockdowns, bullet deflection",
    color: "text-blue-400",
    barColor: "bg-blue-500",
  },
  {
    key: "5",
    name: "Spirit",
    icon: "sparkles",
    shortDesc: "Super adrenaline charge, morale, willpower & composure",
    color: "text-pink-400",
    barColor: "bg-pink-500",
  },
  {
    key: "6",
    name: "Popularity",
    icon: "user",
    shortDesc: "Public renown, contract leverage, crowd influence & plot armor",
    color: "text-yellow-400",
    barColor: "bg-yellow-500",
  },
  {
    key: "7",
    name: "Survival",
    icon: "infinity",
    shortDesc: "Sanity / mental fortitude in Extra Lives / Infinite Lives mode",
    color: "text-slate-400",
    barColor: "bg-slate-500",
  },
  {
    key: "8",
    name: "Immunity",
    icon: "shield-check",
    shortDesc: "Zombie virus resistance & secondary biological resilience",
    color: "text-slate-400",
    barColor: "bg-slate-500",
  },
];

// Power presets for 1-click loadout testing
export const POWER_PRESETS = [
  {
    name: "Rocket Overlord",
    description:
      "Full end-game loadout of Julian's Time Machine snapshot with max power amounts",
    badge: "Rosetta Stone",
    loadout: {
      powerAttack: 12,
      projectileLimb: { 0: 3, 1: 3, 2: 3 },
      powerInnate: 12,
      powerFlight: -4,
      powerCraft: 4,
      transform: 69,
      powerGrapple: 41,
      powerManipulate: -1,
      weakness: 0,
      spirit: 200,
      healthLimit: 100,
      health: 100,
      superStat: {
        0: 178.5,
        1: 199.0,
        2: 199.1,
        3: 183.2,
        4: 134.1,
        5: 176.1,
        6: 50.0,
      },
    },
  },
  {
    name: "Laser Android",
    description: "Eye beam lasers, synthetic durability, and hover levitation",
    badge: "Sci-Fi",
    loadout: {
      powerAttack: 1,
      projectileLimb: { 0: 1, 1: 1, 2: 1 },
      powerInnate: 4,
      powerFlight: 2,
      powerCraft: -1,
      transform: -120,
      powerGrapple: 32,
      powerManipulate: -18,
      weakness: 0,
      spirit: 150,
      healthLimit: 120,
      health: 120,
      superStat: {
        0: 140,
        1: 160,
        2: 150,
        3: 180,
        4: 190,
        5: 100,
        6: 60,
      },
    },
  },
  {
    name: "Thunder God (Storm Manipulator)",
    description: "Lightning strikes, aerial speed, and permanent divine aura",
    badge: "Elemental",
    loadout: {
      powerAttack: 1,
      projectileLimb: { 0: 3, 1: 3, 2: 3 },
      powerInnate: 12,
      powerFlight: -55,
      powerCraft: -4,
      transform: 69,
      powerGrapple: 32,
      powerManipulate: 1591,
      weakness: 0,
      spirit: 200,
      healthLimit: 150,
      health: 150,
      superStat: {
        0: 200,
        1: 200,
        2: 200,
        3: 180,
        4: 180,
        5: 200,
        6: 90,
      },
    },
  },
  {
    name: "Invincible Speedster",
    description:
      "Extreme velocity sprint, kinetic shockwaves, and total immunity",
    badge: "Speedster",
    loadout: {
      powerAttack: 0,
      projectileLimb: { 0: 4, 1: 4, 2: 4 },
      powerInnate: 1,
      powerFlight: 55,
      powerCraft: 4,
      transform: 69,
      powerGrapple: 31,
      powerManipulate: 0,
      weakness: 0,
      spirit: 200,
      healthLimit: 100,
      health: 100,
      superStat: {
        0: 120,
        1: 250,
        2: 200,
        3: 150,
        4: 120,
        5: 160,
        6: 80,
      },
    },
  },
  {
    name: "Normal Civilian (Reset)",
    description:
      "Reset all superhuman powers and stat amounts back to standard human defaults",
    badge: "Vanilla",
    loadout: {
      powerAttack: 0,
      projectileLimb: { 0: 0, 1: 0, 2: 0 },
      powerInnate: 0,
      powerFlight: 1,
      powerCraft: 0,
      transform: 0,
      powerGrapple: 0,
      powerManipulate: 0,
      weakness: 0,
      spirit: 100,
      healthLimit: 100,
      health: 100,
      superStat: {
        0: 100,
        1: 100,
        2: 100,
        3: 100,
        4: 100,
        5: 100,
        6: 50,
      },
    },
  },
];

export function cleanPowerLabel(label) {
  if (!label) return "";
  return label.replace(/\s*\([^)]*\)/g, "").trim();
}

export function formatPowerValue(fieldKey, value) {
  if (value === undefined || value === null) return "Not Set";

  if (fieldKey === "projectileLimb") {
    if (typeof value === "object") {
      const p = value["0"] ?? 0;
      const limb = POWER_MAPPINGS.projectileLimb.proven.find((l) => l.id === p);
      const name = limb ? limb.label : `Limb ID: ${p}`;
      return `${name} [${value["0"] ?? 0}, ${value["1"] ?? 0}, ${value["2"] ?? 0}]`;
    }
    const limb = POWER_MAPPINGS.projectileLimb.proven.find(
      (l) => l.id === Number(value),
    );
    return limb ? limb.label : `Limb ID: ${value}`;
  }

  if (fieldKey.startsWith("superStat.") || fieldKey.startsWith("stat.")) {
    const idx = fieldKey.split(".")[1];
    const statDef = STAT_MAPPINGS.find((s) => s.key === idx);
    const label = statDef ? statDef.name.split("/")[0].trim() : `Stat ${idx}`;
    return `${label}: ${Number(value).toFixed(1)}%`;
  }

  if (
    fieldKey === "spirit" ||
    fieldKey === "healthLimit" ||
    fieldKey === "health"
  ) {
    return `${Number(value).toFixed(1)}%`;
  }

  if (fieldKey === "gender") {
    return Number(value) === 1 ? "Female" : "Male";
  }

  if (fieldKey === "height") {
    const val = Number(value);
    const inches = val * 72;
    const feet = Math.floor(inches / 12);
    const remInches = Math.round(inches % 12);
    return `${val.toFixed(2)}x (~${feet}'${remInches}")`;
  }

  if (fieldKey === "muscleMass") {
    return `${Number(value).toFixed(1)}% Muscle`;
  }

  if (
    fieldKey === "bodyMass" ||
    fieldKey === "armMass" ||
    fieldKey === "legMass"
  ) {
    const num = Number(value);
    const sign = num > 0 ? "+" : "";
    return `${sign}${num.toFixed(1)}%`;
  }

  if (fieldKey === "headSize") {
    return `${Number(value).toFixed(2)}x Head`;
  }

  if (fieldKey === "age") {
    return `${value} yrs`;
  }

  if (fieldKey === "voice") {
    return `${Number(value).toFixed(2)}x Pitch`;
  }

  if (fieldKey === "gender") {
    return Number(value) === 1 ? "Female" : "Male";
  }

  if (fieldKey === "height") {
    const val = Number(value);
    const inches = val * 72;
    const feet = Math.floor(inches / 12);
    const remInches = Math.round(inches % 12);
    return `${val.toFixed(2)}x (~${feet}'${remInches}")`;
  }

  if (fieldKey === "muscleMass") {
    return `${Number(value).toFixed(1)}% Muscle`;
  }

  if (
    fieldKey === "bodyMass" ||
    fieldKey === "armMass" ||
    fieldKey === "legMass"
  ) {
    const num = Number(value);
    const sign = num > 0 ? "+" : "";
    return `${sign}${num.toFixed(1)}%`;
  }

  if (fieldKey === "headSize") {
    return `${Number(value).toFixed(2)}x Head`;
  }

  if (fieldKey === "age") {
    return `${value} yrs`;
  }

  if (fieldKey === "voice") {
    return `${Number(value).toFixed(2)}x Pitch`;
  }

  const field = POWER_MAPPINGS[fieldKey];
  if (!field) return String(value);

  const matched = field.proven.find((p) => p.id === Number(value));
  if (matched) {
    return cleanPowerLabel(matched.label);
  }

  return `Custom (${value})`;
}

export function isCharacterPowered(char) {
  if (!char) return false;
  const pA = Number(char.powerAttack ?? 0);
  const pI = Number(char.powerInnate ?? 0);
  const pF = Number(char.powerFlight ?? 1);
  const pG = Number(char.powerGrapple ?? 0);
  const pM = Number(char.powerManipulate ?? 0);
  const pC = Number(char.powerCraft ?? 0);
  const tr = Number(char.transform ?? 0);

  // Check if character has superStat boosted (> 120%)
  const hasSuperStats = Object.values(char.superStat || {}).some(
    (v) => Number(v) > 130,
  );

  return (
    pA !== 0 ||
    pI !== 0 ||
    pF !== 1 ||
    pG !== 0 ||
    pM !== 0 ||
    pC !== 0 ||
    (tr !== 0 && tr !== 55) ||
    hasSuperStats
  );
}

export const POWER_FIELDS = [
  "powerAttack",
  "projectileLimb",
  "powerFlight",
  "powerCraft",
  "powerInnate",
  "powerGrapple",
  "powerManipulate",
  "transform",
  "weakness",
];
