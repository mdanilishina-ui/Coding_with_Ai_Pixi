import { GRID_COLS, GRID_ROWS, TILE_SIZE } from "./constants.js";

export class Grid {
  constructor(boardElement, { onTileClick, onTileHover } = {}) {
    this.boardElement = boardElement;
    this.onTileClick = onTileClick;
    this.onTileHover = onTileHover;
    this.tiles = [];
    this.tileSize = TILE_SIZE;
    this._build();
    this._bindResize();
  }

  _build() {
    this.boardElement.innerHTML = "";
    for (let row = 0; row < GRID_ROWS; row += 1) {
      const rowTiles = [];
      for (let col = 0; col < GRID_COLS; col += 1) {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "tile";
        tile.dataset.row = row;
        tile.dataset.col = col;
        tile.setAttribute("aria-label", `Tile ${row + 1}, ${col + 1}`);
        tile.addEventListener("click", () => {
          this.onTileClick?.(row, col);
        });
        tile.addEventListener("mouseenter", () => {
          this.onTileHover?.(row, col, true);
        });
        tile.addEventListener("mouseleave", () => {
          this.onTileHover?.(row, col, false);
        });
        this.boardElement.appendChild(tile);
        rowTiles.push(tile);
      }
      this.tiles.push(rowTiles);
    }
    this._updateTileSize();
  }

  _bindResize() {
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => this._updateTileSize());
      resizeObserver.observe(this.boardElement);
      this.resizeObserver = resizeObserver;
    } else {
      this.resizeListener = () => this._updateTileSize();
      window.addEventListener("resize", this.resizeListener);
    }
  }

  _updateTileSize() {
    const firstTile = this.tiles[0]?.[0];
    if (firstTile) {
      this.tileSize = firstTile.getBoundingClientRect().width || TILE_SIZE;
    }
  }

  refreshTileSize() {
    this._updateTileSize();
  }

  highlightTile(row, col, enabled) {
    const tile = this.tiles[row]?.[col];
    if (!tile) return;
    tile.classList.toggle("tile--highlight", Boolean(enabled));
  }

  getPosition(row, col) {
    return {
      x: col * this.tileSize,
      y: row * this.tileSize,
    };
  }

  destroy() {
    this.resizeObserver?.disconnect();
    if (this.resizeListener) {
      window.removeEventListener("resize", this.resizeListener);
    }
  }
}
