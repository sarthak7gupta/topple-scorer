# Topple Scorer

A web application for tracking scores, board state, and events for the Topple board game. Features a dynamic 5x5 grid, supports 2-4 players, manages two-color mode, and offers real-time feedback with easy-to-use controls.

---

## 🚀 Quick Start

### Installation

1. **Install Node.js** (v18 or higher) from [nodejs.org](https://nodejs.org/)
2. **Install pnpm** (if not already installed):

   ```bash
   npm install -g pnpm
   ```

3. **Clone and install**:

   ```bash
   git clone <repository-url>
   cd topple-scorer
   pnpm install
   ```

4. **Start the game**:

   ```bash
   pnpm run dev
   ```

5. **Open your browser** to `http://localhost:5173`

---

## 🎮 How to Play

### What You Need

- TOPPLE Tower, Base and Stand
- TOPPLE Pieces (12 pieces per color)

### Objective

Score the most points by completing or adding to stacks or rows of playing pieces, while being careful not to topple any of the other pieces.

**Number of Players**: 2 to 4. Ages 6+ recommended.

### Preparation

1. Set up the TOPPLE Board on a flat surface by placing the stand into the base and balancing the TOPPLE tower on top of the stand.
2. Add players in the order they're sitting in a circle, assign them colors and give each player all the playing pieces (12 pieces) of that color. In case of 2 players, each player can choose 2 colors.
3. Determine the number of victory points you want to play for.
4. Press Start Game to begin.

### Initial Dice Roll

Press Roll Dice to roll the dice to determine the starting player. In case of a tie, we roll again. Highest roll goes first. Then play continues clockwise.

### During the Game

For each turn, roll dice by either pressing the Roll Dice button or by pressing the Space or Enter key. Then place a piece on the board by clicking on a valid placement location.

If any player causes a topple, mark it by clicking the Topple Occurred button. The last player to have placed a piece will lose 10 points, and their previous player will gain 3 points.

### Scoring

1. **Row Completion**: If you place a piece that completes a row of five pieces in any direction (horizontally, vertically or diagonally), you score 3 points for completing the row plus 1 point for each playing piece of your color that tops each other stack in *that* row, and not all other rows.

2. **Adding to Completed Row**: If you add a piece to a completed row of five, you score 1 point for each piece of your color that tops each stack in *that* row, and not all other rows.

3. **Tall Stack**: If you add a piece to a stack that already has three or more pieces high, you score 1 point for each piece of your color in *that* stack, and not any other stack.

4. **Multiple Scoring**: You can score multiple points if you place a piece that completes or adds to more than one row, or which stacks more than three high and completes or adds to a row. The piece that you play that is common to different rows or to a stack and a row, is counted for each row and/or stack.

### Remember

- Players cannot touch the TOPPLE board or any of the pieces already placed on the board.
- If you accidentally knock the board, or table, and cause a topple, whether or not it's your turn, you lose 10 points.
- Look for multiple scoring possibilities!

### Winning the Game

A round ends when a topple has occurred or when all the pieces have been played. If a topple has not occurred during a round, the pieces are removed from the board and the scoring and play continue.

Even if a player reaches the required number of points during a round, the game is not over until all the pieces have been played or a topple has occurred. If more than one player reaches the required number of points at that time, the player with the highest total points wins.

### Game Controls

- <kbd>Space</kbd> / <kbd>Enter</kbd>: Roll dice
- <kbd>Cmd/Ctrl</kbd> + <kbd>Z</kbd>: Undo last move
- <kbd>Cmd/Ctrl</kbd> + <kbd>Y</kbd> or <kbd>Cmd/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd>: Redo
- <kbd>R</kbd>: Reset game (keeps player settings)
- <kbd>M</kbd>: Toggle sound
- <kbd>Cmd/Ctrl</kbd> + <kbd>/</kbd>: Open menu
- <kbd>Esc</kbd>: Close dialogs

---

## ✨ Features

- **Visual 5x5 Board**: Interactive grid with stackable pieces and level indicators
- **Multiplayer Support**: 2-4 players with customizable colors
- **Two-Player Mode**: Dual-color mode with per-turn color selection
- **Automatic Scoring**: Row completions, bonuses, and tall stacks
- **Sound Effects**: Audio feedback for all game events (can be muted)
- **Keyboard Shortcuts**: Full keyboard control
- **Multiple Languages**: English, Spanish, French, German
- **Game Analytics**: Real-time statistics and dice roll frequency
- **Auto-Save**: Game state persists in your browser
- **Accessibility**: Full ARIA support, keyboard navigation, screen reader compatible

---

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 🛠️ For Developers

### Requirements

- Node.js v18+
- pnpm

### Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Testing

```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

### Project Structure

- `src/components/` - UI components
- `src/lib/game/` - Core game logic (scoring, board, state)
- `src/hooks/` - Custom React hooks
- `tests/` - Test files

### Tech Stack

React 18, TypeScript, Vite, Tailwind CSS, Vitest, Playwright

---

## 📝 License

MIT License

---

## 🤝 Contributing

Pull Requests welcome! Please match existing code style and add tests where appropriate.
