import { PlantVsAliensGame } from "./src/PlantVsAliensGame.js";

const isEmbedded = (() => {
  try {
    return window.self !== window.top;
  } catch (error) {
    return true;
  }
})();

if (typeof document !== "undefined" && isEmbedded) {
  document.body.classList.add("embedded");
}

const ui = {
  layoutRoot: document.getElementById("gameShell") || document.body,
  boardWrapper: document.getElementById("boardWrapper"),
  board: document.getElementById("board"),
  plantBar: document.getElementById("plantBar"),
  message: document.getElementById("message"),
  moneyDisplay: document.getElementById("moneyDisplay"),
  roundDisplay: document.getElementById("roundDisplay"),
  statusDisplay: document.getElementById("statusDisplay"),
  roundOverlay: document.getElementById("roundOverlay"),
  roundTitle: document.getElementById("roundTitle"),
  roundSubtitle: document.getElementById("roundSubtitle"),
  roundButton: document.getElementById("roundButton"),
  bossBanner: document.getElementById("bossBanner"),
  bossBannerText: document.getElementById("bossBannerText"),
  endOverlay: document.getElementById("endOverlay"),
  endTitle: document.getElementById("endTitle"),
  endSubtitle: document.getElementById("endSubtitle"),
  restartButton: document.getElementById("restartButton"),
};

const game = new PlantVsAliensGame(ui);
game.start();

if (typeof window !== "undefined") {
  window.plantVsAliensGame = game;
}
