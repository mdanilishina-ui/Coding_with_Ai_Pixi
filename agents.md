# agents.md
## Warm & Cold — Single-Level PixiJS Game (iPad Target)
This document defines the autonomous coding agents responsible for implementing the game using PixiJS 8.x. Each agent has one responsibility and clear inputs/outputs for AI-driven development.

---

# 1. AppBootstrapAgent
**Purpose:** Initialize a PixiJS 8.x Application and attach it to the DOM for iPad use.

**Responsibilities:**
- Create `Application({ resizeTo: window, resolution: devicePixelRatio })`.
- Append `app.canvas` to the element `#game`.
- Manage resize/orientation scaling.
- Export the Application instance.

**Outputs:** `Application` object.

---

# 2. AssetLoaderAgent
**Purpose:** Load the game’s assets using PixiJS `Assets`.

**Responsibilities:**
- Load:  
  - `background_main.png`  
  - `hidden_object.png`  
  - `ui_timer_bar.png`  
  - `ui_restart.png`
- Expose `Texture.from(alias)` access.

**Outputs:** Preloaded textures.

---

# 3. SceneManagerAgent
**Purpose:** Control creation, replacement, and restarting of the game’s single scene.

**Responsibilities:**
- Instantiate `MainScene`.
- Add/remove it from `app.stage`.
- Implement `restartGame()`.

**Outputs:** Active scene container.

---

# 4. MainSceneAgent
**Purpose:** Central controller of gameplay inside the single level.

**Responsibilities:**
- Add background sprite.
- Place hidden object sprite.
- Apply warm/cold color filter.
- Initialize timer and UI.
- Register pointer input callbacks.
- Update scene each frame via `app.ticker`.
- Handle success/fail state transitions.

**Outputs:** Visual scene container and game state.

---

# 5. ObjectPlacementAgent
**Purpose:** Determine random placement of the hidden object inside the environment.

**Responsibilities:**
- Calculate valid coordinate range inside background.
- Return random `{ x, y }` ensuring object stays fully visible.

**Outputs:** `{ x, y }` position.

---

# 6. InteractionAgent
**Purpose:** Manage pointer/touch input for iPad via PixiJS event system.

**Responsibilities:**
- Enable `eventMode = "static"` and assign hit area.
- Track pointer position in scene coordinates.
- Detect taps on hidden object bounds.
- Provide callback interface to MainScene.

**Outputs:** Pointer events `{ x, y }` and hit detection.

---

# 7. WarmColdAgent
**Purpose:** Compute warm/cold proximity effect and update the scene’s color filter.

**Responsibilities:**
- Compute warmFactor `0 → 1` based on distance between pointer and hidden object.
- Apply warm/cold shift through `ColorMatrixFilter` or tint interpolation.
- Maintain smooth transitions and iPad-friendly performance.

**Outputs:** Updated filter matrix.

---

# 8. TimerAgent
**Purpose:** Provide countdown logic for the single timed round.

**Responsibilities:**
- Track remaining milliseconds.
- Expose `start`, `update`, `stop`, `onTimeout`.
- Signal fail state when time reaches zero.

**Outputs:** Timer state + remaining time.

---

# 9. GameStateAgent
**Purpose:** Maintain the finite state machine of the round.

**States:**
- `idle`
- `running`
- `success`
- `fail`

**Responsibilities:**
- Enforce legal transitions.
- Expose read/write access to current state.

**Outputs:** Game state status.

---

# 10. UIAgent
**Purpose:** Render HUD elements and end-state messages.

**Responsibilities:**
- Draw timer bar and update its width.
- Show status messages (“Find the object!”, “Success!”, “Time’s up!”).
- Render restart button and emit restart action.
- Maintain pixel-art-friendly placement for iPad.

**Outputs:** UI container.

---

# 11. AudioAgent (Optional)
**Purpose:** Supply minimal sound feedback.

**Responsibilities:**
- Load and play success/fail/timer-low sounds.
- Follow iPad Safari interaction rules for playback.
- Provide easy trigger methods.

**Outputs:** Audio cues.

---

# 12. PerformanceAgent
**Purpose:** Ensure smooth rendering on iPad.

**Responsibilities:**
- Monitor FPS via `app.ticker.FPS`.
- Disable or reduce filter complexity if FPS < target.
- Provide performance flags to MainScene.

**Outputs:** Performance state.

---

# 13. EntryPointAgent
**Purpose:** Execute the startup sequence of the entire game.

**Responsibilities:**
- Create PixiJS Application via AppBootstrapAgent.
- Load assets via AssetLoaderAgent.
- Initialize SceneManagerAgent and fully start the game.

**Outputs:** Running game.

---

# End of agents.md
