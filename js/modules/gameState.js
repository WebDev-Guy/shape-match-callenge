/**
 * Centralized game state management and reset functionality.
 * @fileoverview Manages all game state in a single source of truth
 * @author WebDevGuy
 * @version 1.0.0
 */

/**
 * Central game state object that tracks all gameplay data, player settings,
 * and session configuration. All parts of the game read from and write to
 * this shared state.
 *
 * @type {Object}
 * @property {boolean} isGameActive - Whether a game round is currently running
 * @property {number} score - Player's current score (number of correct matches)
 * @property {number} previousScore - Previous score value for animation triggers
 * @property {number} attemptsLeft - Remaining wrong guesses before game over
 * @property {number} previousAttempts - Previous attempts for animation triggers
 * @property {number} timer - Current timer value (used internally)
 * @property {?number} timerInterval - ID of the active timer interval
 * @property {?string} targetShape - The shape type player needs to find
 * @property {?string} targetColor - The color of the target shape
 * @property {Array} shapes - Array of shape objects currently on the game board
 * @property {string} difficulty - Current difficulty level ('easy', 'medium', 'hard')
 * @property {number} movementSpeed - Speed multiplier for moving shapes
 * @property {number} shapesCount - Number of shapes to display on screen
 * @property {string} playerName - Name entered by the player
 * @property {Object} highScores - Stored high scores by difficulty level
 * @property {string} currentDifficulty - Currently selected difficulty
 * @property {string} currentMode - Currently selected game mode
 * @property {number} shapesQuantity - User's preferred number of shapes
 * @property {boolean} gameOver - Whether the current game has ended
 * @property {?number} animationFrameId - ID of active animation frame for cleanup
 * @property {number} timeRemaining - Seconds left in timed mode
 * @property {?number} confettiAnimationId - ID of active confetti animation
 */
const gameState = {
    // Core game status
    isGameActive: false,
    score: 0,
    previousScore: 0, // Added to track previous score for animation
    attemptsLeft: 0,
    previousAttempts: 0, // Added to track previous attempts for animation

    // Timer management
    timer: 0,
    timerInterval: null,

    // Current round data
    targetShape: null,
    targetColor: null, // Added to store target color separately
    shapes: [],

    // Game configuration
    difficulty: 'easy',
    movementSpeed: 1,
    shapesCount: 10,

    // Player data
    playerName: '',

    // Current session settings
    currentDifficulty: 'easy',
    currentMode: 'classic',
    shapesQuantity: 10,

    // Audio settings
    muted: false,

    // Game flow control
    gameOver: false,
    animationFrameId: null,
    timeRemaining: 0,
    confettiAnimationId: null // Added to track confetti animations
};

/**
 * Resets temporary game data for a fresh round while preserving
 * player preferences (difficulty, mode, name, high scores).
 * @returns {void}
 */
export function resetGameState() {
    // Reset core game status
    gameState.isGameActive = false;
    gameState.score = 0;
    gameState.previousScore = 0; // Reset previousScore
    gameState.attemptsLeft = 0;
    gameState.previousAttempts = 0;

    // Clear timer data
    gameState.timer = 0;
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    gameState.timerInterval = null;

    // Clear current round data
    gameState.targetShape = null;
    gameState.targetColor = null;
    gameState.shapes = [];

    // Reset game flow flags
    gameState.gameOver = false;
    if (gameState.animationFrameId) {
        cancelAnimationFrame(gameState.animationFrameId);
    }
    gameState.animationFrameId = null;
    gameState.timeRemaining = 0;
    if (gameState.confettiAnimationId) {
        cancelAnimationFrame(gameState.confettiAnimationId);
    }
    gameState.confettiAnimationId = null;

    // Preserve user preferences - these should NOT be reset:
    // - gameState.currentDifficulty
    // - gameState.currentMode
    // - gameState.shapesQuantity
    // - gameState.playerName

}

export default gameState;
