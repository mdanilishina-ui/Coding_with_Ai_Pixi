import { PLANT_TYPES } from "./constants.js";

export class PlantBar {
  constructor(element, { onSelect }) {
    this.element = element;
    this.onSelect = onSelect;
    this.selected = null;
    this.cards = new Map();
    this._render();
  }

  _render() {
    this.element.innerHTML = "";
    Object.values(PLANT_TYPES).forEach((plant) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "plant-card";
      button.dataset.type = plant.key;
      button.innerHTML = `
        <span class="plant-card__name">${plant.name}</span>
        <span class="plant-card__cost">${plant.cost} credits</span>
        <span class="plant-card__strip"></span>
      `;
      button.dataset.affordable = "false";
      button.dataset.disabled = "false";
      button.addEventListener("click", () => {
        if (button.dataset.disabled === "true") return;
        this.setSelected(plant.key);
        this.onSelect?.(plant.key);
      });
      this.cards.set(plant.key, button);
      this.element.appendChild(button);
    });
  }

  setSelected(type) {
    this.selected = type;
    this.cards.forEach((button, key) => {
      button.classList.toggle("plant-card--selected", key === type);
    });
  }

  updateAvailability(money) {
    this.cards.forEach((button, key) => {
      const cost = PLANT_TYPES[key].cost;
      const disabled = money < cost;
      button.dataset.disabled = disabled ? "true" : "false";
      button.dataset.affordable = disabled ? "false" : "true";
    });
  }
}
