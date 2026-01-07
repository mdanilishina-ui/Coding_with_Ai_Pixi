export class LayoutManager {
  constructor({ container, boardWrapper, board, rows, cols, onResize } = {}) {
    this.container = container;
    this.boardWrapper = boardWrapper;
    this.board = board;
    this.rows = rows;
    this.cols = cols;
    this.onResize = onResize;
    this.currentTileSize = 0;
    this._bind();
    this.resize();
  }

  _bind() {
    if (typeof ResizeObserver !== "undefined" && this.container) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.container);
    } else if (typeof window !== "undefined") {
      this.resizeListener = () => this.resize();
      window.addEventListener("resize", this.resizeListener);
    }
  }

  _getAvailableSize() {
    const container = this.container;
    if (!container) {
      return { width: 0, height: 0 };
    }

    const isEmbedded =
      typeof document !== "undefined" && document.body?.classList.contains("embedded");
    const widthSource = this.boardWrapper || container;
    const availableWidth = widthSource.clientWidth || 0;

    if (isEmbedded) {
      const heightSource = this.boardWrapper || container;
      return { width: availableWidth, height: heightSource.clientHeight || 0 };
    }

    const rect = container.getBoundingClientRect();
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : rect.height;
    const availableHeight = Math.max(0, viewportHeight - rect.top - 24);
    return { width: availableWidth, height: availableHeight || rect.height || 0 };
  }

  resize() {
    if (!this.board || !this.rows || !this.cols) return;
    const { width, height } = this._getAvailableSize();
    if (!width || !height) return;

    const tileByWidth = Math.floor(width / this.cols);
    const tileByHeight = Math.floor(height / this.rows);
    let tileSize = Math.min(tileByWidth, tileByHeight);
    tileSize = Math.max(32, Math.floor(tileSize));

    if (tileSize === this.currentTileSize) return;
    this.currentTileSize = tileSize;
    this.board.style.setProperty("--tile-size", `${tileSize}px`);

    if (this.onResize) {
      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(() => this.onResize(tileSize));
      } else {
        this.onResize(tileSize);
      }
    }
  }

  destroy() {
    this.resizeObserver?.disconnect();
    if (this.resizeListener) {
      window.removeEventListener("resize", this.resizeListener);
    }
  }
}
