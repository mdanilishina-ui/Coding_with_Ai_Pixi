import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.1.5/dist/pixi.mjs";

const assets = {
  background: {
    alias: "background_main",
    src: createFlowerFieldDataUrl(),
  },
  hiddenObject: {
    alias: "hidden_object",
    src: createRabbitDataUrl(),
  },
  hiddenObjectWin: {
    alias: "hidden_object_win",
    src: createRabbitWinDataUrl(),
  },
  hiddenObjectDead: {
    alias: "hidden_object_dead",
    src: createRabbitDeadDataUrl(),
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
  PIXI.Assets.reset();
  PIXI.Assets.init();
  Object.values(assets).forEach((asset) => {
    PIXI.Assets.add({ alias: asset.alias, src: asset.src });
  });

  // Preload all assets so Texture.from/Assets.get resolve immediately.
  return PIXI.Assets.load(Object.values(assets).map((asset) => asset.alias));
}

export function getTexture(alias) {
  return PIXI.Assets.get(alias) ?? PIXI.Texture.from(alias);
}

function createSolidDataUrl(color, width, height, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><style>.label{font-family:Arial,sans-serif;font-size:32px;font-weight:bold;fill:#0c1224;opacity:0.55}</style></defs><rect width="100%" height="100%" rx="12" ry="12" fill="${color}"/><text x="50%" y="52%" text-anchor="middle" class="label">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createFlowerFieldDataUrl() {
  const width = 640;
  const height = 400;
  const flowers = [];
  const count = 10;
  const centerX = width / 2;
  const centerY = height / 2;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const radius = 80 + (i * 13) % 50; // keep them closer together
    const jitterX = ((i * 17) % 9) - 4;
    const jitterY = ((i * 29) % 9) - 4;
    const x = Math.max(12, Math.min(width - 12, centerX + Math.cos(angle) * radius + jitterX));
    const y = Math.max(12, Math.min(height - 12, centerY + Math.sin(angle) * radius + jitterY));
    flowers.push(`
      <g transform="translate(${x} ${y})">
        <rect x="-3" y="-3" width="6" height="6" fill="#f8fafc" />
        <rect x="-2" y="-2" width="4" height="4" fill="#f8fafc" />
        <rect x="-1" y="-1" width="2" height="2" fill="#ffd166" />
      </g>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">
    <rect width="100%" height="100%" fill="#1f5f3c"/>
    ${flowers.join("")}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createRabbitDataUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 16 16" shape-rendering="crispEdges">
    <rect width="16" height="16" fill="none"/>
    <rect x="4" y="1" width="2" height="5" fill="#1f1d2e"/>
    <rect x="5" y="2" width="1" height="3" fill="#f2cdcd"/>
    <rect x="10" y="1" width="2" height="5" fill="#1f1d2e"/>
    <rect x="10" y="2" width="1" height="3" fill="#f2cdcd"/>

    <rect x="3" y="5" width="10" height="7" fill="#1f1d2e"/>
    <rect x="4" y="6" width="8" height="5" fill="#f5e0dc"/>

    <rect x="6" y="8" width="1" height="1" fill="#1f1d2e"/>
    <rect x="9" y="8" width="1" height="1" fill="#1f1d2e"/>
    <rect x="7" y="9" width="2" height="1" fill="#e0af68"/>
    <rect x="7" y="10" width="1" height="1" fill="#1f1d2e"/>
    <rect x="8" y="10" width="1" height="1" fill="#1f1d2e"/>

    <rect x="5" y="9" width="1" height="1" fill="#f2cdcd"/>
    <rect x="10" y="9" width="1" height="1" fill="#f2cdcd"/>
    <rect x="6" y="7" width="4" height="1" fill="#fff1f2"/>

    <rect x="5" y="11" width="6" height="1" fill="#f2cdcd"/>
    <rect x="4" y="12" width="8" height="1" fill="#1f1d2e"/>
    <rect x="5" y="12" width="6" height="1" fill="#cba6f7"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createRabbitWinDataUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 16 16" shape-rendering="crispEdges">
    <rect width="16" height="16" fill="none"/>
    <rect x="4" y="1" width="2" height="5" fill="#1f1d2e"/>
    <rect x="5" y="2" width="1" height="3" fill="#f2cdcd"/>
    <rect x="10" y="1" width="2" height="5" fill="#1f1d2e"/>
    <rect x="10" y="2" width="1" height="3" fill="#f2cdcd"/>

    <rect x="3" y="5" width="10" height="7" fill="#1f1d2e"/>
    <rect x="4" y="6" width="8" height="5" fill="#f5e0dc"/>

    <rect x="6" y="8" width="1" height="1" fill="#1f1d2e"/>
    <rect x="9" y="8" width="1" height="1" fill="#1f1d2e"/>
    <rect x="6" y="9" width="1" height="1" fill="#f8fafc"/>
    <rect x="9" y="9" width="1" height="1" fill="#f8fafc"/>
    <rect x="7" y="10" width="2" height="1" fill="#e0af68"/>
    <rect x="6" y="11" width="4" height="1" fill="#e0af68"/>
    <rect x="7" y="12" width="2" height="1" fill="#1f1d2e"/>

    <rect x="5" y="9" width="1" height="1" fill="#f2cdcd"/>
    <rect x="10" y="9" width="1" height="1" fill="#f2cdcd"/>
    <rect x="6" y="7" width="4" height="1" fill="#fff1f2"/>

    <rect x="5" y="11" width="6" height="1" fill="#f2cdcd"/>
    <rect x="4" y="12" width="8" height="1" fill="#1f1d2e"/>
    <rect x="5" y="12" width="6" height="1" fill="#cba6f7"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createRabbitDeadDataUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 16 16" shape-rendering="crispEdges">
    <rect width="16" height="16" fill="none"/>
    <rect x="4" y="1" width="2" height="5" fill="#1f1d2e"/>
    <rect x="10" y="1" width="2" height="5" fill="#1f1d2e"/>

    <rect x="3" y="5" width="10" height="7" fill="#1f1d2e"/>
    <rect x="4" y="6" width="8" height="5" fill="#f5e0dc"/>

    <rect x="6" y="8" width="1" height="1" fill="#1f1d2e"/>
    <rect x="7" y="9" width="1" height="1" fill="#1f1d2e"/>
    <rect x="9" y="8" width="1" height="1" fill="#1f1d2e"/>
    <rect x="8" y="9" width="1" height="1" fill="#1f1d2e"/>
    <rect x="6" y="10" width="4" height="1" fill="#e0af68"/>

    <rect x="5" y="9" width="1" height="1" fill="#f2cdcd"/>
    <rect x="10" y="9" width="1" height="1" fill="#f2cdcd"/>
    <rect x="6" y="7" width="4" height="1" fill="#fff1f2"/>

    <rect x="5" y="11" width="6" height="1" fill="#f2cdcd"/>
    <rect x="4" y="12" width="8" height="1" fill="#1f1d2e"/>
    <rect x="5" y="12" width="6" height="1" fill="#f2cdcd"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
