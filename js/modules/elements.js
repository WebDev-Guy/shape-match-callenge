/**
 * DOM element references and audio initialization for the game.
 * @fileoverview DOM element references and audio initialization
 * @author WebDevGuy
 * @version 1.0.0
 */

/**
 * Central registry of all DOM elements used throughout the game.
 * References are gathered here for maintainability and performance.
 *
 * @type {Object}
 * @property {HTMLElement} score - Displays the current score
 * @property {HTMLElement} attempts - Shows remaining attempts as hearts
 * @property {HTMLElement} targetShape - Container for the shape to find
 * @property {HTMLElement} gameBoard - Main playing area where shapes appear
 * @property {HTMLElement} gameOverScreen - Game over modal dialog
 * @property {HTMLElement} confettiCanvas - Canvas for victory animations
 * @property {HTMLElement} setupModal - Initial game setup dialog
 * @property {NodeList} difficultyButtons - All difficulty selection buttons
 * @property {NodeList} modeButtons - All game mode selection buttons
 * @property {HTMLAudioElement} correctSound - Audio for correct matches
 * @property {HTMLAudioElement} wrongSound - Audio for incorrect matches
 * @property {HTMLAudioElement} gameoverSound - Audio for game over
 */
export const elements = {
    // Core game display elements
    score: document.getElementById('score-centered'), // Updated to match actual HTML ID
    attempts: document.getElementById('hearts'), // Changed to hearts since that's the element showing attempts
    targetShape: document.getElementById('target-shape'),
    gameBoard: document.getElementById('game-board'),

    // Game over screen elements
    gameOverScreen: document.getElementById('game-over'),
    finalScore: document.getElementById('final-score'),
    restartButton: document.getElementById('restart-button'),
    backToMenuButton: document.getElementById('back-to-menu-button'),

    // Visual effects
    confettiCanvas: document.getElementById('confetti-canvas'),

    // Setup and configuration elements
    setupModal: document.getElementById('game-setup-modal'),
    playerNameInput: document.getElementById('player-name'),
    nameErrorMessage: document.createElement('div'), // Will be added to DOM when needed
    difficultyButtons: document.querySelectorAll('.option-btn[data-difficulty]'),
    modeButtons: document.querySelectorAll('.option-btn[data-mode]'),
    decreaseShapesBtn: document.getElementById('decrease-shapes'),
    increaseShapesBtn: document.getElementById('increase-shapes'),
    shapeQuantityDisplay: document.getElementById('shape-quantity-display'),
    startGameBtn: document.getElementById('start-game-btn'),

    // Wizard step containers
    wizardStep1: document.getElementById('wizard-step-1'),
    wizardStep2: document.getElementById('wizard-step-2'),
    wizardStep3: document.getElementById('wizard-step-3'),

    // Wizard navigation buttons
    wizardNextBtn: document.getElementById('wizard-next-btn'),
    wizardHighScoresBtn: document.getElementById('wizard-highscores-btn'),
    wizardBackSettingsBtn: document.getElementById('wizard-back-settings-btn'),
    wizardBackScoresBtn: document.getElementById('wizard-back-scores-btn'),

    // High scores and leaderboard
    highScoresList: document.getElementById('high-scores-list'),

    // Timer display elements
    timerDisplay: document.getElementById('timer-display'),
    timer: document.getElementById('timer'),

    // Game instructions and help
    findShapeText: document.getElementById('find-shape-text'),

    // Leaderboard elements (created dynamically)
    leaderboardTabs: null, // Will be created dynamically
    classicScoresContainer: null, // Will be created dynamically
    timedScoresContainer: null, // Will be created dynamically
    leaderboardContainer: document.getElementById('high-scores-list'),

    // Audio elements for game feedback
    correctSound: document.getElementById('correct-sound'),
    wrongSound: document.getElementById('wrong-sound'),
    gameoverSound: document.getElementById('gameover-sound'),

    // Game control buttons
    quitButton: document.getElementById('quit-game-button'),
    muteButton: document.getElementById('mute-button')
};

/**
 * Initializes the confetti canvas 2D rendering context for victory animations.
 * @returns {CanvasRenderingContext2D|null} The 2D rendering context, or null if canvas not found
 */
export function initializeConfettiContext() {
    if (!elements.confettiCanvas) {
        return null;
    }

    try {
        return elements.confettiCanvas.getContext('2d');
    } catch (error) {
        console.error('Failed to initialize confetti context:', error);
        return null;
    }
}

/**
 * Configures audio volume levels for optimal game experience.
 * @returns {void}
 */
export function initAudioSettings() {
    try {
        // Set volume levels for different sounds
        if (elements.correctSound) {
            elements.correctSound.volume = 0.5; // Reduced from default 1.0 - pleasant but not overwhelming
        }

        if (elements.wrongSound) {
            elements.wrongSound.volume = 0.7;   // Keep this a bit louder for clear feedback
        }

        if (elements.gameoverSound) {
            elements.gameoverSound.volume = 0.8; // Prominent but not jarring
        }

    } catch (error) {
        console.error('Failed to initialize audio settings:', error);
        // Don't throw - game should still work without audio
    }
}
