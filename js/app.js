/**
 * Application Controller
 * Initializes the game and coordinates between modules
 */
const App = {
  currentCardCount: 20, // Default difficulty

  /**
   * Initialize the application
   */
  async init() {
    // Initialize UI
    UI.init();

    // Load card data
    await Cards.load();

    // Set up event listeners
    this.setupEventListeners();

    // Update high scores display
    UI.updateHighScores();

    // Show mobile hint
    UI.updateMobileHint();
    window.addEventListener('resize', () => UI.updateMobileHint());

    // Show menu screen
    UI.showScreen('menu');
  },

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cardCount = parseInt(e.currentTarget.dataset.cards);
        this.startGame(cardCount);
      });
    });

    // Back to menu button
    document.getElementById('back-btn').addEventListener('click', () => {
      Game.reset();
      UI.updateHighScores();
      UI.showScreen('menu');
    });

    // Restart button
    document.getElementById('restart-btn').addEventListener('click', () => {
      this.startGame(this.currentCardCount);
    });

    // Play again button
    document.getElementById('play-again-btn').addEventListener('click', () => {
      this.startGame(this.currentCardCount);
    });

    // Change difficulty button
    document.getElementById('change-difficulty-btn').addEventListener('click', () => {
      UI.updateHighScores();
      UI.showScreen('menu');
    });

    // Game board click handler (event delegation)
    document.getElementById('game-board').addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (card && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
        this.handleCardClick(card.dataset.tileId);
      }
    });

    // Modal close button
    document.getElementById('modal-close').addEventListener('click', () => {
      UI.hideCardModal();
    });

    // Modal overlay click to close
    document.getElementById('card-info-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        UI.hideCardModal();
      }
    });

    // Matched card click to show info
    document.getElementById('matched-cards-list').addEventListener('click', (e) => {
      const item = e.target.closest('.matched-card-item');
      if (item) {
        const card = Cards.getCardById(item.dataset.cardId);
        if (card) {
          UI.showCardModal(card);
        }
      }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        UI.hideCardModal();
      }
    });
  },

  /**
   * Start a new game
   * @param {number} cardCount - Number of unique cards
   */
  async startGame(cardCount) {
    this.currentCardCount = cardCount;

    // Initialize game
    const cards = await Game.init(cardCount);

    // Render board
    UI.renderBoard(cards);
    UI.updateTurns(0);

    // Show game screen
    UI.showScreen('game');
  },

  /**
   * Handle card click
   * @param {string} tileId - Clicked tile ID
   */
  handleCardClick(tileId) {
    // Flip the card in UI first for responsiveness
    UI.flipCard(tileId);

    // Process game logic
    const result = Game.flipCard(tileId);

    switch (result.action) {
      case 'flipped':
        // First card flipped, waiting for second
        break;

      case 'match':
        // Cards matched!
        UI.updateTurns(result.turns);
        UI.markMatched([result.cards[0].tileId, result.cards[1].tileId]);

        if (result.isVictory) {
          // Delay victory screen for animation
          setTimeout(() => this.handleVictory(), 800);
        }
        break;

      case 'mismatch':
        // Cards don't match
        UI.updateTurns(result.turns);
        UI.disableBoard();

        // Flip cards back after delay
        setTimeout(() => {
          UI.unflipCards([result.cards[0].tileId, result.cards[1].tileId]);
          UI.enableBoard();
          result.unlock();
        }, 1000);
        break;
    }
  },

  /**
   * Handle game victory
   */
  handleVictory() {
    const turns = Game.getTurns();
    const matchedCards = Game.getMatchedCards();

    // Check for new high score
    const isNewRecord = HighScores.save(this.currentCardCount, turns);

    // Show victory screen
    UI.showVictory({
      turns,
      isNewRecord,
      matchedCards
    });
  }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
