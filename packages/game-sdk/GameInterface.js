/**
 * Minimal contract shared with platform loaders.
 * Each game package can optionally extend this interface to ensure
 * a consistent API when embedding outside of an iframe in the future.
 */
export class GameInterface {
  /**
   * Called when the platform wants to boot the game without an iframe.
   * @param {HTMLElement} mountNode - Host element where the game should render.
   */
  mount(mountNode) {
    throw new Error("GameInterface.mount must be implemented by the game package");
  }

  /**
   * Invoked when the platform wants to teardown the current game instance.
   */
  unmount() {
    throw new Error("GameInterface.unmount must be implemented by the game package");
  }
}
