export class RoundManager {
  constructor({ totalRounds = 10, baseCount = 2, increment = 3, bonus = 100 } = {}) {
    this.totalRounds = totalRounds;
    this.baseCount = baseCount;
    this.increment = increment;
    this.roundBonus = bonus;
    this.reset();
  }

  reset() {
    this.currentRound = 0;
  }

  getTotalRounds() {
    return this.totalRounds;
  }

  getRoundBonus() {
    return this.roundBonus;
  }

  getNextRoundInfo() {
    const nextRound = this.currentRound + 1;
    if (nextRound > this.totalRounds) {
      return null;
    }

    const totalAliens = this.baseCount + this.increment * (nextRound - 1);
    return {
      round: nextRound,
      totalAliens,
      weights: this.getWeightsForRound(nextRound),
    };
  }

  startNextRound() {
    const info = this.getNextRoundInfo();
    if (!info) return null;
    this.currentRound += 1;
    return info;
  }

  getCurrentRoundNumber() {
    return this.currentRound;
  }

  hasMoreRounds() {
    return this.currentRound < this.totalRounds;
  }

  isComplete() {
    return this.currentRound >= this.totalRounds;
  }

  getWeightsForRound(round) {
    if (round <= 2) {
      return { basic: 1 };
    }
    if (round <= 4) {
      return { basic: 0.8, fast: 0.2 };
    }
    if (round <= 6) {
      return { basic: 0.6, fast: 0.35, tank: 0.05 };
    }
    if (round <= 8) {
      return { basic: 0.45, fast: 0.4, tank: 0.15 };
    }
    return { basic: 0.3, fast: 0.4, tank: 0.3 };
  }
}
