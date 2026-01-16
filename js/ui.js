/**
 * UI Manager
 * Handles DOM manipulation, rendering, and screen transitions
 */
const UI = {
  elements: {
    menuScreen: null,
    gameScreen: null,
    victoryScreen: null,
    gameBoard: null,
    turnCounter: null,
    modalOverlay: null
  },

  /**
   * Initialize UI elements
   */
  init() {
    this.elements.menuScreen = document.getElementById('menu-screen');
    this.elements.gameScreen = document.getElementById('game-screen');
    this.elements.victoryScreen = document.getElementById('victory-screen');
    this.elements.gameBoard = document.getElementById('game-board');
    this.elements.turnCounter = document.getElementById('turn-counter');
    this.elements.modalOverlay = document.getElementById('card-info-modal');
  },

  /**
   * Show a specific screen
   * @param {string} screenId - Screen to show ('menu', 'game', 'victory')
   */
  showScreen(screenId) {
    // Hide all screens
    this.elements.menuScreen.classList.remove('active');
    this.elements.gameScreen.classList.remove('active');
    this.elements.victoryScreen.classList.remove('active');

    // Show target screen
    switch (screenId) {
      case 'menu':
        this.elements.menuScreen.classList.add('active');
        break;
      case 'game':
        this.elements.gameScreen.classList.add('active');
        break;
      case 'victory':
        this.elements.victoryScreen.classList.add('active');
        break;
    }
  },

  /**
   * Render the game board with cards
   * @param {Array} cards - Cards to render
   */
  renderBoard(cards) {
    const board = this.elements.gameBoard;
    board.innerHTML = '';
    board.setAttribute('data-cards', cards.length);

    cards.forEach((card, index) => {
      const cardElement = this.createCardElement(card, index);
      board.appendChild(cardElement);
    });
  },

  /**
   * Create a single card element
   * @param {Object} card - Card data
   * @param {number} index - Card index
   * @returns {HTMLElement} Card element
   */
  createCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.dataset.tileId = card.tileId;
    cardDiv.dataset.cardId = card.id;

    cardDiv.innerHTML = `
      <div class="card-inner">
        <div class="card-back"></div>
        <div class="card-front">
          <img src="images/cards/${card.imageFile}"
               alt="${card.playerName} ${card.year} ${card.cardSet}"
               loading="lazy">
        </div>
      </div>
    `;

    // Add staggered entrance animation
    cardDiv.style.animationDelay = `${index * 20}ms`;

    return cardDiv;
  },

  /**
   * Flip a card
   * @param {string} tileId - Tile to flip
   */
  flipCard(tileId) {
    const card = document.querySelector(`[data-tile-id="${tileId}"]`);
    if (card) {
      card.classList.add('flipped');
    }
  },

  /**
   * Unflip cards
   * @param {Array} tileIds - Tiles to unflip
   */
  unflipCards(tileIds) {
    tileIds.forEach(tileId => {
      const card = document.querySelector(`[data-tile-id="${tileId}"]`);
      if (card) {
        card.classList.remove('flipped');
      }
    });
  },

  /**
   * Mark cards as matched
   * @param {Array} tileIds - Tiles to mark as matched
   */
  markMatched(tileIds) {
    tileIds.forEach(tileId => {
      const card = document.querySelector(`[data-tile-id="${tileId}"]`);
      if (card) {
        card.classList.add('matched');
      }
    });
  },

  /**
   * Disable all cards during checking
   */
  disableBoard() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.add('disabled'));
  },

  /**
   * Enable all cards
   */
  enableBoard() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.remove('disabled'));
  },

  /**
   * Update turn counter display
   * @param {number} turns - Current turn count
   */
  updateTurns(turns) {
    this.elements.turnCounter.textContent = turns;
  },

  /**
   * Show victory screen with results
   * @param {Object} data - Victory data
   */
  showVictory(data) {
    const { turns, isNewRecord, matchedCards } = data;

    // Update score
    document.getElementById('final-score').textContent = turns;

    // Show/hide new record badge
    const newRecordBadge = document.getElementById('new-record');
    newRecordBadge.style.display = isNewRecord ? 'block' : 'none';

    // Populate matched cards list
    const matchedList = document.getElementById('matched-cards-list');
    matchedList.innerHTML = '';

    matchedCards.forEach(card => {
      const item = document.createElement('span');
      item.className = 'matched-card-item';
      item.textContent = `${card.playerName} (${card.year})`;
      item.dataset.cardId = card.id;
      matchedList.appendChild(item);
    });

    this.showScreen('victory');
  },

  /**
   * Update high scores display on menu
   */
  updateHighScores() {
    [10, 20, 30].forEach(count => {
      const score = HighScores.get(count);
      const element = document.getElementById(`high-score-${count}`);
      if (element) {
        element.textContent = score ? `${score} turns` : '--';
      }
    });
  },

  /**
   * Show mobile hint based on screen size
   */
  updateMobileHint() {
    const hint = document.getElementById('mobile-hint');
    const width = window.innerWidth;

    if (width < 480) {
      hint.textContent = 'Expert mode (60 tiles) works best in landscape orientation';
    } else if (width < 768) {
      hint.textContent = 'Rotate to landscape for the best Expert mode experience';
    } else {
      hint.textContent = '';
    }
  },

  /**
   * Show card info modal
   * @param {Object} card - Card to display
   */
  showCardModal(card) {
    document.getElementById('modal-card-image').src = `images/cards/${card.imageFile}`;
    document.getElementById('modal-player-name').textContent = card.playerName;
    document.getElementById('modal-card-set').textContent = `${card.year} ${card.cardSet}`;
    document.getElementById('modal-card-value').textContent = `Est. Value: ${card.estimatedValue}`;
    document.getElementById('modal-card-desc').textContent = card.description;

    this.elements.modalOverlay.classList.add('active');
  },

  /**
   * Hide card info modal
   */
  hideCardModal() {
    this.elements.modalOverlay.classList.remove('active');
  }
};
