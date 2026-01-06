# Plant vs Aliens — Grid Defense Game

This document defines the gameplay rules and systems for a grid-based defense game inspired by Plants vs Zombies. It is the authoritative specification for how the game should behave.

---

## Game Overview

- Genre: Grid-based defense / strategy
- Playfield: 8×8 grid
- Aliens spawn from the right side and move left across rows
- Player places plants on grid tiles to stop aliens
- Aliens drop money when killed
- Money is used to place additional plants
- The game progresses in discrete rounds with pauses between them

---

## Core Gameplay Loop

1. A round starts.
2. A fixed number of aliens spawn for that round.
3. Player defends using plants.
4. When all aliens are destroyed, the round ends.
5. The game pauses between rounds.
6. Player receives bonus money.
7. Player prepares defenses.
8. Next round begins with increased difficulty.

---

## Grid Rules

- Grid size: 8 rows × 8 columns
- One plant per tile
- Aliens move within a single row
- Aliens stop to attack when colliding with a plant
- When a plant is destroyed, aliens continue moving
- Projectiles move horizontally and hit the first alien in the row
- Blocking / Queuing: A Wall Plant can only be engaged by one alien at a time. Additional aliens in that row queue up behind the engaged attacker with a small gap, cannot overlap the blocker, and only begin biting once the prior alien (or the plant) is gone.

---

## Starting Plants (4 Types)

### 1. Pea Shooter (Basic Damage)
- Cost: 50
- HP: 40 _(HP nerfed: 100 → 50 → 40)_
- Fires every 1.2 seconds
- Damage: 20
- Targets nearest alien in row

### 2. Sunflower (Economy)
- Cost: 50
- HP: 32 _(HP nerfed: 80 → 32)_
- Generates +25 money every 8 seconds
- Money must be collected

### 3. Wall Plant (Tank)
- Cost: 75
- HP: 160 _(HP nerfed: 400 → 160)_
- No attack
- Blocks alien movement

### 4. Ice Plant (Slow + Damage)
- Cost: 100
- HP: 36 _(HP nerfed: 90 → 36)_
- Fires every 1.8 seconds
- Damage: 15
- Applies ~35% slow for 2.5 seconds

---

## Alien Types (3)

### 1. Basic Alien
- HP: 96
- Speed: Normal
- Damage: 10/sec
- Reward: 25 money
- Resistances: None

### 2. Fast Alien
- HP: 150
- Speed: Fast
- Damage: 8/sec
- Reward: 30 money
- Resistances: Takes only 60% damage from Pea Shooters but 135% damage from Ice Plant projectiles, so it requires either two Peas or one Ice Plant to drop it in time.

### 3. Tank Alien
- HP: 320
- Speed: Slow
- Damage: 14/sec
- Reward: 50 money
- Resistances: Takes only 50% damage from Pea Shooters but 135% damage from Ice Plant projectiles. A single Pea cannot stop it in time; it needs an Ice Plant or multiple damage sources.

---

## Money System

- Starting money: 100
- Money sources:
  - Sunflower production
  - Alien death drops
  - End-of-round bonus (limited)
- Coin drops spawn exactly where they originate:
  - Sunflower coins appear centered on their tile.
  - Alien death coins appear at the alien’s row/column position when it falls.
  - Coins animate in place until collected and remain clickable during animation.
- End-of-round bonus:
  - Player receives **+100 money** for Rounds 1–4 only
  - Starting Round 5, no bonus money is awarded after clearing a round
- Money is required to place plants

---

## Round & Difficulty System

- The game progresses in **discrete rounds**
- No continuous spawning
- Aliens spawn only at the start (or evenly during) a round
- Between rounds, the game enters a **pause / build phase**

### Round Progression Rules

- Round 1: 2 aliens total
- Each subsequent round:
  - Alien count increases by **+3** compared to the previous round
- Example:
  - Round 1 → 2 aliens
  - Round 2 → 5 aliens
  - Round 3 → 8 aliens
  - Round 4 → 11 aliens
- Alien types are mixed progressively:
  - Early rounds: mostly basic
  - Later rounds: introduce fast, then tank aliens
- Aliens may **not** all spawn at once. They must appear gradually across the active round.
- A maximum of **3 aliens can be in the act of spawning simultaneously**. New spawns must wait until earlier spawns finish entering the board (or an open slot becomes free).
- Spawning continues in batches until the total alien count for the round is reached.

### Between-Round Phase

- Aliens do not spawn
- Player can:
  - Place plants
  - Collect leftover money drops
  - Strategically prepare defenses
- A “Start Next Round” button (or countdown) begins the next wave

---

## Win / Lose Conditions

- Win: All planned rounds completed
- Lose: Any alien reaches the left edge of the grid

---

## UI Requirements

- Money counter
- Current round indicator
- Plant selection bar with costs and cooldowns
  - Plant cards use a blue base color.
  - When the player can afford a plant, the bottom strip of that card turns yellow as an affordability indicator.
- Tile highlight during placement
- Between-round overlay (e.g. “Prepare Your Defense”)
- Win screen with restart
- Lose screen with restart
- All UI text renders in Montserrat (black text).
- Every interactive button (plant cards, round controls, restart, etc.) has a crisp black outline.

---

## Visual Style & Animation

- Placeholder visuals are **not** acceptable for plants or aliens once pixel assets ship.
- All **plants** must use higher-resolution retro pixel-art sprites (more pixels per sprite than earlier prototypes) with a looping idle animation (at least 2 frames) so they appear alive even while waiting.
- All **aliens** must also use higher-resolution pixel sprites with visible animation (idle and/or walk). They should feel in motion while advancing.
- Alien art must clearly scale with toughness:
  - Low-HP aliens use the smallest silhouettes, simple rounded forms, and calmer colors to feel least threatening.
  - Mid-HP aliens grow larger with sharper outlines/armor details to signal higher danger.
  - High-HP aliens are the largest, most aggressive silhouettes (spikes, armor, brighter warning colors) so their toughness is obvious at a glance.
- The battlefield background is a green garden scene with subtle pixel grass details to reinforce the setting.
- UI, overlays, and projectiles may still rely on placeholder treatments as needed, but characters (plants + aliens) must adhere to the pixel-art + animation rules above.

---

## Technical Intent

- Modular, system-based architecture
- Separate systems for grid, combat, economy, rounds, UI, and state
- No constraints on file or folder structure
- This document defines behavior, not implementation

---

# End of agents.md
