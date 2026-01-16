/**
 * Valuation Game Module
 * Handles card valuation game modes
 */
const Valuation = {
  state: {
    mode: null,             // '3-card', '2-card', '1-card'
    currentRound: 0,        // 0-4 (5 rounds total)
    correctCount: 0,        // Number of correct answers
    usedCardIds: [],        // Track used cards to avoid repeats
    roundCards: [],         // Cards for current round
    selectedCard: null,     // For 3-card mode: currently selected card
    placements: [null, null, null], // For 3-card mode: positions
    roundHistory: [],       // Track each round's result for summary
    isPlaying: false,
    awaitingNextRound: false // Prevent multiple submissions during reveal
  },

  /**
   * Initialize a new valuation game
   * @param {string} mode - Game mode ('3-card', '2-card', '1-card')
   */
  async init(mode) {
    await Cards.load();

    this.state.mode = mode;
    this.state.currentRound = 0;
    this.state.correctCount = 0;
    this.state.usedCardIds = [];
    this.state.roundHistory = [];
    this.state.isPlaying = true;
    this.state.awaitingNextRound = false;

    return this.setupRound();
  },

  /**
   * Set up cards for current round
   */
  setupRound() {
    const cardCount = this.state.mode === '3-card' ? 3 :
                      this.state.mode === '2-card' ? 2 : 1;

    // Get available cards (not yet used)
    let available = Cards.allCards.filter(
      c => !this.state.usedCardIds.includes(c.id)
    );

    // If we've used too many cards, reset the pool
    if (available.length < cardCount) {
      this.state.usedCardIds = [];
      available = [...Cards.allCards];
    }

    // Select cards with unique values (no trick questions)
    this.state.roundCards = this.selectCardsWithUniqueValues(available, cardCount);

    // Mark as used
    this.state.roundCards.forEach(c => this.state.usedCardIds.push(c.id));

    // Reset round state
    this.state.selectedCard = null;
    this.state.placements = [null, null, null];
    this.state.awaitingNextRound = false;

    return {
      cards: this.state.roundCards,
      round: this.state.currentRound + 1,
      mode: this.state.mode
    };
  },

  /**
   * Select cards ensuring all have unique values
   * @param {Array} pool - Available cards to choose from
   * @param {number} count - Number of cards to select
   * @returns {Array} Selected cards with unique values
   */
  selectCardsWithUniqueValues(pool, count) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = [];
    const usedValues = new Set();

    for (const card of shuffled) {
      const value = Cards.parseValue(card.estimatedValue);
      if (!usedValues.has(value)) {
        selected.push(card);
        usedValues.add(value);
        if (selected.length === count) break;
      }
    }

    return selected;
  },

  /**
   * Handle card selection in 3-card mode
   * @param {string} cardId - Card ID to select
   */
  selectCard(cardId) {
    if (this.state.awaitingNextRound) return { action: 'ignored' };
    this.state.selectedCard = cardId;
    return { selectedCard: cardId };
  },

  /**
   * Place selected card in position slot (3-card mode)
   * @param {number} position - Position index (0, 1, or 2)
   */
  placeCard(position) {
    if (!this.state.selectedCard || this.state.awaitingNextRound) {
      return { action: 'ignored' };
    }

    // Remove card from any existing position
    const existingPos = this.state.placements.indexOf(this.state.selectedCard);
    if (existingPos !== -1) {
      this.state.placements[existingPos] = null;
    }

    // Remove any card already in target position
    this.state.placements[position] = this.state.selectedCard;
    this.state.selectedCard = null;

    const allPlaced = this.state.placements.every(p => p !== null);
    return {
      placements: [...this.state.placements],
      canSubmit: allPlaced
    };
  },

  /**
   * Submit answer for current round
   * @param {string|Array} answer - Card ID (2-card/1-card) or placements array (3-card)
   * @returns {Object} Result with isCorrect, correctAnswer, cards, isGameOver, score
   */
  submitAnswer(answer) {
    if (this.state.awaitingNextRound) {
      return { action: 'ignored' };
    }

    let isCorrect = false;
    let correctAnswer = null;
    let userAnswer = answer;

    switch (this.state.mode) {
      case '3-card':
        // Check if placements match correct value order
        const sortedCorrect = Cards.sortByValue(this.state.roundCards, true);
        correctAnswer = sortedCorrect.map(c => c.id);
        isCorrect = JSON.stringify(this.state.placements) === JSON.stringify(correctAnswer);
        userAnswer = [...this.state.placements];
        break;

      case '2-card':
        // Check if selected card is the more valuable one
        const [card1, card2] = this.state.roundCards;
        const val1 = Cards.parseValue(card1.estimatedValue);
        const val2 = Cards.parseValue(card2.estimatedValue);
        correctAnswer = val1 > val2 ? card1.id : card2.id;
        isCorrect = answer === correctAnswer;
        break;

      case '1-card':
        // Check if selected value matches card's actual value
        const card = this.state.roundCards[0];
        correctAnswer = card.estimatedValue;
        isCorrect = answer === correctAnswer;
        break;
    }

    if (isCorrect) {
      this.state.correctCount++;
    }

    // Record round history
    this.state.roundHistory.push({
      round: this.state.currentRound + 1,
      cards: [...this.state.roundCards],
      userAnswer,
      correctAnswer,
      isCorrect
    });

    this.state.currentRound++;
    this.state.awaitingNextRound = true;
    const isGameOver = this.state.currentRound >= 5;

    return {
      isCorrect,
      correctAnswer,
      cards: this.state.roundCards,
      isGameOver,
      score: this.state.correctCount,
      round: this.state.currentRound
    };
  },

  /**
   * Get value options for 1-card mode
   * @param {Object} card - Card to get options for
   * @returns {Array} Array of 3 value strings
   */
  getValueOptions(card) {
    return Cards.getAdjacentValues(card.id);
  },

  /**
   * Get game results
   * @returns {Object} Results with mode, score, total, roundHistory
   */
  getResults() {
    return {
      mode: this.state.mode,
      score: this.state.correctCount,
      total: 5,
      roundHistory: this.state.roundHistory
    };
  },

  /**
   * Reset game state
   */
  reset() {
    this.state.mode = null;
    this.state.currentRound = 0;
    this.state.correctCount = 0;
    this.state.usedCardIds = [];
    this.state.roundCards = [];
    this.state.selectedCard = null;
    this.state.placements = [null, null, null];
    this.state.roundHistory = [];
    this.state.isPlaying = false;
    this.state.awaitingNextRound = false;
  }
};
