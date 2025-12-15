import { createApplication } from "./src/appBootstrap.js";
import { loadAssets } from "./src/assetLoader.js";
import { SceneManagerAgent } from "./src/sceneManager.js";

(async function entryPoint() {
  const app = await createApplication();
  await loadAssets();

  const sceneManager = new SceneManagerAgent(app);
  sceneManager.start();

  // Expose for quick manual testing from the console.
  // window.sceneManager.restartGame() will rebuild the scene.
  if (typeof window !== "undefined") {
    window.sceneManager = sceneManager;
  }
})();
