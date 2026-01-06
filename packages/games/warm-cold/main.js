import { createApplication } from "./src/appBootstrap.js";
import { loadAssets } from "./src/assetLoader.js";
import { SceneManagerAgent } from "./src/sceneManager.js";

let sceneManager = null;
let assetsLoaded = false;
let isStarting = false;

(async function entryPoint() {
  const app = await createApplication();
  setupStartFlow(app);
})();

function setupStartFlow(app) {
  const startButton = document.getElementById("startButton");
  const overlay = document.getElementById("startOverlay");

  const begin = async () => {
    if (isStarting || sceneManager) return;
    isStarting = true;
    const originalLabel = startButton?.textContent;
    if (startButton) {
      startButton.disabled = true;
      startButton.textContent = assetsLoaded ? "Starting..." : "Loading...";
    }

    try {
      await ensureAssetsLoaded();
      startGame(app);
      overlay?.classList.add("start-overlay--hidden");
    } catch (error) {
      console.error("Unable to start the game", error);
      isStarting = false;
      if (startButton) {
        startButton.disabled = false;
        startButton.textContent = "Try Again";
      }
      return;
    } finally {
      isStarting = false;
    }

    if (startButton && originalLabel) {
      startButton.textContent = originalLabel;
    }
  };

  if (startButton) {
    startButton.addEventListener("click", begin);
  } else {
    // If the button isn't found, fall back to auto-start.
    begin();
  }
}

async function ensureAssetsLoaded() {
  if (assetsLoaded) return;
  await loadAssets();
  assetsLoaded = true;
}

function startGame(app) {
  sceneManager = new SceneManagerAgent(app);
  sceneManager.start();

  if (typeof window !== "undefined") {
    window.sceneManager = sceneManager;
  }
}
