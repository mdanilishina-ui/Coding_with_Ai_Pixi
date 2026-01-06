# Plant vs Aliens — Grid Defense Game

This document defines the game design and implementation intent for a grid-based defense game inspired by Plants vs Zombies. It serves as the single source of truth for how the game should behave and what systems it must include.

---

## Game Overview

- Genre: Grid-based defense / strategy
- Playfield: 8×8 grid
- Aliens spawn from the right side and move left across rows
- Player places plants on grid tiles to stop aliens
- Aliens drop money on death
- Money is used to place additional plants
- The player wins by surviving all waves
- The player loses if any alien reaches the left edge

---

## Core Gameplay Loop

1. Game starts with a small amount of money.
2. Player selects one of four plant types.
3. Player places plants onto free grid tiles.
4. Aliens spawn in waves and advance across rows.
5. Plants attack, block, slow, or generate money.
6. Aliens attack plants when blocked.
7. Destroyed aliens drop money.
8. Difficulty increases over time through waves.
9. Game ends with a win or loss state.

---

## Grid Rules

- Grid size: 8 rows × 8 columns
- One plant per tile maximum
- Aliens move continuously within a single row
- When an alien reaches a tile containing a plant, it stops and attacks
- When the plant is destroyed, the alien continues moving
- Projectiles travel horizontally and hit the first alien in the row

---

## Starting Plants (4 Types)

### 1. Pea Shooter (Basic Damage)
- Cost: 50
- HP: 100
- Fires a projectile every 1.2 seconds
- Damage: 20
- Attacks the nearest alien in its row

### 2. Sunflower (Economy)
- Cost: 50
- HP: 80
- Generates a money drop (+25) every 8 seconds
- Money must be collected by the player

### 3. Wall Plant (Tank)
- Cost: 75
- HP: 400
- No attack
- Designed to block aliens and absorb damage

### 4. Ice Plant (Slow + Damage)
- Cost: 100
- HP: 90
- Fires every 1.8 seconds
- Damage: 15
- Applies a slow effect (≈35%) for 2.5 seconds

---

## Alien Types (3)

### 1. Basic Alien
- HP: 120
- Speed: Normal
- Damage: 10 per second
- Reward: 25 money

### 2. Fast Alien
- HP: 80
- Speed: Fast
- Damage: 8 per second
- Reward: 30 money

### 3. Tank Alien
- HP: 300
- Speed: Slow
- Damage: 14 per second
- Reward: 50 money

---

## Money System

- Starting money: 100
- Money sources:
  - Sunflower production
  - Alien death drops
- Money drops appear on the grid and must be collected
- Money is required to place plants
- Plant placement is blocked if insufficient money

---

## Waves & Difficulty

- Total waves: configurable (recommended: 10)
- Each wave defines:
  - Duration
  - Spawn rate
  - Alien type distribution
- Early waves favor basic aliens
- Later waves introduce fast and tank aliens
- Spawn rows are chosen randomly
- Aliens spawn from the right side

---

## Win / Lose Conditions

- Win: All waves completed and no aliens remain
- Lose: Any alien reaches the left edge of the grid

---

## UI Requirements

- Money display
- Current wave indicator
- Plant selection bar with cost and cooldown
- Tile highlight when placing plants
- Feedback for invalid placement
- Win screen with restart option
- Lose screen with restart option

---

## Visual Style (Initial)

- Placeholder graphics are acceptable
- Plants: simple shapes or icons
- Aliens: simple shapes with visual distinction
- Projectiles: small moving elements
- Money drops: clear, clickable indicators

---

## Technical Intent

- The game should be modular and system-driven
- Systems should handle grid logic, combat, economy, waves, UI, and state
- Files and structure may be freely created as needed
- This document defines behavior, not implementation constraints

---

# End of agents.md
