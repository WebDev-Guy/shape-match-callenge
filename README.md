# I Spy a Shape

> An interactive educational game that helps children learn geometric shapes through fun matching challenges.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow.svg)](https://www.ecma-international.org/ecma-262/)
[![HTML5](https://img.shields.io/badge/HTML-5-orange.svg)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS-3-blue.svg)](https://www.w3.org/Style/CSS/)

## Table of Contents

- [Overview](#overview)
- [Why This Game Matters](#why-this-game-matters)
- [Features](#features)
- [Installation](#installation)
- [How to Play](#how-to-play)
- [Game Modes](#game-modes)
- [Game Configuration](#game-configuration)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Overview

I Spy a Shape is a browser-based educational game designed to help children recognize and identify geometric shapes. It offers multiple difficulty levels and game modes so kids can learn at their own pace and keep coming back as their skills grow.

The game is built with vanilla JavaScript (ES6 modules), HTML5, and CSS3. There are no frameworks or external dependencies to install -- just serve the files and play.

## Why This Game Matters

Shape recognition is one of the foundational skills in early childhood development. When young children learn to identify and distinguish shapes, they are building the groundwork for a surprisingly wide range of abilities that extend well beyond geometry class.

### Visual Discrimination and Spatial Awareness

Picking out a target shape from a scattered board of options trains a child's ability to notice differences, compare forms, and understand how objects relate to each other in space. These are the same skills that help kids recognize letters (telling a "b" from a "d"), read maps, and eventually understand graphs and diagrams. The game's increasing difficulty -- from a handful of basic shapes with distinct colors up to dozens of rotated, similarly colored, moving shapes -- gradually stretches these abilities in a way that feels like play rather than practice.

### Cognitive Flexibility and Problem Solving

Each round asks the child to hold a target shape in mind and scan the board for a match, which exercises working memory and focused attention. In medium and hard modes, they also need to match color alongside shape, which means juggling two criteria at once. This kind of multi-attribute matching is an early form of the logical thinking that shows up later in math, science, and everyday decision-making.

### Fine Motor Skills and Hand-Eye Coordination

Clicking (or tapping) on the right shape among many options requires precise control. In hard mode, shapes drift around the screen, so children need to track a moving target and time their click. This is a low-pressure way to develop the hand-eye coordination that supports handwriting, drawing, and using tools.

### Confidence and Persistence

The game is designed to encourage rather than punish. Easy mode is forgiving -- shapes are few, colors are distinct, and attempts reset after each correct match. Confetti bursts and sound effects celebrate every success. When a child does make a mistake, the shake animation and gentle heart-loss feedback teach them that getting it wrong is part of the process, not the end of the game. Moving from easy to medium to hard gives kids a natural sense of progression and accomplishment.

### Math Readiness

Geometry is one of the five major strands of early mathematics, alongside counting, patterns, measurement, and data. Children who can fluently name and describe shapes tend to perform better in math overall because shape recognition reinforces classification, comparison, and the language of attributes ("this one has more sides," "that one is round"). I Spy a Shape introduces twelve distinct shapes across three tiers, giving children a vocabulary of geometric forms that lines up with what they will encounter in kindergarten and early elementary curricula.

### Classroom and Home Use

The mute button makes the game suitable for classroom environments where sound would be a distraction, while the leaderboard and player name system let siblings or classmates take turns and compare scores. Because the game runs entirely in the browser with no accounts or data collection, it is straightforward for parents and teachers to set up and safe for children to use independently.

## Features

- **12 shapes** across three difficulty tiers, from circles and squares up to stars, hearts, and trapezoids
- **Three difficulty levels** -- Easy, Medium, and Hard -- with distinct rules for matching, rotation, movement, and color
- **Two game modes** -- Classic (attempt-based) and Timed (race the clock with time bonuses)
- **Adjustable shape count** so you can control how busy the board gets
- **Sound effects** for correct matches, mistakes, and game over, with a mute toggle for quiet environments
- **Confetti animations** that burst from the click location on every correct match
- **Responsive design** that works on desktops, tablets, and phones
- **Accessibility support** including ARIA live regions for screen readers and a WCAG-compliant color palette
- **Local leaderboards** stored in the browser, separated by game mode
- **No dependencies** -- pure vanilla JavaScript, HTML, and CSS

## Installation

The game uses ES6 modules, so it needs to be served over HTTP rather than opened directly as a file. Here are a few ways to get it running.

### Option 1: npm start

If you have Node.js installed, this is the quickest path.

```bash
git clone https://github.com/webdev-guy/i-spy-a-shape.git
cd i-spy-a-shape
npm start
```

This runs `npx http-server` on port 8000 and opens the game in your browser.

### Option 2: VS Code Live Server

1. Clone the repository and open it in VS Code.
2. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension if you don't have it.
3. Right-click `index.html` and select "Open with Live Server."

### Option 3: Python

```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

Then open `http://localhost:8000` in your browser.

> Opening `index.html` directly as a file will not work. Browsers block ES6 module imports over the `file://` protocol.

## How to Play

1. Enter your name on the setup screen.
2. Pick a difficulty level -- Easy, Medium, or Hard. Hover over each option to see what the rules are.
3. Choose a game mode -- Classic or Timed.
4. Adjust the number of shapes if you want more or fewer on the board.
5. Hit Start Game.
6. A target shape appears in the banner at the top of the screen. Find and click the matching shape on the board.
7. In Easy mode, only the shape needs to match. In Medium and Hard, both the shape and color must match.
8. Score points for each correct match and try to land on the leaderboard.

## Game Modes

| Mode | How it works |
|------|-------------|
| **Classic** | Match shapes to earn points. You get three wrong attempts before the game ends. In Easy and Medium, attempts reset after each correct match. In Hard, three wrong clicks total and you are done. |
| **Timed** | Start with a countdown timer. Correct matches add time, wrong clicks subtract it. Matching both shape and color gives a bonus. The round ends when the timer hits zero. |

Hard mode adds an extra twist in both modes: shapes slowly drift around the board, so you need to track and click a moving target.

## Game Configuration

All game settings live in `js/modules/config.js`. The configuration is frozen at startup to prevent accidental changes during gameplay, but you can edit the file to adjust the game for your needs.

### Basic Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `maxShapes` | Maximum shapes on screen | 10 |
| `minShapes` | Minimum shapes on screen | 5 |
| `maxAttempts` | Wrong clicks before game over | 3 |
| `successDelay` | Pause between correct match and next round (ms) | 800 |

### Difficulty Levels

| Setting | Easy | Medium | Hard |
|---------|------|--------|------|
| Shape count | 4-8 | 6-12 | 10-18 |
| Time limit (timed mode) | 90s | 60s | 45s |
| Color matching required | No | Yes | Yes |
| Distinct colors | Yes | No | No |
| Max rotation | 45 degrees | 180 degrees | 359 degrees |
| Shape movement | None | None | Slow drift |

### Available Shapes

- **All levels:** circle, square, triangle, rectangle
- **Medium and Hard:** pentagon, hexagon, oval, diamond
- **Hard only:** octagon, star, heart, trapezoid

### Confetti Settings

```javascript
confetti: {
    particleCount: 100,
    gravity: 0.2,
    spread: 70,
    velocityFactor: 0.7
}
```

To modify any setting, edit `config.js`, save, and refresh the game in your browser.

## Development

### Tech Stack

- HTML5 for structure
- CSS3 for styling and animations (Fredoka font, CSS custom properties, keyframe animations)
- Vanilla JavaScript with ES6 modules for all game logic

### Project Structure

```
i-spy-a-shape/
  index.html              Main page
  package.json            Project metadata and start script
  css/
    styles.css            All styling and animations
  js/
    game.js               Entry point, wires up modules on page load
    modules/
      config.js           Game settings and difficulty configuration
      elements.js         Cached DOM references and audio setup
      events.js           Event listeners and UI interactions
      gameLogic.js        Core mechanics -- shape generation, scoring, timers, movement
      gameState.js        Central state object and reset logic
      rendering.js        SVG shape creation and confetti animation
      utils.js            Small helpers -- random numbers, shuffling, screen reader announcements
  audio/
    correct.mp3           Correct match sound
    wrong.mp3             Wrong match sound
    gameover.mp3          Game over sound
  images/
    mascot.png            Logo and mascot image
```

### Architecture

The codebase follows a straightforward module pattern. Each file has a single responsibility, and they communicate through imports and a shared `gameState` object.

- **config.js** is the single source of truth for all game parameters. It is deep-frozen at startup.
- **gameState.js** holds all runtime data (score, attempts, shapes on the board, timer state). The `resetGameState` function clears temporary data while preserving player preferences.
- **elements.js** caches DOM references once at startup so the rest of the code never has to call `getElementById` repeatedly.
- **rendering.js** builds shapes as SVG elements inside positioned divs and handles the confetti particle system on an HTML5 canvas.
- **gameLogic.js** is the largest module. It handles shape generation with grid-based positioning, match checking, scoring, the timer, hard-mode movement animation, and high score management via localStorage.
- **events.js** wires up all buttons and controls, manages modals, and handles window resize by proportionally repositioning shapes.
- **utils.js** contains pure helper functions with no side effects.

### Running Locally

```bash
npm start
```

Or use any static HTTP server as described in the Installation section.

## Contributing

Contributions are welcome. Here is the general flow:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit them.
4. Push to your fork and open a pull request.

Please follow the existing code style and keep changes focused. If you are planning something large, open an issue first to discuss the approach.

### Ideas for Future Work

- Tutorial or guided mode for first-time players
- Additional shape sets (3D shapes, arrows, crescents)
- Multiplayer or turn-based mode
- Progressive difficulty that adapts to the player's performance
- Keyboard navigation for shape selection

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Sound effects from [Freesound.org](https://freesound.org)
- [Fredoka](https://fonts.google.com/specimen/Fredoka) font from Google Fonts
- Inspired by educational research on shape recognition in early childhood development
