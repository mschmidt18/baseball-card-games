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
   * @returns {Object} High scores by game type and difficulty
   */
  getAll() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const scores = stored ? JSON.parse(stored) : {};

      // Migrate old format if needed
      return this.migrateScores(scores);
    } catch {
      return { matching: {}, valuation: {} };
    }
  },

  /**
   * Migrate old score format to new multi-game format
   * @param {Object} scores - Raw scores from localStorage
   * @returns {Object} Migrated scores
   */
  migrateScores(scores) {
    // Check if already in new format
    if (scores.matching || scores.valuation) {
      return scores;
    }

    // Old format: { "10": 15, "20": 32, "30": 58 }
    // New format: { matching: { "10": 15, ... }, valuation: { ... } }
    const migrated = {
      matching: {},
      valuation: {}
    };

    // Migrate numeric keys to matching
    Object.keys(scores).forEach(key => {
      if (!isNaN(key)) {
        migrated.matching[key] = scores[key];
      }
    });

    return migrated;
  },

  /**
   * Get high score for specific game and difficulty
   * @param {string} gameType - 'matching' or 'valuation' (or cardCount for backwards compat)
   * @param {string|number} difficulty - Difficulty level or mode
   * @returns {number|null} High score or null
   */
  get(gameType, difficulty) {
    // Backwards compatibility: get(cardCount)
    if (typeof gameType === 'number' || !isNaN(gameType)) {
      const scores = this.getAll();
      return scores.matching?.[gameType] || null;
    }

    // New format: get('matching', 10) or get('valuation', '3-card')
    const scores = this.getAll();
    return scores[gameType]?.[difficulty] || null;
  },

  /**
   * Save new high score if better than existing
   * @param {string} gameType - 'matching' or 'valuation' (or cardCount for backwards compat)
   * @param {string|number} difficulty - Difficulty level or mode (or turns for backwards compat)
   * @param {number} score - Score to save (optional for backwards compat)
   * @returns {boolean} True if new record
   */
  save(gameType, difficulty, score) {
    // Backwards compatibility: save(cardCount, turns)
    if (typeof gameType === 'number' || !isNaN(gameType)) {
      const cardCount = gameType;
      const turns = difficulty;
      const scores = this.getAll();
      const currentBest = scores.matching?.[cardCount];

      // Lower is better for matching
      if (!currentBest || turns < currentBest) {
        if (!scores.matching) scores.matching = {};
        scores.matching[cardCount] = turns;
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(scores));
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }

    // New format: save('matching', 10, 15) or save('valuation', '3-card', 4)
    const scores = this.getAll();
    if (!scores[gameType]) scores[gameType] = {};

    const currentBest = scores[gameType][difficulty];
    let isNewRecord = false;

    if (gameType === 'matching') {
      // Lower is better for matching
      isNewRecord = !currentBest || score < currentBest;
    } else {
      // Higher is better for valuation
      isNewRecord = !currentBest || score > currentBest;
    }

    if (isNewRecord) {
      scores[gameType][difficulty] = score;
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
