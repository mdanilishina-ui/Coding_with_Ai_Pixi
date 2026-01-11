const COLORS = {
  ".": "transparent",
  "0": "#14321d",
  "1": "#1f6131",
  "2": "#2f8f4e",
  "3": "#4ddb7e",
  "4": "#7bffb3",
  "5": "#3d6b29",
  "6": "#f6de7d",
  "7": "#f9c847",
  "8": "#ffed9c",
  "9": "#f2a852",
  A: "#c57a1f",
  B: "#925212",
  C: "#6bd4ff",
  D: "#3e9edb",
  E: "#9ff0ff",
  F: "#235a8a",
  G: "#4f6aff",
  H: "#243079",
  I: "#ffd2e2",
  J: "#ff91b8",
  K: "#e84a92",
  L: "#781532",
  M: "#8ff3ff",
  N: "#4cd3ff",
  O: "#2785c2",
  P: "#d7abff",
  Q: "#a273f8",
  R: "#6730b3",
  S: "#fda89c",
  T: "#ff6b6b",
  U: "#e63946",
  V: "#230b16",
  W: "#ffd57e",
  X: "#544d7a",
  Y: "#fefefe",
};

const PLANT_SPRITES = {
  pea: {
    frames: [
      [
        "....33333333....",
        "...3444444443...",
        "..344444444443..",
        ".3444446644443.",
        ".3444446644443.",
        ".3444444444443.",
        "..344444444443..",
        "...3444444443...",
        "....33333333....",
        ".....355553.....",
        ".....355553.....",
        "....35555553....",
        "...3555555553...",
        "..055555555550..",
        "..055555555550..",
        "...005555500....",
      ],
      [
        "....33333333....",
        "...3444448443...",
        "..344444444443..",
        ".3444448844443.",
        ".3444446644443.",
        ".3444444444443.",
        "..344444444443..",
        "...3444444443...",
        "....33333333....",
        ".....355553.....",
        "....35555553....",
        "...3555555553...",
        "..355555555553..",
        "..055555555550..",
        "...0555555550...",
        "....0055550.....",
      ],
    ],
    frameDuration: 300,
  },
  sun: {
    frames: [
      [
        "...7777777777...",
        "..776666666677..",
        ".7766888888867.",
        ".7688888888867.",
        ".7688888888867.",
        ".7688888888867.",
        ".7766888888867.",
        "..776666666677..",
        "...7777777777...",
        "...5555555555...",
        "..555555555555..",
        "..555555555555..",
        "..555555555555..",
        "..055555555550..",
        "...0555555550...",
        "....00555500....",
      ],
      [
        "...7777777777...",
        "..776666666677..",
        ".7766888888867.",
        ".7688888688867.",
        ".7688888888867.",
        ".7688888888867.",
        ".7766888888867.",
        "..776666666677..",
        "...7777777777...",
        "...5555555555...",
        "..555655555655..",
        "..555555555555..",
        "..555555555555..",
        "..055555555550..",
        "...0555555550...",
        "....00555500....",
      ],
    ],
    frameDuration: 360,
  },
  wall: {
    frames: [
      [
        "PPPPPPPPPPPPPPPP",
        "PQQQQQQQQQQQQQRP",
        "PQQSSSQQQSSSQQRP",
        "PQQSSSQQQSSSQQRP",
        "PQQQQQQQQQQQQQRP",
        "PQQRRRQQQRRRQQRP",
        "PQQRRRQQQRRRQQRP",
        "PQQQQQQQQQQQQQRP",
        "PRQQQQQQQQQQQQRP",
        "PRQQSSSQQQSSQQRP",
        "PRQQSSSQQQSSQQRP",
        "PRQQQQQQQQQQQQRP",
        "PRQQRRRQQQRRRQQP",
        "PRQQRRRQQQRRRQQP",
        "PPRRRRRRRRRRRRPP",
        "PPPPPPPPPPPPPPPP",
      ],
      [
        "PPPPPPPPPPPPPPPP",
        "PQQQQQQQQQQQQQRP",
        "PQQSSSQQQSSSQQRP",
        "PQQSSSQQQSSSQQRP",
        "PQQRRRQQQRRRQQRP",
        "PQQRRRQQQRRRQQRP",
        "PQQQQQQQQQQQQQRP",
        "PQQQQQQQQQQQQQRP",
        "PRQQQQQQQQQQQQRP",
        "PRQQQQQQQQQQQQRP",
        "PRQQSSSQQQSSQQRP",
        "PRQQSSSQQQSSQQRP",
        "PRQQRRRQQQRRRQQP",
        "PPRRRRRRRRRRRRPP",
        "PPPPPPPPPPPPPPPP",
        "PPPPPPPPPPPPPPPP",
      ],
    ],
    frameDuration: 420,
  },
  ice: {
    frames: [
      [
        "...CCCCCCCCCCCC...",
        "..CCCMNNNMMMCCC..",
        ".CCMMMMNNNMMMMCC.",
        ".CCMMMMNNNMMMMCC.",
        ".CCMMMMMMMMMMCC..",
        ".CCMMMMMMMMMMCC..",
        ".CCMMMMNNNMMMMCC.",
        "..CCMMMMMMMMCC...",
        "...CCCCCCCCCC....",
        "....FNNNNNNF.....",
        "...OFFNNNFFNO....",
        "...OFFNNNFFNO....",
        "..0FFNNNNNFF0....",
        "..0FFNNNNNFF0....",
        "...0FFNNNFF0.....",
        "....00FFFF00.....",
      ],
      [
        "...CCCCCCCCCCCC...",
        "..CCCMNNNMMMCCC..",
        ".CCMMMMNNNMMMMCC.",
        ".CCMMMMNNNMMMMCC.",
        ".CCMMMMMMMMMMCC..",
        ".CCMMMMMMMMMMCC..",
        ".CCMMMMNNNMMMMCC.",
        "..CCMMMMMMMMCC...",
        "...CCCCCCCCCC....",
        "....FNNNNNNF.....",
        "...OFFNNNFFNO....",
        "...0FFNNNFF0.....",
        "..00FNNNNNF00....",
        "...00FNNNF00.....",
        ".....0FFFF0......",
        "......0000.......",
      ],
    ],
    frameDuration: 320,
  },
};

const ALIEN_SPRITES = {
  fast: {
    frames: [
      [
        "....SSSSSSSS....",
        "...STTTTTTTTS...",
        "..STTTTTTTTTTS..",
        "..STTTTTTTTTTS..",
        "..STTTTTTTTTTS..",
        "...STTTTTTTTS...",
        "....0TTTTTT0....",
        "...00TTTTT00...",
        "...00TTTTT00...",
        "....0TTTTT0....",
        "....0T0.0T0....",
        "...0T0...0T0...",
        "..0T0.....0T0..",
        "..0T0.....0T0..",
        "...............",
        "..0T0.....0T0..",
      ],
      [
        "....SSSSSSSS....",
        "...STTTTTTTTS...",
        "..STTTTTTTTTTS..",
        "..STTTTTTTTTTS..",
        "..STTTTTTTTTTS..",
        "...STTTTTTTTS...",
        "....0TTTTTT0....",
        "...00TTTTT00...",
        "...00TTTTT00...",
        "..000TTTTT000..",
        "...0T0...0T0...",
        "..0T0.....0T0..",
        "..0T0.....0T0..",
        ".0T0.......0T0.",
        "0T0.........0T0",
        ".0T0.......0T0.",
      ],
    ],
    frameDuration: 260,
  },
  basic: {
    frames: [
      [
        "...JJJJJJJJJJ...",
        "..JIIIIIIIIIIJ..",
        ".JIIIIIIIIIIIJ.",
        ".JIIIIKKKIIIIJ.",
        ".JIIIIKKKIIIIJ.",
        ".JIIIIIIIIIIIJ.",
        ".JIIIIIIIIIIIJ.",
        ".JIIIIIIIIIIIJ.",
        "..JIIIIIIIIIJ..",
        "...LLLLLLLLL...",
        "..LLL....LLL...",
        ".LLL......LLL..",
        ".LL........LL..",
        "LL..........LL.",
        "LL..........LL.",
        ".LL........LL..",
      ],
      [
        "...JJJJJJJJJJ...",
        "..JIIIIIIIIIIJ..",
        ".JIIIIIIIIIIIJ.",
        ".JIIIIKKKIIIIJ.",
        ".JIIIIKKKIIIIJ.",
        ".JIIIIIIIIIIIJ.",
        ".JIIIIIIIIIIIJ.",
        "..JIIIIIIIIIJ..",
        "...JIIIIIIIJ...",
        "...LLLLLLLLL...",
        "..LLL....LLL...",
        ".LLL......LLL..",
        "LLL......LLLL..",
        "LLL......LLLL..",
        ".LLL....LLL.L..",
        "..LL....LL..L..",
      ],
    ],
    frameDuration: 320,
  },
  tank: {
    frames: [
      [
        "...TUUUUUUUUUUT...",
        "..TUTTTTTTTTTUT..",
        ".TUTUUUUUUUUUTUT.",
        ".TUTVVVVVVVVVUTT.",
        ".TUTVVVVVVVVVUTT.",
        ".TUTVVVVVVVVVUTT.",
        ".TUTUUUUUUUUUTUT.",
        ".TTTTTTTTTTTTTTT.",
        "TTTTLLLLLLLLLTTT",
        "TTLLLLLLLLLLLLTT",
        "TLLL........LLLT",
        "TLL..........LLT",
        "LL............LL",
        "LL............LL",
        "LL............LL",
        "LL............LL",
      ],
      [
        "...TUUUUUUUUUUT...",
        "..TUTTTTTTTTTUT..",
        ".TUTUUUUUUUUUTUT.",
        ".TUTVVVVVVVVVUTT.",
        ".TUTVVVVVVVVVUTT.",
        ".TUTVVVVVVVVVUTT.",
        ".TUTUUUUUUUUUTUT.",
        ".TTTTTTTTTTTTTTT.",
        "TTTTLLLLLLLLLTTT",
        "TTLLLLLLLLLLLLTT",
        "TLLL........LLLT",
        "TLL....LL....LLT",
        "LL....LLLL....LL",
        "LL...LLLLLL...LL",
        "LL..LLLLLLLL..LL",
        "LL.LLLLLLLLLL.LL",
      ],
    ],
    frameDuration: 360,
  },
};

function getSpriteSize(frames) {
  let width = 0;
  const height = frames[0].length;
  frames.forEach((frame) => {
    frame.forEach((row) => {
      width = Math.max(width, row.length);
    });
  });
  return { width, height };
}

function createAnimator(def) {
  const { width, height } = getSpriteSize(def.frames);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.className = "pixel-sprite";
  const ctx = canvas.getContext("2d", { alpha: true });
  ctx.imageSmoothingEnabled = false;

  let frameIndex = 0;
  let timer = 0;
  renderFrame(ctx, def.frames[frameIndex]);

  return {
    element: canvas,
    update(deltaMs) {
      timer += deltaMs;
      if (timer >= def.frameDuration) {
        timer = 0;
        frameIndex = (frameIndex + 1) % def.frames.length;
        renderFrame(ctx, def.frames[frameIndex]);
      }
    },
  };
}

function renderFrame(ctx, frame) {
  const height = frame.length;
  const width = ctx.canvas.width;
  ctx.clearRect(0, 0, width, ctx.canvas.height);
  for (let y = 0; y < height; y += 1) {
    const row = frame[y];
    for (let x = 0; x < width; x += 1) {
      const key = row[x] || ".";
      const color = COLORS[key];
      if (!color || color === "transparent") continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

export function createPlantSprite(type) {
  const def = PLANT_SPRITES[type] ?? PLANT_SPRITES.pea;
  return createAnimator(def);
}

export function createAlienSprite(type) {
  const resolvedType = type === "boss5" || type === "boss10" ? "tank" : type;
  const def = ALIEN_SPRITES[resolvedType] ?? ALIEN_SPRITES.basic;
  return createAnimator(def);
}
