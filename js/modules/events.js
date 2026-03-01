/**
 * Event listeners, UI interactions, and modal management.
 * @fileoverview Event handling and user interface module for the game
 * @author WebDevGuy
 * @version 1.0.0
 */

// Game event handlers and UI interactions
import gameState, { resetGameState } from './gameState.js';
import { elements } from './elements.js';
import { gameConfig } from './config.js';
import { capitalize } from './utils.js';
import {
    applyDifficultySettings,
    startNewRound,
    startMovingShapes,
    stopMovingShapes,
    stopTimer,
    endGame,
    hideGameOverScreen,
    startTimer,
    loadHighScoresByMode,
    generateGameShapes,
    ensureGameBoardDimensions,
    updateScoreDisplay
} from './gameLogic.js';
import { clearGameBoard, resizeConfettiCanvas } from './rendering.js';

/**
 * Initializes all event listeners for the game interface.
 * Wires up game controls, setup configuration, resize handling, and modal dialogs.
 * @returns {void}
 * @throws {Error} If critical DOM elements are missing
 */
export function initEventListeners() {
    try {
        // Game control event listeners
        elements.restartButton.addEventListener('click', restartGame);
        elements.backToMenuButton.addEventListener('click', showSetupModal);

        // Difficulty selection buttons
        elements.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Visual feedback: update selected state
                elements.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');

                // Update game state
                gameState.currentDifficulty = button.dataset.difficulty;

                // Apply difficulty-specific settings (clamps shapesQuantity to valid range)
                applyDifficultySettings();

            });
        });

        // Game mode selection buttons
        elements.modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Visual feedback: update selected state
                elements.modeButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');

                // Update game state
                gameState.currentMode = button.dataset.mode;

                // Show/hide timer based on selected mode
                if (gameState.currentMode === 'timed') {
                    elements.timerDisplay.classList.remove('hidden');
                } else {
                    elements.timerDisplay.classList.add('hidden');
                }

                // Update tooltips to match selected mode
                updateDifficultyTooltips(gameState.currentMode);

            });
        });

        // Shape quantity adjustment controls (bounds follow selected difficulty)
        elements.decreaseShapesBtn.addEventListener('click', () => {
            const bounds = gameConfig.difficulty[gameState.currentDifficulty].shapesCount;
            if (gameState.shapesQuantity > bounds.min) {
                gameState.shapesQuantity--;
                elements.shapeQuantityDisplay.textContent = gameState.shapesQuantity;
            }
        });

        elements.increaseShapesBtn.addEventListener('click', () => {
            const bounds = gameConfig.difficulty[gameState.currentDifficulty].shapesCount;
            if (gameState.shapesQuantity < bounds.max) {
                gameState.shapesQuantity++;
                elements.shapeQuantityDisplay.textContent = gameState.shapesQuantity;
            }
        });

        // Mute toggle
        elements.muteButton.addEventListener('click', () => {
            gameState.muted = !gameState.muted;
            elements.muteButton.textContent = gameState.muted ? '🔇' : '🔊';
            elements.muteButton.classList.toggle('muted', gameState.muted);
            elements.muteButton.setAttribute('aria-label',
                gameState.muted ? 'Unmute sound effects' : 'Mute sound effects'
            );
        });

        // Wizard navigation
        elements.wizardNextBtn.addEventListener('click', () => {
            const playerNameValue = elements.playerNameInput.value.trim();
            if (!playerNameValue) {
                const errorMessage = document.getElementById('name-error-message') || createNameErrorMessage();
                errorMessage.style.display = 'block';
                elements.playerNameInput.focus();
                return;
            }
            const errorMessage = document.getElementById('name-error-message');
            if (errorMessage) errorMessage.style.display = 'none';
            goToWizardStep(2);
        });

        elements.wizardHighScoresBtn.addEventListener('click', () => {
            displayHighScores();
            goToWizardStep(3);
        });

        elements.wizardBackSettingsBtn.addEventListener('click', () => {
            goToWizardStep(1);
        });

        elements.wizardBackScoresBtn.addEventListener('click', () => {
            goToWizardStep(1);
        });

        // Game start and quit controls
        elements.startGameBtn.addEventListener('click', startGameFromSetup);
        elements.quitButton.addEventListener('click', () => {
            showEndGameConfirmation();
        });

        // End game confirmation dialog buttons
        document.getElementById('cancel-end-game').addEventListener('click', () => {
            hideEndGameConfirmation();
        });

        document.getElementById('confirm-end-game').addEventListener('click', () => {
            hideEndGameConfirmation();
            endGame();
        });

        // Responsive design: handle window resize
        window.addEventListener('resize', handleWindowResize);

    } catch (error) {
        console.error('Failed to initialize event listeners:', error);
        throw new Error('Critical UI elements are missing - cannot initialize game');
    }
}

/**
 * Switches the wizard to the specified step (1, 2, or 3).
 * @param {number} stepNumber - The step to show
 * @returns {void}
 */
function goToWizardStep(stepNumber) {
    const steps = [elements.wizardStep1, elements.wizardStep2, elements.wizardStep3];
    steps.forEach((step, i) => {
        step.classList.toggle('active', i + 1 === stepNumber);
    });
}

/**
 * Displays the game setup modal for player configuration.
 * Cleans up any active game, resets state, and shows the setup screen with updated high scores.
 * @returns {void}
 */
export function showSetupModal() {
    // Clean up any active game state
    resetGameState();
    clearGameBoard();

    // Stop any running animations or timers to prevent interference
    stopMovingShapes();
    stopTimer();
    if (gameState.animationFrameId) {
        cancelAnimationFrame(gameState.animationFrameId);
    }

    // Hide any other screens that might be visible
    hideGameOverScreen();

    // Show the setup modal with updated information
    elements.setupModal.classList.remove('hidden');

    // Reset wizard to step 1
    goToWizardStep(1);

}

/**
 * Initiates a new game from the setup modal.
 * Name was already validated on wizard step 1.
 * @returns {void}
 */
export function startGameFromSetup() {
    // Store the player name (already validated on step 1)
    gameState.playerName = elements.playerNameInput.value.trim();

    // Smooth transition: hide setup modal
    elements.setupModal.classList.add('hidden');

    // Start the actual game
    startGame();

}

/**
 * Creates a dynamic error message element for player name validation.
 * Inserts a styled error message after the player name input field.
 * @returns {HTMLElement} The created error message element
 */
export function createNameErrorMessage() {
    const errorMessage = document.createElement('div');
    errorMessage.id = 'name-error-message';

    // Styling for clear, non-threatening error display
    errorMessage.style.color = '#FF6B6B'; // WCAG compliant red from our color palette
    errorMessage.style.marginTop = '5px';
    errorMessage.style.fontSize = '0.9em';
    errorMessage.textContent = 'Please enter your name before starting';
    errorMessage.style.display = 'none'; // Hidden by default

    // Insert the error message right after the player name input
    elements.playerNameInput.parentNode.insertBefore(
        errorMessage,
        elements.playerNameInput.nextSibling
    );

    return errorMessage;
}

/**
 * Starts a new game session with current settings.
 * Initializes game state, updates UI, configures mode-specific settings, and begins the first round.
 * @returns {void}
 */
export function startGame() {
    // Initialize core game state
    gameState.gameOver = false;
    gameState.score = 0;
    gameState.attemptsLeft = gameConfig.maxAttempts;
    gameState.targetShape = null;
    gameState.shapes = [];

    // Clear any leftover shapes from previous games
    clearGameBoard();

    // Ensure game board has proper dimensions before proceeding
    ensureGameBoardDimensions();

    // Update all display elements
    updateScoreDisplay();

    // Configure mode-specific settings
    if (gameState.currentMode === 'timed') {
        // Set up timed mode
        const diffSettings = gameConfig.difficulty[gameState.currentDifficulty];
        gameState.timeRemaining = diffSettings.timeLimit;
        elements.timer.textContent = gameState.timeRemaining;
        elements.timerDisplay.classList.remove('hidden');
        startTimer();
    } else {
        // Classic mode: hide timer display
        elements.timerDisplay.classList.add('hidden');
    }

    // Ensure setup modal is hidden
    elements.setupModal.classList.add('hidden');

    // Brief delay to ensure DOM is ready and transitions are smooth
    setTimeout(() => {
        startNewRound();
    }, 100);
}

/**
 * Restarts the current game with the same settings.
 * @returns {void}
 */
export function restartGame() {
    // Hide game over screen
    hideGameOverScreen();

    // Start new game with same settings
    startGame();
}

/**
 * Handles window resize events for responsive design.
 * Resizes the confetti canvas and proportionally repositions existing shapes.
 * @returns {void}
 */
export function handleWindowResize() {
    resizeConfettiCanvas();

    // Proportionally reposition existing shapes to fit the new board dimensions
    if (!gameState.gameOver && gameState.shapes.length > 0) {
        const oldWidth = gameState._boardWidth || elements.gameBoard.clientWidth;
        const oldHeight = gameState._boardHeight || elements.gameBoard.clientHeight;
        const newWidth = elements.gameBoard.clientWidth;
        const newHeight = elements.gameBoard.clientHeight;

        if (oldWidth > 0 && oldHeight > 0 && newWidth > 0 && newHeight > 0) {
            const scaleX = newWidth / oldWidth;
            const scaleY = newHeight / oldHeight;

            gameState.shapes.forEach(shape => {
                shape.x = Math.max(0, Math.min(shape.x * scaleX, newWidth - shape.size));
                shape.y = Math.max(0, Math.min(shape.y * scaleY, newHeight - shape.size));

                if (shape.element) {
                    shape.element.style.left = `${shape.x}px`;
                    shape.element.style.top = `${shape.y}px`;
                }
            });
        }

        // Store current dimensions for next resize
        gameState._boardWidth = newWidth;
        gameState._boardHeight = newHeight;
    }
}

/**
 * Displays and manages the high scores leaderboard with tabbed Classic/Timed interface.
 * Rebuilds the leaderboard each time to reflect the latest scores.
 * @returns {void}
 */
export function displayHighScores() {
    // Clear existing content for fresh rebuild
    elements.highScoresList.innerHTML = '';

    // Create a header container for the leaderboard
    const headerContainer = document.createElement('div');
    headerContainer.className = 'leaderboard-header-container';

    // Add the main heading
    const heading = document.createElement('h3');
    heading.textContent = 'High Scores';
    headerContainer.appendChild(heading);

    // Create the tab container for mode switching
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'leaderboard-tabs';

    // Create Classic mode tab with appropriate active state
    const classicTab = document.createElement('div');
    classicTab.className = 'leaderboard-tab' + (gameState.currentMode === 'classic' ? ' active' : '');
    classicTab.textContent = 'Classic Mode';
    classicTab.addEventListener('click', () => {
        // Update visual state of tabs
        document.querySelectorAll('.leaderboard-tab').forEach(tab => tab.classList.remove('active'));
        classicTab.classList.add('active');

        // Switch visible content
        if (elements.classicScoresContainer) elements.classicScoresContainer.style.display = 'block';
        if (elements.timedScoresContainer) elements.timedScoresContainer.style.display = 'none';
    });

    // Create Timed mode tab with appropriate active state
    const timedTab = document.createElement('div');
    timedTab.className = 'leaderboard-tab' + (gameState.currentMode === 'timed' ? ' active' : '');
    timedTab.textContent = 'Timed Mode';
    timedTab.addEventListener('click', () => {
        // Update visual state of tabs
        document.querySelectorAll('.leaderboard-tab').forEach(tab => tab.classList.remove('active'));
        timedTab.classList.add('active');

        // Switch visible content
        if (elements.timedScoresContainer) elements.timedScoresContainer.style.display = 'block';
        if (elements.classicScoresContainer) elements.classicScoresContainer.style.display = 'none';
    });

    // Assemble the tab system
    tabsContainer.appendChild(classicTab);
    tabsContainer.appendChild(timedTab);
    headerContainer.appendChild(tabsContainer);
    elements.highScoresList.appendChild(headerContainer);

    // Create containers for each mode's scores
    elements.classicScoresContainer = document.createElement('div');
    elements.classicScoresContainer.className = 'scores-container';
    elements.classicScoresContainer.style.display = gameState.currentMode === 'classic' ? 'block' : 'none';

    elements.timedScoresContainer = document.createElement('div');
    elements.timedScoresContainer.className = 'scores-container';
    elements.timedScoresContainer.style.display = gameState.currentMode === 'timed' ? 'block' : 'none';    // Add score containers to leaderboard
    elements.highScoresList.appendChild(elements.classicScoresContainer);
    elements.highScoresList.appendChild(elements.timedScoresContainer);

    // Store tabs for future reference
    elements.leaderboardTabs = tabsContainer;

    // Load and display scores for both modes
    const classicScores = loadHighScoresByMode('classic');
    displayModeScores(classicScores, elements.classicScoresContainer);

    const timedScores = loadHighScoresByMode('timed');
    displayModeScores(timedScores, elements.timedScoresContainer);

}

/**
 * Renders score entries for a specific game mode into the provided container.
 * Handles empty leaderboards and applies gold/silver/bronze styling to top 3.
 * @param {Array} scores - Array of score objects to display
 * @param {HTMLElement} container - DOM element to render scores into
 * @returns {void}
 * @throws {Error} If container is not a valid DOM element
 */
export function displayModeScores(scores, container) {
    if (!container || !container.appendChild) {
        throw new Error('displayModeScores requires a valid DOM container element');
    }

    // Handle empty leaderboard case
    if (!scores || scores.length === 0) {
        container.innerHTML = '<p class="no-scores">No high scores yet!</p>';
        return;
    }

    // Create leaderboard table header
    const leaderboardHeader = document.createElement('div');
    leaderboardHeader.classList.add('high-score-header');
    leaderboardHeader.innerHTML = `
        <span class="rank-col">Rank</span>
        <span class="name-col">Player</span>
        <span class="score-col">Score</span>
        <span class="details-col">Difficulty</span>
    `;
    container.appendChild(leaderboardHeader);

    // Create individual score entries
    scores.forEach((score, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.classList.add('high-score-item');

        // Apply special styling for top 3 positions
        if (index === 0) scoreItem.classList.add('gold');
        if (index === 1) scoreItem.classList.add('silver');
        if (index === 2) scoreItem.classList.add('bronze');

        // Build score entry using textContent to prevent XSS
        const rankSpan = document.createElement('span');
        rankSpan.className = 'rank-col';
        rankSpan.textContent = index + 1;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'name-col';
        nameSpan.textContent = score.name;

        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'score-col';
        scoreSpan.textContent = score.score;

        const detailsSpan = document.createElement('span');
        detailsSpan.className = 'details-col';
        detailsSpan.textContent = capitalize(score.difficulty);

        scoreItem.appendChild(rankSpan);
        scoreItem.appendChild(nameSpan);
        scoreItem.appendChild(scoreSpan);
        scoreItem.appendChild(detailsSpan);

        container.appendChild(scoreItem);
    });

}

/**
 * Updates difficulty and mode tooltips based on the selected game mode.
 * Ensures tooltip content reflects the rules for Classic vs Timed mode.
 * @param {string} mode - The game mode ('classic' or 'timed')
 * @returns {void}
 * @throws {Error} If mode is not a valid game mode string
 */
export function updateDifficultyTooltips(mode) {
    if (typeof mode !== 'string' || !['classic', 'timed'].includes(mode)) {
        throw new Error('updateDifficultyTooltips requires a valid mode: "classic" or "timed"');
    }

    // Update difficulty button tooltips
    const difficultyButtons = document.querySelectorAll('.option-btn[data-difficulty]');
    difficultyButtons.forEach(button => {
        const difficulty = button.dataset.difficulty;
        const tooltipElement = button.querySelector('.tooltip');

        if (tooltipElement && gameConfig.tooltips[mode] && gameConfig.tooltips[mode][difficulty]) {
            // Set tooltip content based on current game mode and difficulty
            tooltipElement.innerHTML = gameConfig.tooltips[mode][difficulty];
        }
    });

    // Update mode-specific tooltips for better user understanding
    const modeButtons = document.querySelectorAll('.option-btn[data-mode]');
    modeButtons.forEach(button => {
        const buttonMode = button.dataset.mode;
        const tooltipElement = button.querySelector('.tooltip');

        if (tooltipElement) {
            if (buttonMode === 'classic') {
                tooltipElement.innerHTML = "Standard gameplay<br>Find matching shapes<br>3 attempts per round";
            } else if (buttonMode === 'timed') {
                tooltipElement.innerHTML = "Race against the clock<br>Gain time for correct matches<br>Lose time for mistakes<br>Bonus time for color matches";
            }
        }
    });

}

/**
 * Shows the end game confirmation dialog, pausing the game while displayed.
 * @returns {void}
 */
export function showEndGameConfirmation() {
    // Pause the game while confirmation is shown
    if (gameState.currentMode === 'timed') {
        stopTimer();
    }
    stopMovingShapes();
    // Show the confirmation dialog and overlay
    document.getElementById('confirmation-overlay').style.display = 'block';
    document.getElementById('end-game-dialog').style.display = 'block';

}

/**
 * Hides the end game confirmation dialog and resumes gameplay if the game is still active.
 * @returns {void}
 */
export function hideEndGameConfirmation() {
    // Hide the confirmation dialog and overlay
    document.getElementById('confirmation-overlay').style.display = 'none';
    document.getElementById('end-game-dialog').style.display = 'none';

    // Resume the game only if it's still active
    if (!gameState.gameOver) {
        if (gameState.currentMode === 'timed') {
            startTimer();
        }
        if (gameState.currentDifficulty === 'hard') {
            startMovingShapes();
        }
    }

}
