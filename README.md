# Vintage Baseball Card Games

A mobile-first game platform featuring the 30 most valuable baseball cards of all time. Test your memory, valuation knowledge, and card identification skills with three unique game modes. Learn about baseball history with iconic cards including the legendary T206 Honus Wagner, Mickey Mantle's 1952 Topps rookie, and more.

![Game Preview](https://img.shields.io/badge/Status-Complete-success)
![Technology](https://img.shields.io/badge/Tech-Vanilla%20JS-yellow)
![Mobile First](https://img.shields.io/badge/Design-Mobile%20First-blue)

## Game Modes

### 1. Matching Game 🃏
Classic memory matching with three difficulty levels:
- **Easy**: 10 cards (20 tiles)
- **Medium**: 20 cards (40 tiles)
- **Expert**: 30 cards (60 tiles)
- **Turn-Based Scoring** - Lower scores are better!

### 2. Valuation Game 💰
Test your knowledge of card values with three modes:
- **3-Card Sort**: Order 3 cards from most to least valuable (5 rounds)
- **2-Card Pick**: Choose the more valuable card (5 rounds)
- **Value Guess**: Multiple choice valuation quiz (5 rounds)

### 3. Guess the Card 🎯
Identify blurred baseball cards:
- **5 rounds** per game, 3 attempts per card
- Progressive blur reduction (20px → 10px → 5px → 0px)
- **Partial scoring**: Name and year scored independently
  - 3 points for 1st attempt, 2 points for 2nd, 1 point for 3rd
  - Maximum 30 points per game (6 points per round)
- Fuzzy name matching accepts variations

## Features

- **High Score Tracking** - Persistent high scores for all game modes using localStorage

- **Smooth Animations** - CSS 3D card flip effects with match celebration animations

- **Responsive Design** - Optimized for mobile, tablet, and desktop with adaptive grid layouts

- **Educational Content** - Click on matched cards to learn about each card's history, value, and significance

- **30 Authentic Cards** - Features real vintage baseball cards including:
  - 1909 T206 Honus Wagner ($8M)
  - 1952 Topps Mickey Mantle ($13M+)
  - 1914 Baltimore News Babe Ruth ($12M)
  - And 27 more legendary cards

## Technologies Used

- **Vanilla JavaScript** - No frameworks, just pure JS for maximum performance
- **CSS3** - 3D transforms, flexbox, and CSS Grid
- **HTML5** - Semantic markup
- **SVG** - Custom vintage card back design
- **LocalStorage API** - Persistent high score tracking

## Project Structure

```
baseballcard-matching/
├── index.html              # Main HTML file with all game screens
├── css/
│   └── styles.css          # All styles (reset, layout, animations, responsive)
├── js/
│   ├── app.js              # Application controller for all games
│   ├── cards.js            # Card data management
│   ├── game.js             # Matching game logic and high scores
│   ├── valuation.js        # Valuation game module
│   ├── guess.js            # Guess the Card game module
│   └── ui.js               # DOM manipulation and rendering
├── data/
│   └── cards.json          # Card metadata (30 cards)
├── images/
│   ├── cards/              # 30 card front images
│   └── card-back.svg       # Vintage card back design
├── README.md
└── CLAUDE.md               # Developer guidance for Claude Code
```

## How to Run

### Option 1: Simple HTTP Server (Python)

```bash
cd baseballcard-matching
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

### Option 2: Node.js HTTP Server

```bash
cd baseballcard-matching
npx http-server -p 8080
```

### Option 3: Any Static Server

Since this is a static site with no build step, you can use any static file server or simply open `index.html` directly in your browser (note: direct file opening may have CORS issues with loading the JSON data).

## How to Play

### Matching Game
1. **Select Difficulty** - Choose Easy, Medium, or Expert mode
2. **Click Cards** - Click any card to flip it over and reveal the baseball card
3. **Find Matches** - Click a second card to find its matching pair
4. **Match All Pairs** - Continue until all cards are matched
5. **Check Your Score** - Your score is the number of turns taken (lower is better!)

### Valuation Game
1. **Select Mode** - Choose 3-Card Sort, 2-Card Pick, or Value Guess
2. **Compare Cards** - View card images and details
3. **Make Your Choice** - Sort, pick, or select the correct value
4. **Complete 5 Rounds** - Each correct answer earns 1 point
5. **Check Your Score** - Maximum 5 points per game

### Guess the Card
1. **Start Game** - Begin a 5-round identification challenge
2. **View Blurred Card** - See a heavily blurred baseball card image
3. **Enter Guess** - Type the year and player name
4. **Get Feedback** - Partial credit for correct name or year
5. **Progressive Clarity** - Blur reduces after each wrong guess
6. **Check Your Score** - Maximum 30 points (6 per round)

## Game Controls

- **Menu Button** - Return to main menu (progress will be lost)
- **Restart Button** - Start over with the same difficulty
- **Play Again** - Quick restart after winning
- **Change Difficulty** - Return to menu and select a new difficulty

## Responsive Design

The game adapts to different screen sizes:

- **Mobile (< 480px)**: Optimized grid with smaller cards
- **Tablet (768px+)**: Larger cards with more columns
- **Desktop (1024px+)**: Maximum card size with centered layout
- **Landscape Mode**: Optimized grid for horizontal orientation

## Card Data

All card data is sourced from [AllVintageCards.com](https://allvintagecards.com/most-valuable-baseball-cards/) and includes:

- Player name
- Year and card set
- Card grade (PSA/SGC)
- Estimated value
- Historical significance
- Team and position

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- **Image lazy loading** - Cards load as needed
- **CSS transforms** - Hardware-accelerated animations
- **Event delegation** - Efficient click handling
- **No dependencies** - Fast initial load (~50KB excluding images)
- **Image preloading** - Card images preload during menu screen

## Future Enhancements

Potential features for future versions:

- [ ] Sound effects for card flips and matches
- [ ] Timed mode (race against the clock)
- [ ] Multiplayer mode (local or online)
- [ ] Card collection achievements
- [ ] Difficulty modifiers (fewer cards shown, time pressure)
- [ ] Share scores on social media

## Credits

- **Card Data**: [AllVintageCards.com](https://allvintagecards.com/)
- **Card Images**: [AllVintageCards.com](https://allvintagecards.com/)
- **Fonts**: Google Fonts (Playfair Display, Open Sans)
- **Development**: Built with Claude Code

## License

This project is for educational and entertainment purposes. Card images and data are property of their respective owners. No commercial use intended.

---

**Enjoy the game and test your baseball card knowledge!** ⚾
