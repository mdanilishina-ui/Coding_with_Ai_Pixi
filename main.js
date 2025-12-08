import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.1.5/dist/pixi.min.mjs";

const wrapper = document.getElementById("canvas-wrapper");

const app = new PIXI.Application();
await app.init({
  background: "#0c1224",
  resizeTo: wrapper,
  antialias: true,
});

wrapper.appendChild(app.canvas);

const starField = new PIXI.Graphics();
starField.beginFill(0x0b1023, 0.95);
starField.drawRect(0, 0, app.screen.width, app.screen.height);
starField.endFill();
app.stage.addChild(starField);

const stars = [];
for (let i = 0; i < 60; i++) {
  const star = new PIXI.Graphics();
  const radius = Math.random() * 2 + 1;
  star.beginFill(0xffffff, Math.random() * 0.7 + 0.3);
  star.drawCircle(0, 0, radius);
  star.endFill();
  star.x = Math.random() * app.screen.width;
  star.y = Math.random() * app.screen.height;
  star.alpha = Math.random();
  app.stage.addChild(star);
  stars.push({ view: star, speed: 0.4 + Math.random() * 1.2 });
}

const orbs = new PIXI.Container();
app.stage.addChild(orbs);

function createOrb(color, x, y, direction) {
  const orb = new PIXI.Graphics();
  orb.beginFill(color, 0.9);
  orb.lineStyle({ color: 0xffffff, width: 2, alpha: 0.1 });
  orb.drawCircle(0, 0, 30);
  orb.endFill();
  orb.x = x;
  orb.y = y;
  orb.direction = direction;
  orb.speed = 1 + Math.random() * 1.4;
  orb.rotationSpeed = (Math.random() - 0.5) * 0.02;
  orb.pivot.set(0.5);
  orbs.addChild(orb);
  return orb;
}

const palette = [0x7df0c4, 0x8be9fd, 0xd6b3ff, 0xffd166];
const orbSprites = palette.map((color, index) =>
  createOrb(color, 100 + index * 80, 120 + index * 30, index % 2 === 0 ? 1 : -1)
);

const labelStyle = new PIXI.TextStyle({
  fill: 0xffffff,
  fontSize: 18,
  fontWeight: "700",
  dropShadow: true,
  dropShadowAlpha: 0.35,
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 3,
  dropShadowDistance: 4,
});

const label = new PIXI.Text({
  text: "Drag to stir the orbs",
  style: labelStyle,
});
label.anchor.set(0.5);
label.position.set(app.screen.width / 2, app.screen.height - 40);
app.stage.addChild(label);

const cursor = new PIXI.Graphics();
cursor.beginFill(0xffffff);
cursor.drawCircle(0, 0, 6);
cursor.endFill();
cursor.alpha = 0;
app.stage.addChild(cursor);

let pointerPos = { x: app.screen.width / 2, y: app.screen.height / 2 };
let pointerActive = false;

app.stage.eventMode = "static";
app.stage.hitArea = app.screen;
app.stage.cursor = "grab";

app.stage
  .on("pointerdown", (event) => {
    pointerActive = true;
    pointerPos = event.global.clone();
    cursor.alpha = 1;
    app.stage.cursor = "grabbing";
  })
  .on("pointerup", () => {
    pointerActive = false;
    cursor.alpha = 0;
    app.stage.cursor = "grab";
  })
  .on("pointerupoutside", () => {
    pointerActive = false;
    cursor.alpha = 0;
    app.stage.cursor = "grab";
  })
  .on("pointermove", (event) => {
    pointerPos = event.global.clone();
    cursor.position.copyFrom(pointerPos);
  });

app.ticker.add((delta) => {
  stars.forEach((star) => {
    star.view.y += star.speed * delta;
    star.view.alpha = 0.4 + Math.abs(Math.sin(app.ticker.lastTime * 0.0015 + star.view.x)) * 0.5;
    if (star.view.y > app.screen.height) {
      star.view.y = -2;
      star.view.x = Math.random() * app.screen.width;
    }
  });

  orbSprites.forEach((orb, index) => {
    orb.x += orb.direction * orb.speed * delta + (pointerActive ? (pointerPos.x - orb.x) * 0.002 : 0);
    orb.y += Math.cos(app.ticker.lastTime * 0.0015 + index) * 0.8 * delta + (pointerActive ? (pointerPos.y - orb.y) * 0.002 : 0);
    orb.rotation += orb.rotationSpeed * delta;

    orb.x = (orb.x + app.screen.width) % app.screen.width;
    orb.y = (orb.y + app.screen.height) % app.screen.height;
  });

  label.position.set(app.screen.width / 2, app.screen.height - 40);
});

app.renderer.on("resize", () => {
  starField.clear();
  starField.beginFill(0x0b1023, 0.95);
  starField.drawRect(0, 0, app.screen.width, app.screen.height);
  starField.endFill();
  label.position.set(app.screen.width / 2, app.screen.height - 40);
});
