/**
 * Application Controller
 * Initializes the game and coordinates between modules
 */
const App = {
  currentCardCount: 20, // Default difficulty
  currentValuationMode: null, // Current valuation mode

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
    UI.updateValuationHighScores();

    // Show mobile hint
    UI.updateMobileHint();
    window.addEventListener('resize', () => UI.updateMobileHint());

    // Show game selector screen
    UI.showScreen('game-selector');
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

    // ==== GAME SELECTOR EVENT LISTENERS ====

    // Game selector tiles
    document.querySelectorAll('.game-tile').forEach(tile => {
      tile.addEventListener('click', (e) => {
        const game = e.currentTarget.dataset.game;
        if (game === 'matching') {
          UI.updateHighScores();
          UI.showScreen('menu');
        } else if (game === 'valuation') {
          UI.updateValuationHighScores();
          UI.showScreen('valuation-menu');
        }
      });
    });

    // Back to selector buttons
    const matchingBackBtn = document.getElementById('matching-back-btn');
    if (matchingBackBtn) {
      matchingBackBtn.addEventListener('click', () => {
        UI.showScreen('game-selector');
      });
    }

    const valuationBackBtn = document.getElementById('valuation-back-btn');
    if (valuationBackBtn) {
      valuationBackBtn.addEventListener('click', () => {
        UI.showScreen('game-selector');
      });
    }

    // ==== VALUATION GAME EVENT LISTENERS ====

    // Mode selection buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        this.startValuationGame(mode);
      });
    });

    // Valuation game back button
    const valuationGameBackBtn = document.getElementById('valuation-game-back-btn');
    if (valuationGameBackBtn) {
      valuationGameBackBtn.addEventListener('click', () => {
        Valuation.reset();
        UI.updateValuationHighScores();
        UI.showScreen('valuation-menu');
      });
    }

    // Show names toggle
    const showNamesToggle = document.getElementById('show-names-toggle');
    if (showNamesToggle) {
      showNamesToggle.addEventListener('change', (e) => {
        const showNames = e.target.checked;
        UI.toggleCardNames(showNames);
        // Save preference
        localStorage.setItem('valuationShowNames', showNames);
      });

      // Load preference
      const savedPref = localStorage.getItem('valuationShowNames');
      if (savedPref !== null) {
        showNamesToggle.checked = savedPref === 'true';
      }
    }

    // Custom events from UI module
    document.addEventListener('cardSelected', (e) => {
      this.handleCardSelection(e.detail.cardId);
    });

    document.addEventListener('twoCardSelected', (e) => {
      this.handleTwoCardSelection(e.detail.cardId);
    });

    document.addEventListener('valueSelected', (e) => {
      this.handleValueSelection(e.detail.value);
    });

    // Position slot clicks for 3-card mode
    document.querySelectorAll('.position-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        const position = parseInt(e.currentTarget.dataset.position);
        this.handlePositionClick(position);
      });
    });

    // Submit order button
    const submitOrderBtn = document.getElementById('submit-order-btn');
    if (submitOrderBtn) {
      submitOrderBtn.addEventListener('click', () => {
        this.handleThreeCardSubmit();
      });
    }

    // Valuation results buttons
    const valuationPlayAgainBtn = document.getElementById('valuation-play-again-btn');
    if (valuationPlayAgainBtn) {
      valuationPlayAgainBtn.addEventListener('click', () => {
        this.startValuationGame(this.currentValuationMode);
      });
    }

    const valuationChangeModeBtn = document.getElementById('valuation-change-mode-btn');
    if (valuationChangeModeBtn) {
      valuationChangeModeBtn.addEventListener('click', () => {
        UI.updateValuationHighScores();
        UI.showScreen('valuation-menu');
      });
    }
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
  },

  // ===== VALUATION GAME METHODS =====

  /**
   * Start a new valuation game
   * @param {string} mode - Game mode ('3-card', '2-card', '1-card')
   */
  async startValuationGame(mode) {
    this.currentValuationMode = mode;
    const roundData = await Valuation.init(mode);

    // Show appropriate mode layout
    this.showValuationMode(mode);
    this.renderValuationRound(roundData);

    UI.showScreen('valuation-game');
  },

  /**
   * Show the appropriate valuation mode layout
   * @param {string} mode - Game mode
   */
  showValuationMode(mode) {
    document.getElementById('three-card-mode').style.display =
      mode === '3-card' ? 'flex' : 'none';
    document.getElementById('two-card-mode').style.display =
      mode === '2-card' ? 'flex' : 'none';
    document.getElementById('one-card-mode').style.display =
      mode === '1-card' ? 'flex' : 'none';
  },

  /**
   * Render current valuation round
   * @param {Object} roundData - Round data from Valuation module
   */
  renderValuationRound(roundData) {
    const { cards, round, mode } = roundData;

    // Update counters
    UI.updateValuationCounters(round, Valuation.state.correctCount);

    // Render mode-specific UI
    switch (mode) {
      case '3-card':
        UI.renderThreeCardMode(cards);
        document.getElementById('submit-order-btn').disabled = true;
        break;
      case '2-card':
        UI.renderTwoCardMode(cards);
        break;
      case '1-card':
        const options = Valuation.getValueOptions(cards[0]);
        UI.renderOneCardMode(cards[0], options);
        break;
    }
  },

  /**
   * Handle card selection in 3-card mode
   * @param {string} cardId - Selected card ID
   */
  handleCardSelection(cardId) {
    Valuation.selectCard(cardId);

    // Update UI to show selection
    document.querySelectorAll('.selectable-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.cardId === cardId);
    });
  },

  /**
   * Handle position slot click in 3-card mode
   * @param {number} position - Position index (0-2)
   */
  handlePositionClick(position) {
    const result = Valuation.placeCard(position);

    if (result.action === 'ignored') return;

    // Update UI with placements
    const { placements, canSubmit } = result;

    document.querySelectorAll('.position-slot').forEach((slot, index) => {
      const slotContent = slot.querySelector('.slot-content');
      slotContent.innerHTML = '';

      if (placements[index]) {
        const card = Valuation.state.roundCards.find(c => c.id === placements[index]);
        const showNames = document.getElementById('show-names-toggle')?.checked ?? true;
        const cardEl = UI.createValuationCard(card, showNames);
        slotContent.appendChild(cardEl);
      }
    });

    // Update card states in selection area
    document.querySelectorAll('.selectable-card').forEach(card => {
      const cardId = card.dataset.cardId;
      card.classList.toggle('placed', placements.includes(cardId));
      card.classList.remove('selected');
    });

    // Enable/disable submit button
    document.getElementById('submit-order-btn').disabled = !canSubmit;
  },

  /**
   * Handle submit in 3-card mode
   */
  handleThreeCardSubmit() {
    const result = Valuation.submitAnswer(Valuation.state.placements);
    this.handleValuationAnswer(result);
  },

  /**
   * Handle card selection in 2-card mode
   * @param {string} cardId - Selected card ID
   */
  handleTwoCardSelection(cardId) {
    const result = Valuation.submitAnswer(cardId);
    this.handleValuationAnswer(result);
  },

  /**
   * Handle value selection in 1-card mode
   * @param {string} value - Selected value
   */
  handleValueSelection(value) {
    const result = Valuation.submitAnswer(value);
    this.handleValuationAnswer(result);
  },

  /**
   * Handle valuation answer submission
   * @param {Object} result - Result from Valuation module
   */
  handleValuationAnswer(result) {
    // Update counter
    UI.updateValuationCounters(result.round, result.score);

    // Show answer reveal with animation
    UI.showAnswerReveal(result);

    // After delay, either next round or results
    setTimeout(() => {
      if (result.isGameOver) {
        this.handleValuationComplete();
      } else {
        const nextRound = Valuation.setupRound();
        this.renderValuationRound(nextRound);
      }
    }, 2500); // Show reveal for 2.5 seconds
  },

  /**
   * Handle valuation game completion
   */
  handleValuationComplete() {
    const results = Valuation.getResults();
    const isNewRecord = HighScores.save('valuation', results.mode, results.score);

    UI.showValuationResults({
      ...results,
      isNewRecord
    });
  }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
