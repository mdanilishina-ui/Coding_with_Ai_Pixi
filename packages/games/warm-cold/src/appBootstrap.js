import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.1.5/dist/pixi.mjs";

export async function createApplication(containerId = "game") {
  const mount = document.getElementById(containerId);
  if (!mount) {
    throw new Error(`#${containerId} element not found`);
  }

  const app = new PIXI.Application();
  await app.init({
    resizeTo: window,
    resolution: window.devicePixelRatio || 1,
    background: "#1f5f3c",
    antialias: true,
    autoDensity: true,
  });

  mount.innerHTML = "";
  mount.appendChild(app.canvas);
  fitCanvasToViewport(app, mount);

  return app;
}

function fitCanvasToViewport(app, mount) {
  const resizeCanvas = () => {
    mount.style.width = "100%";
    mount.style.height = "100%";
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.canvas.style.width = "100%";
    app.canvas.style.height = "100%";
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("orientationchange", resizeCanvas);
}
