export class ObjectPlacementAgent {
  constructor(backgroundSize, objectSize, padding = 24) {
    this.backgroundSize = backgroundSize;
    this.objectSize = objectSize;
    this.padding = padding;
  }

  randomPosition() {
    const minX = this.padding + this.objectSize.width / 2;
    const maxX = this.backgroundSize.width - this.padding - this.objectSize.width / 2;
    const minY = this.padding + this.objectSize.height / 2;
    const maxY = this.backgroundSize.height - this.padding - this.objectSize.height / 2;

    return {
      x: randomBetween(minX, maxX),
      y: randomBetween(minY, maxY),
    };
  }
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
