/**
 * UI Manager
 * Handles DOM manipulation, rendering, and screen transitions
 */
const UI = {
  elements: {
    gameSelectorScreen: null,
    menuScreen: null,
    gameScreen: null,
    victoryScreen: null,
    valuationMenuScreen: null,
    valuationGameScreen: null,
    valuationResultsScreen: null,
    gameBoard: null,
    turnCounter: null,
    modalOverlay: null
  },

  /**
   * Initialize UI elements
   */
  init() {
    this.elements.gameSelectorScreen = document.getElementById('game-selector-screen');
    this.elements.menuScreen = document.getElementById('menu-screen');
    this.elements.gameScreen = document.getElementById('game-screen');
    this.elements.victoryScreen = document.getElementById('victory-screen');
    this.elements.valuationMenuScreen = document.getElementById('valuation-menu-screen');
    this.elements.valuationGameScreen = document.getElementById('valuation-game-screen');
    this.elements.valuationResultsScreen = document.getElementById('valuation-results-screen');
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
    const screens = [
      'gameSelectorScreen', 'menuScreen', 'gameScreen', 'victoryScreen',
      'valuationMenuScreen', 'valuationGameScreen', 'valuationResultsScreen'
    ];
    screens.forEach(screen => {
      if (this.elements[screen]) {
        this.elements[screen].classList.remove('active');
      }
    });

    // Show target screen
    switch (screenId) {
      case 'game-selector':
        this.elements.gameSelectorScreen.classList.add('active');
        break;
      case 'menu':
        this.elements.menuScreen.classList.add('active');
        break;
      case 'game':
        this.elements.gameScreen.classList.add('active');
        break;
      case 'victory':
        this.elements.victoryScreen.classList.add('active');
        break;
      case 'valuation-menu':
        this.elements.valuationMenuScreen.classList.add('active');
        break;
      case 'valuation-game':
        this.elements.valuationGameScreen.classList.add('active');
        break;
      case 'valuation-results':
        this.elements.valuationResultsScreen.classList.add('active');
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
  },

  // ===== VALUATION GAME METHODS =====

  /**
   * Create a valuation card element
   * @param {Object} card - Card data
   * @param {boolean} showName - Whether to show card name
   * @returns {HTMLElement} Card element
   */
  createValuationCard(card, showName = true) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'valuation-card';
    cardDiv.dataset.cardId = card.id;

    const img = document.createElement('img');
    img.src = `images/cards/${card.imageFile}`;
    img.alt = Cards.formatCardNamePlain(card);

    cardDiv.appendChild(img);

    if (showName) {
      const nameLabel = document.createElement('div');
      nameLabel.className = 'card-name-label';
      nameLabel.innerHTML = Cards.formatCardName(card);
      cardDiv.appendChild(nameLabel);
    }

    return cardDiv;
  },

  /**
   * Render 3-card mode
   * @param {Array} cards - Cards for the round
   */
  renderThreeCardMode(cards) {
    const showNames = document.getElementById('show-names-toggle')?.checked ?? true;
    const selectionArea = document.getElementById('card-selection-area');
    selectionArea.innerHTML = '';

    cards.forEach(card => {
      const cardEl = this.createValuationCard(card, showNames);
      cardEl.classList.add('selectable-card');
      cardEl.addEventListener('click', () => {
        // Will be handled by app.js
        const event = new CustomEvent('cardSelected', { detail: { cardId: card.id } });
        document.dispatchEvent(event);
      });
      selectionArea.appendChild(cardEl);
    });

    // Clear position slots
    document.querySelectorAll('.position-slot .slot-content').forEach(slot => {
      slot.innerHTML = '';
    });
  },

  /**
   * Render 2-card mode
   * @param {Array} cards - Two cards for the round
   */
  renderTwoCardMode(cards) {
    const showNames = document.getElementById('show-names-toggle')?.checked ?? true;
    const twoCardArea = document.getElementById('two-card-area');
    twoCardArea.innerHTML = '';

    cards.forEach(card => {
      const cardEl = this.createValuationCard(card, showNames);
      cardEl.classList.add('selectable-card', 'two-card-choice');
      cardEl.addEventListener('click', () => {
        const event = new CustomEvent('twoCardSelected', { detail: { cardId: card.id } });
        document.dispatchEvent(event);
      });
      twoCardArea.appendChild(cardEl);
    });
  },

  /**
   * Render 1-card mode
   * @param {Object} card - Card to display
   * @param {Array} options - Value options
   */
  renderOneCardMode(card, options) {
    const showNames = document.getElementById('show-names-toggle')?.checked ?? true;
    const singleCardArea = document.getElementById('single-card-area');
    singleCardArea.innerHTML = '';

    const cardEl = this.createValuationCard(card, showNames);
    cardEl.classList.add('display-card');
    singleCardArea.appendChild(cardEl);

    // Render value options
    const valueOptions = document.getElementById('value-options');
    valueOptions.innerHTML = '';

    options.forEach(value => {
      const btn = document.createElement('button');
      btn.className = 'value-option-btn';
      btn.textContent = value;
      btn.addEventListener('click', () => {
        const event = new CustomEvent('valueSelected', { detail: { value } });
        document.dispatchEvent(event);
      });
      valueOptions.appendChild(btn);
    });
  },

  /**
   * Update valuation counters
   * @param {number} round - Current round (1-5)
   * @param {number} correct - Number correct
   */
  updateValuationCounters(round, correct) {
    document.getElementById('round-counter').textContent = `${round}/5`;
    document.getElementById('correct-counter').textContent = correct;
  },

  /**
   * Show answer reveal for valuation
   * @param {Object} result - Result with isCorrect, correctAnswer, cards
   */
  showAnswerReveal(result) {
    const { isCorrect, correctAnswer, cards } = result;

    // Add visual feedback based on mode
    if (result.cards.length === 3) {
      // 3-card mode
      this.reveal3CardAnswer(result);
    } else if (result.cards.length === 2) {
      // 2-card mode
      this.reveal2CardAnswer(result);
    } else {
      // 1-card mode
      this.reveal1CardAnswer(result);
    }
  },

  /**
   * Reveal 3-card answer
   */
  reveal3CardAnswer(result) {
    const { isCorrect, correctAnswer, cards } = result;
    const sortedCards = Cards.sortByValue(cards, true);

    // Show correct/incorrect on slots
    document.querySelectorAll('.position-slot').forEach((slot, index) => {
      const slotCard = slot.querySelector('.valuation-card');
      if (slotCard) {
        const cardId = slotCard.dataset.cardId;
        const isCorrectPosition = correctAnswer[index] === cardId;
        slotCard.classList.add(isCorrectPosition ? 'answer-correct' : 'answer-incorrect');

        // Add value reveal
        const card = cards.find(c => c.id === cardId);
        const valueReveal = document.createElement('div');
        valueReveal.className = 'value-reveal';
        valueReveal.textContent = card.estimatedValue;
        slotCard.appendChild(valueReveal);
      }
    });
  },

  /**
   * Reveal 2-card answer
   */
  reveal2CardAnswer(result) {
    const { isCorrect, correctAnswer, cards } = result;

    document.querySelectorAll('.two-card-choice').forEach(cardEl => {
      const cardId = cardEl.dataset.cardId;
      const card = cards.find(c => c.id === cardId);

      // Show which was correct
      if (cardId === correctAnswer) {
        cardEl.classList.add('answer-correct');
      } else {
        cardEl.classList.add('answer-incorrect');
      }

      // Add value reveal
      const valueReveal = document.createElement('div');
      valueReveal.className = 'value-reveal';
      valueReveal.textContent = card.estimatedValue;
      cardEl.appendChild(valueReveal);
    });
  },

  /**
   * Reveal 1-card answer
   */
  reveal1CardAnswer(result) {
    const { isCorrect, correctAnswer } = result;

    document.querySelectorAll('.value-option-btn').forEach(btn => {
      const value = btn.textContent;

      if (value === correctAnswer) {
        btn.classList.add('answer-correct');
      } else {
        btn.classList.add('answer-incorrect');
      }
    });
  },

  /**
   * Show valuation results screen
   * @param {Object} data - Results data
   */
  showValuationResults(data) {
    const { mode, score, total, roundHistory, isNewRecord } = data;

    // Update score
    document.getElementById('valuation-final-score').textContent = `${score}/${total}`;

    // Show/hide new record badge
    const newRecordBadge = document.getElementById('valuation-new-record');
    newRecordBadge.style.display = isNewRecord ? 'block' : 'none';

    // Populate round summary
    const summaryList = document.getElementById('round-summary-list');
    summaryList.innerHTML = '';

    roundHistory.forEach(round => {
      const roundDiv = document.createElement('div');
      roundDiv.className = `round-summary-item ${round.isCorrect ? 'correct' : 'incorrect'}`;

      const roundLabel = document.createElement('div');
      roundLabel.className = 'round-label';
      roundLabel.textContent = `Round ${round.round}: ${round.isCorrect ? '✓ Correct' : '✗ Incorrect'}`;

      const cardsInfo = document.createElement('div');
      cardsInfo.className = 'round-cards';
      round.cards.forEach(card => {
        const cardSpan = document.createElement('span');
        cardSpan.textContent = `${Cards.formatCardNamePlain(card)} - ${card.estimatedValue}`;
        cardsInfo.appendChild(cardSpan);
      });

      roundDiv.appendChild(roundLabel);
      roundDiv.appendChild(cardsInfo);
      summaryList.appendChild(roundDiv);
    });

    this.showScreen('valuation-results');
  },

  /**
   * Update valuation high scores display
   */
  updateValuationHighScores() {
    ['3-card', '2-card', '1-card'].forEach(mode => {
      const score = HighScores.get('valuation', mode);
      const element = document.getElementById(`high-score-${mode}`);
      if (element) {
        element.textContent = score ? `${score}/5` : '--';
      }
    });
  },

  /**
   * Toggle card name visibility
   */
  toggleCardNames(showNames) {
    document.querySelectorAll('.card-name-label').forEach(label => {
      label.style.display = showNames ? 'block' : 'none';
    });
  }
};
