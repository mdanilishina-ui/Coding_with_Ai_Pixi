export const GRID_ROWS = 8;
export const GRID_COLS = 8;
export const STARTING_MONEY = 100;
export const MONEY_DROP_LIFETIME = 10000; // ms
export const TILE_SIZE = 70; // fallback, recalculated from layout

export const PLANT_TYPES = {
  pea: {
    key: "pea",
    name: "Pea Shooter",
    cost: 50,
    maxHP: 40,
    damage: 20,
    fireRate: 1200,
    description: "Basic ranged damage.",
  },
  sun: {
    key: "sun",
    name: "Sunflower",
    cost: 50,
    maxHP: 32,
    generateInterval: 8000,
    generateAmount: 25,
    description: "Spawns money drops.",
  },
  wall: {
    key: "wall",
    name: "Wall Plant",
    cost: 75,
    maxHP: 160,
    description: "High health blocker.",
  },
  ice: {
    key: "ice",
    name: "Ice Plant",
    cost: 100,
    maxHP: 36,
    damage: 15,
    fireRate: 1800,
    slowPercent: 0.35,
    slowDuration: 2500,
    description: "Slows aliens on hit.",
  },
};

export const ALIEN_TYPES = {
  basic: {
    key: "basic",
    name: "Basic Alien",
    hp: 96,
    speed: 0.6, // tiles per second
    damagePerSecond: 10,
    reward: 25,
  },
  fast: {
    key: "fast",
    name: "Fast Alien",
    hp: 150,
    speed: 0.85,
    damagePerSecond: 8,
    reward: 30,
    resistances: {
      pea: 0.6,
      ice: 1.35,
    },
  },
  tank: {
    key: "tank",
    name: "Tank Alien",
    hp: 320,
    speed: 0.4,
    damagePerSecond: 14,
    reward: 50,
    resistances: {
      pea: 0.5,
      ice: 1.35,
    },
  },
};
