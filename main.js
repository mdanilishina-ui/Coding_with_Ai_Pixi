import { createApplication } from "./src/appBootstrap.js";
import { loadAssets } from "./src/assetLoader.js";
import { SceneManagerAgent } from "./src/sceneManager.js";

(async function entryPoint() {
  const app = await createApplication();
  await loadAssets();

  const sceneManager = new SceneManagerAgent(app);
  sceneManager.start();
})();
