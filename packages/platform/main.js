const appRoot = document.getElementById("app");

const games = [
  {
    id: "warm-cold",
    name: "Warm & Cold — Save the Rabbit",
    description: "Heat up the scene, collect carrots, and rescue the rabbit before time runs out.",
    entry: "../games/warm-cold/index.html",
  },
];

const menuTiles = [
  {
    id: "warm-cold",
    title: "Warm & Cold — Save the Rabbit",
    subtitle: "Play now",
    illustration: "rabbit",
    playable: true,
    route: "#/play/warm-cold",
  },
  {
    id: "coming-soon-1",
    title: "Mystery Signal",
    subtitle: "Coming soon",
    illustration: "question",
    playable: false,
  },
  {
    id: "coming-soon-2",
    title: "Arcade Lab",
    subtitle: "Coming soon",
    illustration: "lock",
    playable: false,
  },
];

const ROUTES = {
  menu: "#/menu",
  playPrefix: "#/play/",
};

function navigateTo(hash) {
  if (window.location.hash === hash) {
    renderRoute();
    return;
  }
  window.location.hash = hash;
}

function renderRoute() {
  if (!appRoot) return;

  if (!window.location.hash) {
    window.location.hash = ROUTES.menu;
    return;
  }

  const hash = window.location.hash;
  appRoot.innerHTML = "";

  if (hash.startsWith(ROUTES.playPrefix)) {
    const gameId = hash.slice(ROUTES.playPrefix.length);
    renderPlay(appRoot, gameId);
    return;
  }

  renderMenu(appRoot);
}

function renderMenu(container) {
  const screen = document.createElement("div");
  screen.className = "screen screen--menu";

  const hero = document.createElement("header");
  hero.className = "hero";
  hero.innerHTML = `
    <p class="hero__eyebrow">Coding with AI</p>
    <h1>Playground Platform</h1>
    <p class="hero__lede">
      Launch prototype games from a single shell. Each game lives inside its own package and keeps its own code,
      assets, and docs.
    </p>
  `;

  const menuPanel = document.createElement("section");
  menuPanel.className = "menu-panel";
  menuPanel.innerHTML = `
    <div class="menu-panel__meta">
      <p class="menu-panel__eyebrow">Main menu</p>
      <h2 class="menu-panel__title">Choose a prototype</h2>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "menu-grid";

  menuTiles.forEach((tile) => {
    const card = document.createElement(tile.playable ? "button" : "article");
    card.className = `game-card${tile.playable ? " game-card--playable" : " game-card--disabled"}`;
    card.innerHTML = `
      <div class="game-card__illustration">${getIllustrationMarkup(tile.illustration)}</div>
      <div class="game-card__body">
        <h3>${tile.title}</h3>
        <p>${tile.subtitle}</p>
      </div>
    `;

    if (tile.playable && tile.route) {
      card.type = "button";
      card.addEventListener("click", () => navigateTo(tile.route));
    } else {
      card.setAttribute("aria-disabled", "true");
    }

    grid.append(card);
  });

  menuPanel.append(grid);
  screen.append(hero, menuPanel);
  container.append(screen);
}

function renderPlay(container, requestedId) {
  const game = games.find((entry) => entry.id === requestedId) ?? games[0];
  if (!game) {
    renderMenu(container);
    return;
  }

  if (game.id !== requestedId) {
    window.location.hash = `${ROUTES.playPrefix}${game.id}`;
  }

  const screen = document.createElement("div");
  screen.className = "screen screen--play";

  const header = document.createElement("section");
  header.className = "hero hero--play";

  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "back-button";
  backButton.textContent = "← Back to menu";
  backButton.addEventListener("click", () => navigateTo(ROUTES.menu));

  header.innerHTML = `
    <p class="hero__eyebrow">Now playing</p>
    <p class="hero__lede">Load the selected package inside an immersive stage.</p>
  `;
  header.prepend(backButton);

  const layout = document.createElement("section");
  layout.className = "play-layout";

  const info = document.createElement("div");
  info.className = "play-info";
  info.innerHTML = `
    <h2>${game.name}</h2>
    <p>${game.description}</p>
  `;

  const stage = document.createElement("div");
  stage.className = "play-stage";
  const frame = document.createElement("div");
  frame.className = "play-stage__frame";

  const iframe = document.createElement("iframe");
  iframe.title = game.name;
  iframe.src = game.entry;
  iframe.loading = "lazy";
  iframe.allow = "fullscreen";

  frame.append(iframe);
  stage.append(frame);
  layout.append(info, stage);

  screen.append(header, layout);
  container.append(screen);
}

function getIllustrationMarkup(type) {
  switch (type) {
    case "rabbit":
      return `
        <svg viewBox="0 0 160 160" role="img" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="rabbit-ear" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffb2d6"></stop>
              <stop offset="100%" stop-color="#ff80b5"></stop>
            </linearGradient>
          </defs>
          <rect x="20" y="70" width="120" height="70" rx="35" fill="#fefefe"></rect>
          <ellipse cx="55" cy="60" rx="18" ry="36" fill="#fefefe"></ellipse>
          <ellipse cx="105" cy="60" rx="18" ry="36" fill="#fefefe"></ellipse>
          <ellipse cx="55" cy="60" rx="9" ry="28" fill="url(#rabbit-ear)"></ellipse>
          <ellipse cx="105" cy="60" rx="9" ry="28" fill="url(#rabbit-ear)"></ellipse>
          <circle cx="70" cy="95" r="6" fill="#1c2340"></circle>
          <circle cx="90" cy="95" r="6" fill="#1c2340"></circle>
          <path d="M76 112 Q80 120 84 112" fill="none" stroke="#ff80b5" stroke-width="4" stroke-linecap="round"></path>
          <path d="M60 128 Q80 138 100 128" fill="none" stroke="#1c2340" stroke-width="5" stroke-linecap="round"></path>
        </svg>
      `;
    case "question":
      return `
        <svg viewBox="0 0 160 160" role="img" aria-hidden="true" focusable="false">
          <circle cx="80" cy="80" r="60" fill="rgba(255,255,255,0.08)" stroke="#566084" stroke-width="4"></circle>
          <path d="M60 70 C60 52 74 44 86 44 C100 44 110 52 110 66 C110 80 98 88 92 92 C86 96 84 100 84 106" fill="none" stroke="#c9d2ff" stroke-width="8" stroke-linecap="round"></path>
          <circle cx="84" cy="124" r="6" fill="#c9d2ff"></circle>
        </svg>
      `;
    case "lock":
      return `
        <svg viewBox="0 0 160 160" role="img" aria-hidden="true" focusable="false">
          <rect x="30" y="70" width="100" height="80" rx="18" fill="rgba(255,255,255,0.08)" stroke="#566084" stroke-width="4"></rect>
          <path d="M55 70 V50 C55 34 67 22 83 22 C99 22 111 34 111 50 V70" fill="none" stroke="#c9d2ff" stroke-width="8" stroke-linecap="round"></path>
          <circle cx="80" cy="105" r="12" fill="#7df0c4"></circle>
          <rect x="76" y="105" width="8" height="18" rx="4" fill="#0c132b"></rect>
        </svg>
      `;
    default:
      return "";
  }
}

renderRoute();
window.addEventListener("hashchange", renderRoute);
