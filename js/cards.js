/**
 * Card Data Manager
 * Handles loading, selecting, and preparing card data for the game
 */
const Cards = {
  allCards: [],
  isLoaded: false,

  /**
   * Load cards from JSON file
   */
  async load() {
    if (this.isLoaded) {
      return this.allCards;
    }

    try {
      const response = await fetch('data/cards.json');
      const data = await response.json();
      this.allCards = data.cards;
      this.isLoaded = true;
      return this.allCards;
    } catch (error) {
      console.error('Failed to load cards:', error);
      return [];
    }
  },

  /**
   * Select random subset of cards
   * @param {number} count - Number of cards to select
   * @returns {Array} Selected cards
   */
  selectRandom(count) {
    const shuffled = [...this.allCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  /**
   * Prepare game deck by doubling cards and shuffling
   * @param {Array} selectedCards - Cards to use in the game
   * @returns {Array} Doubled and shuffled deck
   */
  prepareGameDeck(selectedCards) {
    // Create pairs (each card appears twice)
    const deck = [];
    selectedCards.forEach((card, index) => {
      // Add two copies of each card with unique tile IDs
      deck.push({ ...card, tileId: `${card.id}-a` });
      deck.push({ ...card, tileId: `${card.id}-b` });
    });

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  },

  /**
   * Get card by ID
   * @param {string} id - Card ID
   * @returns {Object|null} Card object or null
   */
  getCardById(id) {
    return this.allCards.find(card => card.id === id) || null;
  },

  /**
   * Preload card images
   * @param {Array} cards - Cards to preload
   */
  preloadImages(cards) {
    cards.forEach(card => {
      const img = new Image();
      img.src = `images/cards/${card.imageFile}`;
    });
  }
};
