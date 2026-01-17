# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A vanilla JavaScript multi-game platform featuring vintage baseball cards. The project includes three distinct game modes: Matching (memory game), Valuation (card value comparison), and Guess the Card (identify blurred cards). The project is a static site with no build process or dependencies - all code runs directly in the browser.

## Running the Application

Since this is a static site, start any HTTP server in the project root:

```bash
# Python
python3 -m http.server 8080

# Node.js
npx http-server -p 8080
```

Then navigate to http://localhost:8080

**Important**: Opening `index.html` directly in a browser may fail due to CORS restrictions when loading `data/cards.json`.

## Architecture

### Module Organization

The codebase uses a modular pattern with six main JavaScript modules, loaded in order:

1. **cards.js** - Card data management (loading, selecting, shuffling)
2. **game.js** - Matching game state machine and high score persistence
3. **valuation.js** - Valuation game module (3-card sort, 2-card pick, 1-card guess)
4. **guess.js** - Guess the Card game module (identify blurred cards with partial scoring)
5. **ui.js** - DOM manipulation and rendering for all game modes
6. **app.js** - Application controller that coordinates all modules

Each module uses the singleton object pattern (e.g., `const Cards = {...}`) with no external dependencies or build tools.

### State Flow

#### Matching Game
```
App.startGame(cardCount)
  → Game.init(cardCount) - selects & shuffles cards
  → Cards.selectRandom(count) - picks subset from 30 cards
  → Cards.prepareGameDeck() - doubles & shuffles
  → UI.renderBoard(cards) - creates DOM elements
  → User clicks card
  → App.handleCardClick(tileId)
  → Game.flipCard(tileId) - updates game state
  → Returns result: { action: 'match' | 'mismatch' | 'flipped' }
  → UI responds based on action (flip animation, mark matched, etc.)
```

#### Valuation Game
```
App.startValuationGame(mode)
  → Valuation.init(mode) - initialize 5 rounds
  → Valuation.setupRound() - select random cards
  → UI renders cards based on mode
  → User makes selection
  → Valuation.submitAnswer() - validate and score
  → Repeat for 5 rounds
  → Show results screen
```

#### Guess the Card Game
```
App.startGuessGame()
  → Guess.init() - initialize 5 rounds
  → Guess.setupRound() - select random unused card
  → UI.renderGuessRound() - show blurred card (20px)
  → User enters year and name
  → Guess.submitGuess(name, year) - validate with partial scoring
    - Name correct? Award 3/2/1 points based on attempt
    - Year correct? Award 3/2/1 points based on attempt
    - Both wrong? Reduce blur (10px → 5px → 0px)
  → Repeat until both correct OR 3 attempts used
  → Continue for 5 rounds (max 30 points)
  → Show results screen
```

### Key Concepts

**Card vs Tile**: Each card appears twice in the game board (to create matching pairs). A "card" has an `id` (e.g., "wagner-1909-t206"), while each instance on the board is a "tile" with a unique `tileId` (e.g., "wagner-1909-t206-a" and "wagner-1909-t206-b").

**Game State Locking**: `Game.state.isLocked` prevents clicks during mismatch animations. When two cards don't match, the board locks, cards flip back after 1000ms, then `unlock()` is called to reset state.

**Partial Scoring in Guess Game**: The Guess game tracks name and year correctness independently. Each component can earn 3/2/1 points based on which attempt it's answered correctly (1st/2nd/3rd). This allows players to get partial credit - for example, guessing the correct name but wrong year on the first attempt earns 3 points, then getting the year on the second attempt earns 2 more points, for a total of 5 points that round. Maximum per round is 6 points (both correct on first attempt).

**Fuzzy Name Matching**: The Guess game accepts various name formats - full name ("Honus Wagner"), last name only ("Wagner"), or any multi-word input where the last name matches ("Ed Plank" matches "Eddie Plank").

**Score Persistence**: `HighScores` uses localStorage with key `baseballCardGame_highScores`. Stores an object with scores for all game modes:
```javascript
{
  matching: { "10": 15, "20": 32, "30": 58 },  // lower is better
  valuation: { "3-card": 4, "2-card": 5, "1-card": 3 },  // higher is better (max 5)
  guess: 24  // higher is better (max 30)
}
```

### Data Structure

`data/cards.json` contains 30 card objects with this structure:

```json
{
  "id": "wagner-1909-t206",
  "playerName": "Honus Wagner",
  "year": 1909,
  "cardSet": "T206",
  "grade": "SGC 2",
  "estimatedValue": "$8,000,000",
  "imageFile": "wagner-1909-t206.png",
  "description": "...",
  "team": "Pittsburgh Pirates",
  "position": "Shortstop"
}
```

Card images are stored in `images/cards/` and must match the `imageFile` field.

### Screen Management

Multiple screens managed by `UI.showScreen()`:
- **game-selector-screen**: Main menu to choose between three game modes
- **menu-screen**: Matching game difficulty selection
- **game-screen**: Active matching game board with turn counter
- **victory-screen**: Matching game results
- **valuation-menu-screen**: Valuation mode selection
- **valuation-game-screen**: Active valuation game
- **valuation-results-screen**: Valuation game results
- **guess-menu-screen**: Guess the Card game info and high score
- **guess-game-screen**: Active guess game with blurred card
- **guess-results-screen**: Guess game results with point breakdown

Only one screen has the `.active` class at a time.

### CSS Grid Layout

The game board uses CSS Grid with adaptive columns based on card count:
- Easy (20 tiles): 4-5 columns depending on viewport
- Medium (40 tiles): 5-8 columns
- Expert (60 tiles): 6-10 columns

Grid configuration is controlled via `board.setAttribute('data-cards', cards.length)` which applies different CSS Grid templates.

## Testing Changes

Since there's no test suite, manually verify:

**Matching Game:**
1. All three difficulty levels render correctly
2. Card flipping animations work smoothly
3. Match detection is accurate
4. Victory screen displays all matched cards
5. High scores persist (lower is better)

**Valuation Game:**
1. All three modes work (3-card, 2-card, 1-card)
2. Card sorting/picking is functional
3. Value comparisons are accurate
4. High scores persist (higher is better, max 5)

**Guess Game:**
1. Card images blur correctly (20px → 10px → 5px → 0px)
2. Partial scoring works (name and year independent)
3. Fuzzy name matching accepts variations
4. Blur reduces after wrong guesses
5. High scores persist (higher is better, max 30)
6. Image preloading prevents unblurred flash

**General:**
1. Navigation between game modes works
2. Responsive layout works on mobile/tablet/desktop
3. All high scores persist across page refreshes

## Common Modifications

**Adding new cards**: Add entry to `data/cards.json` and place image in `images/cards/`. Card images should maintain consistent aspect ratio with existing cards.

**Adjusting difficulty**: Modify difficulty button `data-cards` attributes in `index.html` (lines 22-36).

**Changing animation timing**:
- Card flip duration: `css/styles.css` (`.card-inner` transition)
- Mismatch flip-back delay: `app.js:157` (1000ms timeout)
- Victory screen delay: `app.js:147` (800ms timeout)

**localStorage key**: Change `HighScores.storageKey` in `game.js:176` if conflicts occur.
