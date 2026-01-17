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
    guessMenuScreen: null,
    guessGameScreen: null,
    guessResultsScreen: null,
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
    this.elements.guessMenuScreen = document.getElementById('guess-menu-screen');
    this.elements.guessGameScreen = document.getElementById('guess-game-screen');
    this.elements.guessResultsScreen = document.getElementById('guess-results-screen');
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
      'valuationMenuScreen', 'valuationGameScreen', 'valuationResultsScreen',
      'guessMenuScreen', 'guessGameScreen', 'guessResultsScreen'
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
      case 'guess-menu':
        this.elements.guessMenuScreen.classList.add('active');
        break;
      case 'guess-game':
        this.elements.guessGameScreen.classList.add('active');
        break;
      case 'guess-results':
        this.elements.guessResultsScreen.classList.add('active');
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
  },

  // ===== GUESS GAME METHODS =====

  /**
   * Render a new round for the guess game
   * @param {Object} roundData - Round data with card and blur amount
   */
  renderGuessRound(roundData) {
    const { card, round, blurAmount, attemptsRemaining } = roundData;

    const cardImage = document.getElementById('guess-card-image');

    // Hide image during transition to prevent flash
    cardImage.style.opacity = '0';

    // Remove revealed class and set blur BEFORE loading image
    cardImage.classList.remove('revealed');
    cardImage.style.filter = `blur(${blurAmount}px)`;

    const newImageSrc = `images/cards/${card.imageFile}`;

    // If it's the same image, just show it
    if (cardImage.src.endsWith(card.imageFile)) {
      cardImage.style.opacity = '1';
    } else {
      // Preload the image completely before swapping src
      const preloadImg = new Image();
      preloadImg.onload = () => {
        // Image is fully loaded in memory, now swap it
        cardImage.src = newImageSrc;
        cardImage.alt = 'Baseball card';

        // Use requestAnimationFrame to ensure blur is rendered before showing
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            cardImage.style.opacity = '1';
          });
        });
      };
      preloadImg.src = newImageSrc;
    }

    // Update counters
    this.updateGuessCounters(round, Guess.state.totalPoints);

    // Reset attempts indicator
    this.updateAttemptsIndicator(attemptsRemaining);

    // Clear input fields
    document.getElementById('year-input').value = '';
    document.getElementById('player-name-input').value = '';

    // Clear and hide feedback
    const feedback = document.getElementById('guess-feedback');
    feedback.style.display = 'none';
    feedback.textContent = '';
    feedback.className = 'guess-feedback';

    // Focus on year input
    setTimeout(() => {
      document.getElementById('year-input').focus();
    }, 100);
  },

  /**
   * Update round and points counters
   * @param {number} round - Current round (1-5)
   * @param {number} points - Total points
   */
  updateGuessCounters(round, points) {
    document.getElementById('guess-round-counter').textContent = `${round}/5`;
    document.getElementById('guess-points-counter').textContent = points;
  },

  /**
   * Update attempts indicator dots
   * @param {number} remaining - Attempts remaining (0-3)
   */
  updateAttemptsIndicator(remaining) {
    const dots = document.querySelectorAll('.attempt-dot');
    dots.forEach((dot, index) => {
      if (index < remaining) {
        dot.classList.add('active');
        dot.classList.remove('used');
      } else {
        dot.classList.remove('active');
        dot.classList.add('used');
      }
    });
  },

  /**
   * Update card blur amount
   * @param {number} blurAmount - Blur amount in pixels
   */
  updateCardBlur(blurAmount) {
    const cardImage = document.getElementById('guess-card-image');
    cardImage.style.filter = `blur(${blurAmount}px)`;
  },

  /**
   * Reveal card (remove blur)
   */
  revealCard() {
    const cardImage = document.getElementById('guess-card-image');
    cardImage.style.filter = 'blur(0px)';
    cardImage.classList.add('revealed');
  },

  /**
   * Show guess feedback message
   * @param {Object} result - Guess result
   */
  showGuessFeedback(result) {
    const feedback = document.getElementById('guess-feedback');
    const {
      nameMatch,
      yearMatch,
      nameCorrect,
      yearCorrect,
      namePointsThisAttempt,
      yearPointsThisAttempt,
      attemptsRemaining,
      correctAnswer,
      isRoundOver
    } = result;

    feedback.style.display = 'block';

    // Both correct this attempt
    if (nameMatch && yearMatch) {
      const totalPts = namePointsThisAttempt + yearPointsThisAttempt;
      feedback.className = 'guess-feedback correct';
      feedback.innerHTML = `
        <strong>✓ Both Correct!</strong><br>
        +${totalPts} point${totalPts !== 1 ? 's' : ''} (Name: ${namePointsThisAttempt}, Year: ${yearPointsThisAttempt})
      `;
    }
    // Name only correct this attempt
    else if (nameMatch && !yearMatch) {
      feedback.className = 'guess-feedback partial';
      feedback.innerHTML = `
        <strong>✓ Name Correct!</strong><br>
        +${namePointsThisAttempt} point${namePointsThisAttempt !== 1 ? 's' : ''} - Now get the year!
      `;
    }
    // Year only correct this attempt
    else if (!nameMatch && yearMatch) {
      feedback.className = 'guess-feedback partial';
      feedback.innerHTML = `
        <strong>✓ Year Correct!</strong><br>
        +${yearPointsThisAttempt} point${yearPointsThisAttempt !== 1 ? 's' : ''} - Now get the name!
      `;
    }
    // Round over (out of attempts)
    else if (isRoundOver) {
      feedback.className = 'guess-feedback incorrect';
      const missing = [];
      if (!nameCorrect) missing.push('Name');
      if (!yearCorrect) missing.push('Year');
      feedback.innerHTML = `
        <strong>✗ Out of attempts</strong><br>
        Answer: ${correctAnswer.playerName} (${correctAnswer.year})
      `;
    }
    // Already have name, need year
    else if (nameCorrect && !yearCorrect) {
      feedback.className = 'guess-feedback incorrect';
      feedback.innerHTML = `
        <strong>✗ Wrong year</strong><br>
        ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining
      `;
    }
    // Already have year, need name
    else if (yearCorrect && !nameCorrect) {
      feedback.className = 'guess-feedback incorrect';
      feedback.innerHTML = `
        <strong>✗ Wrong name</strong><br>
        ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining
      `;
    }
    // Both wrong
    else {
      feedback.className = 'guess-feedback incorrect';
      feedback.innerHTML = `
        <strong>✗ Both incorrect</strong><br>
        ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining
      `;
    }
  },

  /**
   * Show guess results screen
   * @param {Object} data - Results data
   */
  showGuessResults(data) {
    const { totalPoints, maxPoints, roundHistory, isNewRecord } = data;

    // Update trophy based on score (out of 30)
    const trophy = document.getElementById('guess-trophy');
    if (totalPoints >= 26) {
      trophy.textContent = '🏆';
    } else if (totalPoints >= 20) {
      trophy.textContent = '🥈';
    } else if (totalPoints >= 14) {
      trophy.textContent = '🥉';
    } else {
      trophy.textContent = '🎯';
    }

    // Update score
    document.getElementById('guess-final-score').textContent = `${totalPoints}/${maxPoints}`;

    // Show/hide new record badge
    const newRecordBadge = document.getElementById('guess-new-record');
    newRecordBadge.style.display = isNewRecord ? 'block' : 'none';

    // Populate round summary
    const summaryList = document.getElementById('guess-round-summary-list');
    summaryList.innerHTML = '';

    roundHistory.forEach(round => {
      const roundDiv = document.createElement('div');
      const bothCorrect = round.nameCorrect && round.yearCorrect;
      const someCorrect = round.nameCorrect || round.yearCorrect;
      roundDiv.className = `round-summary-item ${bothCorrect ? 'correct' : someCorrect ? 'partial' : 'incorrect'}`;

      const roundLabel = document.createElement('div');
      roundLabel.className = 'round-label';

      // Build status text with breakdown
      let status;
      if (round.totalPointsEarned > 0) {
        const breakdown = `Name: ${round.namePointsEarned}, Year: ${round.yearPointsEarned}`;
        status = `${bothCorrect ? '✓' : '◐'} +${round.totalPointsEarned} pts (${breakdown})`;
      } else {
        status = '✗ 0 points';
      }
      roundLabel.textContent = `Round ${round.round}: ${status}`;

      const cardInfo = document.createElement('div');
      cardInfo.className = 'round-cards';
      cardInfo.textContent = `${round.card.playerName} (${round.card.year})`;

      roundDiv.appendChild(roundLabel);
      roundDiv.appendChild(cardInfo);
      summaryList.appendChild(roundDiv);
    });

    this.showScreen('guess-results');
  },

  /**
   * Update guess high scores display on menu
   */
  updateGuessHighScores() {
    const score = HighScores.get('guess');
    const element = document.getElementById('high-score-guess');
    if (element) {
      element.textContent = score ? `${score}/30` : '--';
    }
  }
};
