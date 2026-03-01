# I Spy a Shape -- Knowledge Base

## Project Overview

A browser-based educational game that helps children learn and identify geometric shapes through interactive matching challenges. Built entirely with vanilla web technologies and designed to run from any static HTTP server with no backend or external dependencies.

## Technologies

- HTML5
- CSS3 (custom properties, keyframe animations, responsive media queries)
- Vanilla JavaScript with ES6 modules
- SVG for shape rendering
- HTML5 Canvas for confetti particle effects

## Game Mechanics

1. **Shape Matching** -- A target shape is shown at the top of the screen. The player clicks the matching shape from a scattered board. In Easy mode, only the shape type matters. In Medium and Hard, both shape and color must match.

2. **Shape Generation** -- Shapes are positioned using a grid-based algorithm that prevents clustering and guarantees at least one correct match is always present on the board.

3. **Difficulty Progression**
   - Easy: 4-8 basic shapes, distinct colors, minimal rotation, 3 attempts per round (reset on correct match)
   - Medium: 6-12 shapes (basic + intermediate), color matching required, more rotation, 3 attempts per round (reset on correct match)
   - Hard: 10-18 shapes (all types), color matching required, full rotation, shapes drift around the screen, 3 attempts total (no reset)

4. **Game Modes**
   - Classic: Attempt-based. Lose all attempts and the game ends.
   - Timed: Countdown timer. Correct matches add time, wrong clicks subtract it. Color matches give bonus time.

5. **Scoring and Leaderboards** -- Scores are stored in localStorage, separated by game mode. Top 10 scores are shown in a tabbed leaderboard on the setup screen.

6. **Sound and Visual Feedback** -- Correct matches trigger a confetti burst and sound effect. Wrong clicks shake the shape and play an error sound. A mute toggle is available for quiet environments.

## Available Shapes

- Basic (all levels): circle, square, triangle, rectangle
- Intermediate (medium and hard): pentagon, hexagon, oval, diamond
- Advanced (hard only): octagon, star, heart, trapezoid

All shapes are rendered as SVG elements for crisp scaling at any size.

## Code Organization

```
js/
  game.js               Entry point. Initializes listeners, audio, confetti canvas, and shows setup modal.
  modules/
    config.js            All game settings in a single frozen object. Includes a DEBUG flag.
    gameState.js         Central state object and reset function. Clears timers and animation frames on reset.
    elements.js          Cached DOM references and audio volume initialization.
    utils.js             Pure helpers: random selection, shuffling, capitalize, screen reader announcements.
    rendering.js         SVG shape factory, game board rendering, confetti particle system.
    gameLogic.js         Shape generation, match checking, scoring, timer, movement animation, high scores.
    events.js            All event listeners, modal management, difficulty/mode selection, resize handling.
```

## Design Decisions

- **No frameworks** -- Keeps the project simple, dependency-free, and easy for contributors to understand.
- **ES6 modules** -- Enforces separation of concerns. Requires an HTTP server (browsers block module imports over file://).
- **Frozen config** -- `gameConfig` is deep-frozen at startup to prevent accidental runtime mutation.
- **Grid-based positioning** -- Shapes are placed in shuffled grid cells rather than purely random coordinates, which avoids clustering and ensures shapes are spread across the board.
- **Proportional resize** -- When the window is resized during a game, shapes are repositioned proportionally rather than regenerated, preserving round progress.
- **SVG over clip-path** -- Shapes were migrated from CSS clip-paths to inline SVG for better cross-browser support and crisp rendering at any scale.
- **localStorage for scores** -- Simple, no-backend persistence. Scores are keyed by game mode.

## Accessibility

- WCAG-compliant color palette tested with colorblind simulators
- ARIA live regions for screen reader announcements (score changes, game events)
- Keyboard-accessible buttons and controls
- Screen-reader-only CSS class for hidden announcements
- Semantic HTML with proper heading hierarchy

## Configuration

All tuneable values live in `config.js`. Key settings include shape counts per difficulty, time limits and bonuses, rotation ranges, movement speeds, color palette, and confetti particle parameters. See the README for a full reference table.
