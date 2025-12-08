export class InteractionAgent {
  constructor(container) {
    this.container = container;
    this.container.eventMode = "static";
    this.container.cursor = "pointer";
    this.pointerPosition = { x: 0, y: 0 };
    this.pointerActive = false;
    this.onPointerMove = () => {};
    this.onPointerTap = () => {};

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
}
