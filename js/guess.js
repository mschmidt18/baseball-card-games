/**
 * Guess the Card Game Module
 * Player identifies pixelated baseball cards by entering player name and year
 */
const Guess = {
  state: {
    currentRound: 0,           // 0-4 (5 rounds)
    totalPoints: 0,            // Running score (0-30 max)
    usedCardIds: [],          // Prevent card repeats
    currentCard: null,         // Card being guessed
    attemptsRemaining: 3,     // 3, 2, 1
    nameCorrect: false,       // Name answered correctly
    yearCorrect: false,       // Year answered correctly
    namePointsEarned: 0,      // Points for name this round
    yearPointsEarned: 0,      // Points for year this round
    roundHistory: [],         // Each round's result
    isPlaying: false,
    awaitingNextRound: false  // Lock during transitions
  },

  /**
   * Initialize a new guess game (5 rounds)
   */
  async init() {
    await Cards.load();

    this.state.currentRound = 0;
    this.state.totalPoints = 0;
    this.state.usedCardIds = [];
    this.state.roundHistory = [];
    this.state.isPlaying = true;
    this.state.awaitingNextRound = false;

    return this.setupRound();
  },

  /**
   * Set up a new round with random unused card
   * @returns {Object} Round data with card and blur amount
   */
  setupRound() {
    // Get available cards (not yet used)
    let available = Cards.allCards.filter(
      c => !this.state.usedCardIds.includes(c.id)
    );

    // If we've used too many cards, reset the pool
    if (available.length === 0) {
      this.state.usedCardIds = [];
      available = [...Cards.allCards];
    }

    // Select random card
    const randomIndex = Math.floor(Math.random() * available.length);
    this.state.currentCard = available[randomIndex];
    this.state.usedCardIds.push(this.state.currentCard.id);

    // Reset attempts and correctness for new round
    this.state.attemptsRemaining = 3;
    this.state.nameCorrect = false;
    this.state.yearCorrect = false;
    this.state.namePointsEarned = 0;
    this.state.yearPointsEarned = 0;
    this.state.awaitingNextRound = false;

    return {
      card: this.state.currentCard,
      round: this.state.currentRound + 1,
      totalRounds: 5,
      blurAmount: this.getBlurAmount(),
      attemptsRemaining: this.state.attemptsRemaining
    };
  },

  /**
   * Submit a guess for the current card
   * @param {string} playerName - Guessed player name
   * @param {string|number} year - Guessed year
   * @returns {Object} Result with partial correctness, attemptsRemaining, points, etc.
   */
  submitGuess(playerName, year) {
    if (this.state.awaitingNextRound || !this.state.currentCard) {
      return { action: 'ignored' };
    }

    // Normalize inputs
    const normalizedInput = playerName.trim().toLowerCase();
    const inputYear = parseInt(year, 10);

    // Check matches (only if not already correct)
    const nameMatch = !this.state.nameCorrect &&
                      this.fuzzyMatch(normalizedInput, this.state.currentCard);
    const yearMatch = !this.state.yearCorrect &&
                      inputYear === this.state.currentCard.year;

    // Calculate attempts used (1, 2, or 3)
    const attemptsUsed = 4 - this.state.attemptsRemaining;

    // Award points for newly correct components
    let namePointsThisAttempt = 0;
    let yearPointsThisAttempt = 0;

    if (nameMatch) {
      this.state.nameCorrect = true;
      this.state.namePointsEarned = this.calculatePoints(attemptsUsed);
      this.state.totalPoints += this.state.namePointsEarned;
      namePointsThisAttempt = this.state.namePointsEarned;
    }

    if (yearMatch) {
      this.state.yearCorrect = true;
      this.state.yearPointsEarned = this.calculatePoints(attemptsUsed);
      this.state.totalPoints += this.state.yearPointsEarned;
      yearPointsThisAttempt = this.state.yearPointsEarned;
    }

    // Always reduce attempts after a guess (for consistent blur reduction)
    this.state.attemptsRemaining--;

    // Round is over when both correct OR no attempts left
    const bothCorrect = this.state.nameCorrect && this.state.yearCorrect;
    const isRoundOver = bothCorrect || this.state.attemptsRemaining === 0;

    if (isRoundOver) {
      this.state.awaitingNextRound = true;

      // Record round history
      this.state.roundHistory.push({
        round: this.state.currentRound + 1,
        card: this.state.currentCard,
        namePointsEarned: this.state.namePointsEarned,
        yearPointsEarned: this.state.yearPointsEarned,
        totalPointsEarned: this.state.namePointsEarned + this.state.yearPointsEarned,
        attemptsUsed: bothCorrect ? attemptsUsed : 3,
        nameCorrect: this.state.nameCorrect,
        yearCorrect: this.state.yearCorrect
      });

      this.state.currentRound++;
    }

    const isGameOver = this.state.currentRound >= 5;

    return {
      nameMatch,
      yearMatch,
      nameCorrect: this.state.nameCorrect,
      yearCorrect: this.state.yearCorrect,
      attemptsRemaining: this.state.attemptsRemaining,
      namePointsThisAttempt,
      yearPointsThisAttempt,
      namePointsEarned: this.state.namePointsEarned,
      yearPointsEarned: this.state.yearPointsEarned,
      roundPointsEarned: this.state.namePointsEarned + this.state.yearPointsEarned,
      card: this.state.currentCard,
      isRoundOver,
      isGameOver,
      totalPoints: this.state.totalPoints,
      round: this.state.currentRound,
      correctAnswer: {
        playerName: this.state.currentCard.playerName,
        year: this.state.currentCard.year
      }
    };
  },

  /**
   * Fuzzy match player name input against card
   * Matches full name, last name only, or any variation with matching last name
   * @param {string} input - Normalized lowercase input
   * @param {Object} card - Card object
   * @returns {boolean} Whether input matches player name
   */
  fuzzyMatch(input, card) {
    const fullName = card.playerName.toLowerCase();
    const nameParts = fullName.split(' ');
    const inputParts = input.split(' ');

    // Match full name exactly
    if (fullName === input) return true;

    // Get last names for comparison
    const cardLastName = nameParts[nameParts.length - 1];
    const inputLastName = inputParts[inputParts.length - 1];

    // If input has multiple words and last name matches, accept it
    // This handles "Ed Plank" matching "Eddie Plank"
    if (inputParts.length > 1 && cardLastName === inputLastName) {
      return true;
    }

    // Match last name only (single word input)
    if (inputParts.length === 1 && cardLastName === input) return true;

    // Match first name only (single word input)
    const firstName = nameParts[0];
    if (inputParts.length === 1 && firstName === input) return true;

    // Match any part of the name (single word input)
    if (inputParts.length === 1 && nameParts.some(part => part === input)) {
      return true;
    }

    return false;
  },

  /**
   * Calculate points based on attempts used
   * @param {number} attemptsUsed - Number of attempts (1, 2, or 3)
   * @returns {number} Points earned (3, 2, or 1)
   */
  calculatePoints(attemptsUsed) {
    switch (attemptsUsed) {
      case 1: return 3;
      case 2: return 2;
      case 3: return 1;
      default: return 0;
    }
  },

  /**
   * Get current blur amount based on attempts remaining
   * @returns {number} Blur amount in pixels
   */
  getBlurAmount() {
    switch (this.state.attemptsRemaining) {
      case 3: return 20;
      case 2: return 10;
      case 1: return 5;
      default: return 0;
    }
  },

  /**
   * Get game results
   * @returns {Object} Results with totalPoints, roundHistory
   */
  getResults() {
    return {
      totalPoints: this.state.totalPoints,
      maxPoints: 30,
      roundHistory: this.state.roundHistory
    };
  },

  /**
   * Reset game state
   */
  reset() {
    this.state.currentRound = 0;
    this.state.totalPoints = 0;
    this.state.usedCardIds = [];
    this.state.currentCard = null;
    this.state.attemptsRemaining = 3;
    this.state.nameCorrect = false;
    this.state.yearCorrect = false;
    this.state.namePointsEarned = 0;
    this.state.yearPointsEarned = 0;
    this.state.roundHistory = [];
    this.state.isPlaying = false;
    this.state.awaitingNextRound = false;
  }
};
