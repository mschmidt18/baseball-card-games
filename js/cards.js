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
  },

  /**
   * Parse value string to number
   * @param {string} valueString - Value like "$8,000,000" or "$13,000,000+"
   * @returns {number} Numeric value
   */
  parseValue(valueString) {
    // Remove $, commas, and + symbols, then parse
    return parseInt(valueString.replace(/[$,+]/g, ''), 10);
  },

  /**
   * Sort cards by value
   * @param {Array} cards - Cards to sort
   * @param {boolean} descending - Sort order (default: true for high to low)
   * @returns {Array} Sorted cards
   */
  sortByValue(cards, descending = true) {
    return [...cards].sort((a, b) => {
      const valA = this.parseValue(a.estimatedValue);
      const valB = this.parseValue(b.estimatedValue);
      return descending ? valB - valA : valA - valB;
    });
  },

  /**
   * Get adjacent card values for multiple choice
   * @param {string} cardId - Card to get adjacent values for
   * @returns {Array} Array of 3 unique value strings (correct + 2 different)
   */
  getAdjacentValues(cardId) {
    const card = this.getCardById(cardId);
    if (!card) return [];

    const sorted = this.sortByValue(this.allCards, true);
    const cardIndex = sorted.findIndex(c => c.id === cardId);

    const uniqueValues = new Set([card.estimatedValue]);
    const options = [card.estimatedValue];

    // Collect unique values by searching up and down from card position
    let offset = 1;
    while (uniqueValues.size < 3 && offset < sorted.length) {
      // Try below (higher index = lower value)
      if (cardIndex + offset < sorted.length) {
        const lowerValue = sorted[cardIndex + offset].estimatedValue;
        if (!uniqueValues.has(lowerValue)) {
          uniqueValues.add(lowerValue);
          options.push(lowerValue);
        }
      }

      // Try above (lower index = higher value)
      if (uniqueValues.size < 3 && cardIndex - offset >= 0) {
        const higherValue = sorted[cardIndex - offset].estimatedValue;
        if (!uniqueValues.has(higherValue)) {
          uniqueValues.add(higherValue);
          options.push(higherValue);
        }
      }

      offset++;
    }

    // Sort options in ascending order (low to high)
    return options.sort((a, b) => {
      const valA = this.parseValue(a);
      const valB = this.parseValue(b);
      return valA - valB;
    });
  },

  /**
   * Format card name for display
   * @param {Object} card - Card object
   * @returns {string} Formatted name like "Honus Wagner (1909 T206)"
   */
  formatCardName(card) {
    return `${card.playerName} (${card.year} ${card.cardSet})`;
  }
};
