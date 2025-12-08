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
    background: "#0c1224",
    antialias: true,
  });

  mount.innerHTML = "";
  mount.appendChild(app.canvas);
  handleResponsiveCanvas(app, mount);

  return app;
}

function handleResponsiveCanvas(app, mount) {
  const resizeCanvas = () => {
    const maxWidth = mount.clientWidth;
    app.renderer.view.style.maxWidth = `${maxWidth}px`;
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("orientationchange", resizeCanvas);
}
