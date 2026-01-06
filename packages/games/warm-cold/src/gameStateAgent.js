export class GameStateAgent {
  constructor() {
    this.state = "idle";
  }

  setState(next) {
    const valid = {
      idle: ["running"],
      running: ["success", "fail", "running"],
      success: ["running", "idle"],
      fail: ["running", "idle"],
    };

    const allowed = valid[this.state] || [];
    if (!allowed.includes(next)) {
      return false;
    }

    this.state = next;
    return true;
  }
}
