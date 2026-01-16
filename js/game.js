/**
 * Game State Machine
 * Handles game logic, matching, scoring, and victory detection
 */
const Game = {
  state: {
    cards: [],           // Current game cards (doubled & shuffled)
    flippedCards: [],    // Currently flipped cards (max 2)
    matchedPairs: [],    // Successfully matched card IDs
    turns: 0,            // Turn counter (score)
    isLocked: false,     // Prevent clicks during animation
    cardCount: 0,        // Number of unique cards in game
    isPlaying: false     // Game is active
  },

  /**
   * Initialize a new game
   * @param {number} cardCount - Number of unique cards to play with
   */
  async init(cardCount) {
    // Load cards if not already loaded
    await Cards.load();

    // Reset state
    this.state.flippedCards = [];
    this.state.matchedPairs = [];
    this.state.turns = 0;
    this.state.isLocked = false;
    this.state.cardCount = cardCount;
    this.state.isPlaying = true;

    // Select and prepare cards
    const selectedCards = Cards.selectRandom(cardCount);
    this.state.cards = Cards.prepareGameDeck(selectedCards);

    // Preload images
    Cards.preloadImages(selectedCards);

    return this.state.cards;
  },

  /**
   * Handle card flip
   * @param {string} tileId - Unique tile identifier
   * @returns {Object} Result of the flip action
   */
  flipCard(tileId) {
    // Ignore if game is locked or not playing
    if (this.state.isLocked || !this.state.isPlaying) {
      return { action: 'ignored' };
    }

    // Find the card
    const card = this.state.cards.find(c => c.tileId === tileId);
    if (!card) {
      return { action: 'ignored' };
    }

    // Ignore if card is already flipped or matched
    if (this.state.flippedCards.find(c => c.tileId === tileId)) {
      return { action: 'ignored' };
    }
    if (this.state.matchedPairs.includes(card.id)) {
      return { action: 'ignored' };
    }

    // Add to flipped cards
    this.state.flippedCards.push(card);

    // First card of the turn
    if (this.state.flippedCards.length === 1) {
      return { action: 'flipped', card };
    }

    // Second card of the turn - increment turns
    this.state.turns++;

    // Check for match
    const [firstCard, secondCard] = this.state.flippedCards;

    if (firstCard.id === secondCard.id) {
      // Match found!
      return this.handleMatch(firstCard, secondCard);
    } else {
      // No match
      return this.handleMismatch(firstCard, secondCard);
    }
  },

  /**
   * Handle successful match
   * @param {Object} firstCard - First matched card
   * @param {Object} secondCard - Second matched card
   * @returns {Object} Match result
   */
  handleMatch(firstCard, secondCard) {
    // Add to matched pairs
    this.state.matchedPairs.push(firstCard.id);

    // Clear flipped cards
    this.state.flippedCards = [];

    // Check for victory
    const isVictory = this.isVictory();

    return {
      action: 'match',
      cards: [firstCard, secondCard],
      turns: this.state.turns,
      isVictory
    };
  },

  /**
   * Handle mismatch
   * @param {Object} firstCard - First card
   * @param {Object} secondCard - Second card
   * @returns {Object} Mismatch result
   */
  handleMismatch(firstCard, secondCard) {
    // Lock the board
    this.state.isLocked = true;

    return {
      action: 'mismatch',
      cards: [firstCard, secondCard],
      turns: this.state.turns,
      unlock: () => {
        this.state.flippedCards = [];
        this.state.isLocked = false;
      }
    };
  },

  /**
   * Check if game is won
   * @returns {boolean} True if all pairs matched
   */
  isVictory() {
    return this.state.matchedPairs.length === this.state.cardCount;
  },

  /**
   * Get current turn count
   * @returns {number} Current turns
   */
  getTurns() {
    return this.state.turns;
  },

  /**
   * Get matched card data for victory screen
   * @returns {Array} Matched card details
   */
  getMatchedCards() {
    return this.state.matchedPairs.map(id => Cards.getCardById(id));
  },

  /**
   * Reset game state
   */
  reset() {
    this.state.cards = [];
    this.state.flippedCards = [];
    this.state.matchedPairs = [];
    this.state.turns = 0;
    this.state.isLocked = false;
    this.state.isPlaying = false;
  }
};

/**
 * High Score Manager
 */
const HighScores = {
  storageKey: 'baseballCardGame_highScores',

  /**
   * Get all high scores
   * @returns {Object} High scores by difficulty
   */
  getAll() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  /**
   * Get high score for specific difficulty
   * @param {number} cardCount - Difficulty level
   * @returns {number|null} High score or null
   */
  get(cardCount) {
    const scores = this.getAll();
    return scores[cardCount] || null;
  },

  /**
   * Save new high score if better than existing
   * @param {number} cardCount - Difficulty level
   * @param {number} turns - Score to save
   * @returns {boolean} True if new record
   */
  save(cardCount, turns) {
    const scores = this.getAll();
    const currentBest = scores[cardCount];

    // Lower is better
    if (!currentBest || turns < currentBest) {
      scores[cardCount] = turns;
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(scores));
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }
};
