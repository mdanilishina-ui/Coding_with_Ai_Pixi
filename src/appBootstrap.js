import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.1.5/dist/pixi.mjs";

export async function createApplication(containerId = "game") {
  const mount = document.getElementById(containerId);
  if (!mount) {
    throw new Error(`#${containerId} element not found`);
  }

  const app = new PIXI.Application();
  await app.init({
    resizeTo: mount,
    resolution: window.devicePixelRatio || 1,
    background: "#0c1224",
    antialias: true,
    autoDensity: true,
  });

  // Ensure the canvas fills the mount and matches its size.
  mount.innerHTML = "";
  mount.appendChild(app.canvas);
  fitCanvasToMount(app, mount);

  return app;
}

function fitCanvasToMount(app, mount) {
  const resizeCanvas = () => {
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;
    app.renderer.resize(width, height);
    app.canvas.style.width = "100%";
    app.canvas.style.height = "100%";
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("orientationchange", resizeCanvas);
}
