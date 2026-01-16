# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A vanilla JavaScript memory matching game featuring vintage baseball cards. The project is a static site with no build process or dependencies - all code runs directly in the browser.

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

The codebase uses a modular pattern with four main JavaScript modules, loaded in order:

1. **cards.js** - Card data management (loading, selecting, shuffling)
2. **game.js** - Game state machine and high score persistence
3. **ui.js** - DOM manipulation and rendering
4. **app.js** - Application controller that coordinates the modules

Each module uses the singleton object pattern (e.g., `const Cards = {...}`) with no external dependencies or build tools.

### State Flow

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

### Key Concepts

**Card vs Tile**: Each card appears twice in the game board (to create matching pairs). A "card" has an `id` (e.g., "wagner-1909-t206"), while each instance on the board is a "tile" with a unique `tileId` (e.g., "wagner-1909-t206-a" and "wagner-1909-t206-b").

**Game State Locking**: `Game.state.isLocked` prevents clicks during mismatch animations. When two cards don't match, the board locks, cards flip back after 1000ms, then `unlock()` is called to reset state.

**Score Persistence**: `HighScores` uses localStorage with key `baseballCardGame_highScores`. Stores an object like `{ "10": 15, "20": 32, "30": 58 }` where keys are card counts and values are best turn counts (lower is better).

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

Three screens managed by `UI.showScreen()`:
- **menu-screen**: Difficulty selection, high scores display
- **game-screen**: Active game board with turn counter
- **victory-screen**: Results, matched cards list, card info modal

Only one screen has the `.active` class at a time.

### CSS Grid Layout

The game board uses CSS Grid with adaptive columns based on card count:
- Easy (20 tiles): 4-5 columns depending on viewport
- Medium (40 tiles): 5-8 columns
- Expert (60 tiles): 6-10 columns

Grid configuration is controlled via `board.setAttribute('data-cards', cards.length)` which applies different CSS Grid templates.

## Testing Changes

Since there's no test suite, manually verify:
1. All three difficulty levels render correctly
2. Card flipping animations work smoothly
3. Match detection is accurate
4. Victory screen displays all matched cards
5. High scores persist across page refreshes
6. Responsive layout works on mobile/tablet/desktop

## Common Modifications

**Adding new cards**: Add entry to `data/cards.json` and place image in `images/cards/`. Card images should maintain consistent aspect ratio with existing cards.

**Adjusting difficulty**: Modify difficulty button `data-cards` attributes in `index.html` (lines 22-36).

**Changing animation timing**:
- Card flip duration: `css/styles.css` (`.card-inner` transition)
- Mismatch flip-back delay: `app.js:157` (1000ms timeout)
- Victory screen delay: `app.js:147` (800ms timeout)

**localStorage key**: Change `HighScores.storageKey` in `game.js:176` if conflicts occur.
