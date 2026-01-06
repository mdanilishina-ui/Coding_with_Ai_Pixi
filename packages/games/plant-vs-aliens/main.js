import { PlantVsAliensGame } from "./src/PlantVsAliensGame.js";

const ui = {
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
