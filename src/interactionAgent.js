import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.1.5/dist/pixi.mjs";

export class InteractionAgent {
  constructor(container, app) {
    this.container = container;
    this.container.eventMode = "static";
    this.container.cursor = "pointer";
    this.pointerPosition = { x: 0, y: 0 };
    this.pointerActive = false;
    this.onPointerMove = () => {};
    this.onPointerTap = () => {};

    this.resize(app.screen);

    this.container.on("pointermove", (event) => {
      this.pointerPosition = event.global.clone();
      this.pointerActive = true;
      this.onPointerMove(this.pointerPosition);
    });

    this.container.on("pointertap", (event) => {
      this.pointerPosition = event.global.clone();
      this.onPointerTap(this.pointerPosition);
    });
  }

  resize(screen) {
    this.container.hitArea = new PIXI.Rectangle(0, 0, screen.width, screen.height);
  }

  destroy() {
    this.container.removeAllListeners();
    this.container.hitArea = null;
  }
}
