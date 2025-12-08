import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.1.5/dist/pixi.mjs";

const assets = {
  background: {
    alias: "background_main",
    src: createSolidDataUrl("#162033", 1200, 800, "Background"),
  },
  hiddenObject: {
    alias: "hidden_object",
    src: createSolidDataUrl("#ffd166", 120, 120, "Hidden"),
  },
  timerBar: {
    alias: "ui_timer_bar",
    src: createSolidDataUrl("#7df0c4", 400, 32, "Timer"),
  },
  restart: {
    alias: "ui_restart",
    src: createSolidDataUrl("#8be9fd", 140, 140, "Restart"),
  },
};

export async function loadAssets() {
  PIXI.Assets.init();
  Object.values(assets).forEach((asset) => {
    PIXI.Assets.add({ alias: asset.alias, src: asset.src });
  });

  const textures = await PIXI.Assets.load(Object.keys(assets).map((key) => assets[key].alias));
  return textures;
}

export function getTexture(alias) {
  return PIXI.Texture.from(alias);
}

function createSolidDataUrl(color, width, height, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><style>.label{font-family:Arial,sans-serif;font-size:32px;font-weight:bold;fill:#0c1224;opacity:0.55}</style></defs><rect width="100%" height="100%" rx="12" ry="12" fill="${color}"/><text x="50%" y="52%" text-anchor="middle" class="label">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
