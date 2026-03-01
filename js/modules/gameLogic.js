/**
 * Core game mechanics, shape generation, and gameplay logic.
 * @fileoverview Core game mechanics, shape generation, and gameplay logic
 * @author WebDevGuy
 * @version 1.0.0
 */

// Game logic functions
import gameState from './gameState.js';
import { elements } from './elements.js';
import { gameConfig } from './config.js';
import { getRandomItem, getRandomNumber, shuffleArray, announceTo } from './utils.js';
import { clearGameBoard, createTargetShape, renderShapes, resizeConfettiCanvas } from './rendering.js';

/**
 * Gets the available shapes for the current difficulty level.
 * Progressively adds more shapes as difficulty increases.
 * @returns {string[]} Array of shape names available for current difficulty
 */
export function getAvailableShapes() {
    let availableShapes = [...gameConfig.basicShapes]; // Start with basic shapes (always available)

    // Add medium shapes for medium and hard difficulties
    if (gameState.currentDifficulty === 'medium' || gameState.currentDifficulty === 'hard') {
        availableShapes = [...availableShapes, ...gameConfig.mediumShapes];
    }

    // Add hard shapes only for hard difficulty
    if (gameState.currentDifficulty === 'hard') {
        availableShapes = [...availableShapes, ...gameConfig.hardShapes];
    }

    return availableShapes;
}

/**
 * Applies difficulty-specific settings to the current game session.
 * Adjusts shape count limits, UI text, and display values.
 * @returns {void}
 */
export function applyDifficultySettings() {
    const difficulty = gameConfig.difficulty[gameState.currentDifficulty];

    // Adjust shape count to stay within difficulty limits while respecting player preference
    if (gameState.shapesQuantity < difficulty.shapesCount.min) {
        gameState.shapesQuantity = difficulty.shapesCount.min;
    } else if (gameState.shapesQuantity > difficulty.shapesCount.max) {
        gameState.shapesQuantity = difficulty.shapesCount.max;
    }

    // Sync the display with the (possibly adjusted) value
    elements.shapeQuantityDisplay.textContent = gameState.shapesQuantity;

    // Update the instruction text to reflect matching requirements
    if (gameState.currentDifficulty === 'easy') {
        elements.findShapeText.textContent = 'Find this shape: (Shape Only)';
    } else {
        elements.findShapeText.textContent = 'Find this shape: (Shape AND Color)';
    }

}

/**
 * Generates a set of randomly positioned shapes for the game board.
 * Uses grid-based positioning, guarantees at least one correct match, and scales to screen size.
 * @param {number} count - Number of shapes to generate (will be adjusted for screen size)
 * @param {string} targetShapeType - The shape type that players need to find
 * @returns {void} Populates gameState.shapes array and renders shapes on board
 * @throws {Error} If count is not a positive number or targetShapeType is invalid
 */
export function generateGameShapes(count, targetShapeType) {
    // Input validation
    if (typeof count !== 'number' || count <= 0) {
        throw new Error('generateGameShapes requires a positive number for count');
    }

    if (typeof targetShapeType !== 'string' || targetShapeType.trim().length === 0) {
        throw new Error('generateGameShapes requires a valid target shape type');
    }

    // Clear any existing shapes
    gameState.shapes = [];

    // Get current game board dimensions for positioning calculations
    const boardWidth = elements.gameBoard.clientWidth;
    const boardHeight = elements.gameBoard.clientHeight;

    // Store board dimensions for proportional resize handling
    gameState._boardWidth = boardWidth;
    gameState._boardHeight = boardHeight;

    // Safety check - ensure the board has reasonable dimensions
    if (boardWidth < 100 || boardHeight < 100) {
        // Force minimum dimensions if board is too small
        setTimeout(() => {
            elements.gameBoard.style.minHeight = "300px";
            elements.gameBoard.style.minWidth = "300px";
            // Retry with proper dimensions after DOM update
            setTimeout(() => generateGameShapes(count, targetShapeType), 100);
        }, 0);
        return;
    }

    // Get difficulty settings for this generation
    const diffSettings = gameConfig.difficulty[gameState.currentDifficulty];

    // Get available shapes for current difficulty
    const availableShapes = getAvailableShapes();

    // Use the target color that was set when creating the target shape
    const targetShapeColor = gameState.targetColor;

    // Fallback color selection if target color is missing
    if (!targetShapeColor) {
        gameState.targetColor = getRandomItem(gameConfig.colors);
    }

    // Prepare the color palette for this round
    let roundColors = [...gameConfig.colors];

    // Ensure the target color is included in our palette
    if (!roundColors.includes(targetShapeColor)) {
        roundColors.push(targetShapeColor);
    }

    // Apply distinct colors rule for easy mode
    if (diffSettings.distinctColors) {
        shuffleArray(roundColors);
        // Limit to enough distinct colors for all shapes plus target
        roundColors = roundColors.slice(0, count + 1);

        // Double-check that target color survived the slicing
        if (!roundColors.includes(targetShapeColor)) {
            roundColors[0] = targetShapeColor; // Replace one color with target color
        }
    }

    // Calculate responsive shape sizes based on screen dimensions
    let minSize = 60; // Base minimum size
    let maxSize = 100; // Base maximum size

    // Adjust sizes for different screen categories
    if (window.innerWidth > 1200) {
        // Large desktop screens: bigger shapes for better visibility
        minSize = 75;
        maxSize = 120;
    } else if (window.innerWidth <= 768) {
        // Tablet screens: medium sizes
        minSize = 50;
        maxSize = 85;
    } else if (window.innerWidth <= 480) {
        // Mobile screens: smaller shapes to fit more
        minSize = 40;
        maxSize = 70;
    }

    // Adaptive shape count based on available screen space
    const boardArea = boardWidth * boardHeight;
    const screenBasedMaxShapes = Math.min(count, Math.floor(boardArea / 20000));
    const adjustedCount = Math.max(5, screenBasedMaxShapes); // Never go below 5 shapes

    // Tracking variables for ensuring puzzle solvability
    let shapeMatchAdded = false;    // Has a target shape been added?
    let colorMatchAdded = false;    // Has the target color been used?
    let perfectMatchAdded = false;  // Has a perfect shape+color match been added?

    // Grid-based positioning system for better shape distribution
    const gridCellSize = Math.max(maxSize * 1.5, 150); // Cells must fit largest shapes
    const gridColumns = Math.floor(boardWidth / gridCellSize);
    const gridRows = Math.floor(boardHeight / gridCellSize);

    // Create array of available grid positions
    const gridCells = [];
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridColumns; col++) {
            gridCells.push({
                row,
                col,
                x: col * gridCellSize,
                y: row * gridCellSize,
                width: gridCellSize,
                height: gridCellSize,
                occupied: false
            });
        }
    }

    // Shuffle grid cells for random positioning
    shuffleArray(gridCells);

    // Generate shapes with improved distribution
    for (let i = 0; i < adjustedCount; i++) {
        let shapeType, shapeColor;
        let isMatch = false;

        // For medium and hard difficulties, ensure first shape is a perfect match
        if (i === 0 && (gameState.currentDifficulty === 'medium' || gameState.currentDifficulty === 'hard')) {
            // First shape will be a perfect match (shape + color)
            shapeType = targetShapeType;
            shapeColor = targetShapeColor;
            shapeMatchAdded = true;
            colorMatchAdded = true;
            perfectMatchAdded = true;
            isMatch = true;
        }
        // For easy mode, ensure first shape matches just the shape
        else if (i === 0 && gameState.currentDifficulty === 'easy') {
            shapeType = targetShapeType;
            // Random color in easy mode (but not the target color to make the game more interesting)
            do {
                shapeColor = getRandomItem(roundColors);
            } while (shapeColor === targetShapeColor);
            shapeMatchAdded = true;
            isMatch = true;
        }
        // For remaining shapes, distribute randomly
        else {
            // Decide whether this should be a target shape
            if (i < adjustedCount / 3 || Math.random() < 0.7) {
                do {
                    shapeType = getRandomItem(availableShapes);
                } while (shapeType === targetShapeType);
            } else {
                shapeType = targetShapeType;
                shapeMatchAdded = true;
            }

            // Decide color
            if (Math.random() < 0.2 && !colorMatchAdded && gameState.currentDifficulty !== 'easy') {
                shapeColor = targetShapeColor;
                colorMatchAdded = true;
            } else {
                shapeColor = getRandomItem(roundColors);
            }

            // Set isMatch based on difficulty
            if (gameState.currentDifficulty === 'easy') {
                isMatch = (shapeType === targetShapeType);
            } else {
                isMatch = (shapeType === targetShapeType && shapeColor === targetShapeColor);
            }
        }

        const shapeSize = getRandomNumber(minSize, maxSize);

        // Get a grid cell for this shape
        let cell = null;
        if (gridCells.length > 0) {
            cell = gridCells.pop(); // Take a cell from the shuffled array
        } else {
            break;
        }

        // Calculate position within the grid cell (add some randomness within the cell)
        const cellPadding = 10;
        const maxOffsetX = cell.width - shapeSize - (cellPadding * 2);
        const maxOffsetY = cell.height - shapeSize - (cellPadding * 2);

        const offsetX = maxOffsetX > 0 ? getRandomNumber(cellPadding, maxOffsetX) : cellPadding;
        const offsetY = maxOffsetY > 0 ? getRandomNumber(cellPadding, maxOffsetY) : cellPadding;

        const posX = cell.x + offsetX;
        const posY = cell.y + offsetY;

        // Determine z-index based on match status and random factor for better overlap distribution
        let zIndex = isMatch ? 20 : Math.floor(Math.random() * 10) + 1;

        // Every nth shape should have a higher z-index to distribute visibility
        if (i % 3 === 0) {
            zIndex += 5;
        }

        // For the first few shapes, ensure higher z-index for visibility
        if (i < 3) {
            zIndex += 10;
        }

        const shape = {
            type: shapeType,
            color: shapeColor,
            size: shapeSize,
            rotation: getRandomNumber(
                diffSettings.rotationRange.min,
                diffSettings.rotationRange.max
            ),
            isMatch: isMatch,
            x: posX,
            y: posY,
            // For moving shapes mode
            vx: 0,
            vy: 0,
            element: null, // Reference to DOM element
            zIndex: zIndex
        };

        gameState.shapes.push(shape);
    }

    // If we ran out of grid cells, handle remaining shapes with random positioning
    if (gameState.shapes.length < adjustedCount) {
        const remainingCount = adjustedCount - gameState.shapes.length;
        for (let i = 0; i < remainingCount; i++) {
            // Generate shape type and color as before
            let shapeType, shapeColor;
            let isMatch = false;

            // Logic for shape type and color (same as above)
            if (Math.random() < 0.7) {
                do {
                    shapeType = getRandomItem(availableShapes);
                } while (shapeType === targetShapeType);
            } else {
                shapeType = targetShapeType;
                shapeMatchAdded = true;
            }

            if (Math.random() < 0.2 && !colorMatchAdded && gameState.currentDifficulty !== 'easy') {
                shapeColor = targetShapeColor;
                colorMatchAdded = true;
            } else {
                shapeColor = getRandomItem(roundColors);
            }

            // Set isMatch based on difficulty
            if (gameState.currentDifficulty === 'easy') {
                isMatch = (shapeType === targetShapeType);
            } else {
                isMatch = (shapeType === targetShapeType && shapeColor === targetShapeColor);
            }

            const shapeSize = getRandomNumber(minSize, maxSize);

            // Random position with edge margin
            const edgeMargin = 20;
            const posX = getRandomNumber(edgeMargin, boardWidth - shapeSize - edgeMargin);
            const posY = getRandomNumber(edgeMargin, boardHeight - shapeSize - edgeMargin);

            let zIndex = isMatch ? 20 : Math.floor(Math.random() * 10) + 1;

            const shape = {
                type: shapeType,
                color: shapeColor,
                size: shapeSize,
                rotation: getRandomNumber(
                    diffSettings.rotationRange.min,
                    diffSettings.rotationRange.max
                ),
                isMatch: isMatch,
                x: posX,
                y: posY,
                vx: 0,
                vy: 0,
                element: null,
                zIndex: zIndex
            };

            gameState.shapes.push(shape);
        }
    }

    // Double-check that we have at least one correctly matching shape
    let hasCorrectMatch = gameState.shapes.some(shape => shape.isMatch);

    if (!hasCorrectMatch) {
        // Replace the last shape with an appropriate match
        const lastIndex = gameState.shapes.length - 1;
        const lastShape = gameState.shapes[lastIndex];

        lastShape.type = targetShapeType;
        lastShape.zIndex = 30; // Very high z-index to ensure visibility

        // For medium/hard, color must match too
        if (gameState.currentDifficulty !== 'easy') {
            lastShape.color = targetShapeColor;
        }

        lastShape.isMatch = true;

        // Position in a more central area
        lastShape.x = boardWidth / 2 - lastShape.size / 2 + getRandomNumber(-50, 50);
        lastShape.y = boardHeight / 2 - lastShape.size / 2 + getRandomNumber(-50, 50);
    }

    // Ensure matching shapes are distributed around the board (not all in one area)
    const matchingShapes = gameState.shapes.filter(shape => shape.isMatch);
    if (matchingShapes.length > 1) {
        // If we have multiple matching shapes, ensure they're in different quadrants
        const quadrants = [
            { minX: 0, maxX: boardWidth / 2, minY: 0, maxY: boardHeight / 2 },             // top-left
            { minX: boardWidth / 2, maxX: boardWidth, minY: 0, maxY: boardHeight / 2 },     // top-right
            { minX: 0, maxX: boardWidth / 2, minY: boardHeight / 2, maxY: boardHeight },    // bottom-left
            { minX: boardWidth / 2, maxX: boardWidth, minY: boardHeight / 2, maxY: boardHeight } // bottom-right
        ];

        // Shuffle quadrants
        shuffleArray(quadrants);

        // Move some matching shapes to different quadrants
        for (let i = 0; i < Math.min(matchingShapes.length, quadrants.length); i++) {
            const shape = matchingShapes[i];
            const quadrant = quadrants[i];

            // Keep a margin from edges
            const margin = Math.max(30, shape.size / 2);

            // Place within the quadrant with some randomness
            shape.x = getRandomNumber(quadrant.minX + margin, quadrant.maxX - shape.size - margin);
            shape.y = getRandomNumber(quadrant.minY + margin, quadrant.maxY - shape.size - margin);
        }
    }

    // Ensure shapes have proper z-index values
    gameState.shapes.forEach(shape => {
        if (shape.isMatch) {
            shape.zIndex += 10; // Ensure matching shapes have higher z-index
        }
    });

    // Assign velocity for moving shapes mode if active
    if (gameState.currentDifficulty === 'hard') {
        const movementSettings = gameConfig.difficulty[gameState.currentDifficulty].movementSpeed;
        gameState.shapes.forEach(shape => {
            const speedRange = movementSettings.max - movementSettings.min;
            shape.vx = (Math.random() * speedRange + movementSettings.min) * (Math.random() > 0.5 ? 1 : -1);
            shape.vy = (Math.random() * speedRange + movementSettings.min) * (Math.random() > 0.5 ? 1 : -1);
        });
    }

    // Render all shapes on the game board
    renderShapes();
}

// Start a new round with a new target shape and new game shapes
export function startNewRound() {
    clearGameBoard();

    // Ensure game board has proper dimensions before generating shapes
    ensureGameBoardDimensions();

    // Get available shapes for current difficulty
    const availableShapes = getAvailableShapes();

    // Generate a random target shape
    const randomShapeType = getRandomItem(availableShapes);
    createTargetShape(randomShapeType);

    // Generate random shapes for the game board
    generateGameShapes(gameState.shapesQuantity, randomShapeType);

    // Start moving shapes if in hard mode
    if (gameState.currentDifficulty === 'hard') {
        startMovingShapes();
    }
}

// Handle moving shapes and make them properly clickable
export function startMovingShapes() {
    // Stop any existing movement
    stopMovingShapes();

    // Animation function for moving shapes
    function moveShapes() {
        // Check if game is over first - don't continue animation in that case
        if (gameState.gameOver) {
            stopMovingShapes();
            return;
        }

        // Get board dimensions
        const boardWidth = elements.gameBoard.clientWidth;
        const boardHeight = elements.gameBoard.clientHeight;

        // Safety check - if board dimensions are invalid, don't continue
        if (boardWidth <= 0 || boardHeight <= 0) {
            stopMovingShapes();
            return;
        }

        // Move each shape
        if (!gameState.shapes || gameState.shapes.length === 0) {
            stopMovingShapes();
            return;
        }

        gameState.shapes.forEach(shape => {
            // Skip if shape is invalid
            if (!shape) return;

            // Update position
            shape.x += shape.vx;
            shape.y += shape.vy;

            // Boundary collision detection
            let shapeWidth = shape.size;
            let shapeHeight = shape.size;

            // Adjust dimensions for non-square shapes
            if (shape.type === 'rectangle' || shape.type === 'oval') {
                shapeWidth = shape.size * 1.5;
                shapeHeight = shape.size * 0.75;
            }

            // Check horizontal boundaries
            if (shape.x <= 0 || shape.x + shapeWidth >= boardWidth) {
                shape.vx *= -1; // Reverse horizontal direction

                // Ensure shape is within bounds
                if (shape.x <= 0) shape.x = 0;
                if (shape.x + shapeWidth >= boardWidth) shape.x = boardWidth - shapeWidth;
            }

            // Check vertical boundaries
            if (shape.y <= 0 || shape.y + shapeHeight >= boardHeight) {
                shape.vy *= -1; // Reverse vertical direction

                // Ensure shape is within bounds
                if (shape.y <= 0) shape.y = 0;
                if (shape.y + shapeHeight >= boardHeight) shape.y = boardHeight - shapeHeight;
            }

            // Update position of the existing DOM element
            if (shape.element) {
                shape.element.style.left = `${shape.x}px`;
                shape.element.style.top = `${shape.y}px`;
            }
        });

        // Only continue animation if game is not over and we have shapes
        if (!gameState.gameOver && gameState.shapes && gameState.shapes.length > 0) {
            // Store the ID so we can cancel it later
            gameState.animationFrameId = requestAnimationFrame(moveShapes);
        } else {
            stopMovingShapes();
        }
    }

    // Start animation only if we have shapes and game is not over
    if (!gameState.gameOver && gameState.shapes && gameState.shapes.length > 0) {
        // Start the first frame - subsequent frames will be requested inside moveShapes
        gameState.animationFrameId = requestAnimationFrame(moveShapes);
    }
}

// Function to stop shape movement
export function stopMovingShapes() {
    // Cancel any ongoing animation frame
    if (gameState.animationFrameId) {
        cancelAnimationFrame(gameState.animationFrameId);
        gameState.animationFrameId = null;
    }
}

// Handle shape click
export function handleShapeClick(shape, event) {
    if (gameState.gameOver) return;

    // Prevent event bubbling to avoid multiple clicks
    event.stopPropagation();

    // Check for correct match based on difficulty level
    let isCorrectMatch = false;

    if (gameState.currentDifficulty === 'easy') {
        // In easy mode, only shape type matters
        isCorrectMatch = shape.type === gameState.targetShape;
    } else {
        // In medium and hard modes, both shape type AND color must match
        isCorrectMatch = shape.type === gameState.targetShape && shape.color === gameState.targetColor;
    }

    if (isCorrectMatch) {
        // Correct match
        gameState.score++;

        // Reset attempts in Easy and Medium modes
        if (gameState.currentDifficulty !== 'hard') {
            gameState.attemptsLeft = gameConfig.maxAttempts;
        }

        updateScoreDisplay();

        // Play correct sound
        playSound('correct');

        // Launch confetti at click location
        launchConfetti(event.clientX, event.clientY);

        // Add time bonus in timed mode
        if (gameState.currentMode === 'timed') {
            const diffSettings = gameConfig.difficulty[gameState.currentDifficulty];
            let bonus = diffSettings.timeBonus.correct;

            // In easy mode, add color match bonus if colors happen to match
            if (gameState.currentDifficulty === 'easy' && shape.color === gameState.targetColor) {
                bonus += diffSettings.timeBonus.colorMatch;
            }

            gameState.timeRemaining += bonus;
            elements.timer.textContent = gameState.timeRemaining;
        }

        // Start new round after a short delay
        setTimeout(() => {
            // Only start a new round if the game is still active
            if (!gameState.gameOver) {
                startNewRound();
            }
        }, gameConfig.successDelay);
    } else {
        // Incorrect match
        gameState.attemptsLeft--;
        updateScoreDisplay();

        // Add shake animation to the clicked shape for visual feedback (accessibility)
        if (shape.element) {
            // Add the shake class
            shape.element.classList.add('shake');

            // Remove the shake class after the animation completes
            setTimeout(() => {
                if (shape.element) {
                    shape.element.classList.remove('shake');
                }
            }, 500); // Match animation duration (0.5s)
        }

        // Play wrong sound
        playSound('wrong');

        // Reduce time in timed mode
        if (gameState.currentMode === 'timed') {
            const penalty = gameConfig.difficulty[gameState.currentDifficulty].timePenalty;
            gameState.timeRemaining = Math.max(1, gameState.timeRemaining - penalty);
            elements.timer.textContent = gameState.timeRemaining;
        }

        if (gameState.attemptsLeft <= 0) {
            // Game over
            endGame();
        }
    }
}

// Update the score and attempts display with hearts for lives
export function updateScoreDisplay() {
    // Update the centered score display and add pulse animation
    elements.score.textContent = gameState.score;

    // Only add pulse animation if the score was incremented (correct match)
    if (gameState.previousScore !== undefined && gameState.score > gameState.previousScore) {
        elements.score.parentElement.classList.add('score-pulse');

        // Remove the class after animation completes
        setTimeout(() => {
            elements.score.parentElement.classList.remove('score-pulse');
        }, 500);
    }

    // Store current score for next comparison
    gameState.previousScore = gameState.score;

    // Update hearts display for remaining attempts
    if (elements.attempts) {
        let heartsDisplay = '';
        // Add full hearts for remaining attempts
        for (let i = 0; i < gameState.attemptsLeft; i++) {
            heartsDisplay += '❤️';
        }
        // Add empty hearts for lost attempts
        for (let i = gameState.attemptsLeft; i < gameConfig.maxAttempts; i++) {
            heartsDisplay += '🤍';
        }
        elements.attempts.textContent = heartsDisplay;

        // Add animation effect when losing a heart
        if (gameState.previousAttempts && gameState.previousAttempts > gameState.attemptsLeft) {
            elements.attempts.classList.add('heart-pulse');
            setTimeout(() => {
                elements.attempts.classList.remove('heart-pulse');
            }, 500);
        }

        // Store current attempts for next comparison
        gameState.previousAttempts = gameState.attemptsLeft;

        // Add aria-label for screen readers to announce attempts left
        elements.attempts.setAttribute('aria-label', `${gameState.attemptsLeft} attempts remaining`);
    }

    // If this is the first successful match, fade out the match instructions
    if (gameState.score === 1) {
        fadeOutMatchInstructions();
    }
}

// Fade out match instructions after first successful identification
export function fadeOutMatchInstructions() {
    const instructionElement = document.getElementById('match-instructions');
    if (instructionElement) {
        // Add transition for smooth fade out
        instructionElement.style.transition = 'opacity 1.5s ease-out';
        instructionElement.style.opacity = '0';

        // Remove from DOM after fade completes
        setTimeout(() => {
            if (instructionElement.parentNode) {
                instructionElement.parentNode.removeChild(instructionElement);
            }
        }, 1500);
    }
}

// Launch confetti animation
export function launchConfetti(x, y) {
    // Make sure canvas is properly sized
    resizeConfettiCanvas();

    // Cancel any existing confetti animation first
    if (gameState.confettiAnimationId) {
        cancelAnimationFrame(gameState.confettiAnimationId);
        gameState.confettiAnimationId = null;
    }

    // Show canvas and ensure it remains visible during animation
    elements.confettiCanvas.classList.remove('hidden');
    elements.confettiCanvas.style.zIndex = "100"; // Set high z-index

    // Create confetti particles
    const particles = [];
    const particleCount = gameConfig.confetti.particleCount;
    const gravity = gameConfig.confetti.gravity;
    const colors = gameConfig.confetti.colors;
    const spread = gameConfig.confetti.spread;
    const velocityFactor = gameConfig.confetti.velocityFactor;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            velocity: {
                x: (Math.random() * spread - spread / 2) * velocityFactor,
                y: (Math.random() * -15 - 10) * velocityFactor
            },
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5,
            opacity: 1 // Start fully opaque
        });
    }

    // Get confetti canvas context
    const confettiCtx = elements.confettiCanvas.getContext('2d');

    // Track animation state
    let animationCompleted = false;
    let animationDuration = 0;
    const MAX_ANIMATION_TIME = 3000; // 3 seconds max

    // Animation function
    function animateConfetti(timestamp) {
        // If this is the first frame, initialize the start time
        if (!animationDuration) {
            animationDuration = 0;
        } else {
            // Track animation duration to prevent endless animations
            animationDuration += 16; // Approximate frame time
        }

        // Clear the canvas for this frame
        confettiCtx.clearRect(0, 0, elements.confettiCanvas.width, elements.confettiCanvas.height);

        let stillActive = false;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Only continue animation if:
            // 1. Particle is still on screen vertically
            // 2. Particle still has some opacity
            // 3. We haven't exceeded max animation time
            if (p.y < elements.confettiCanvas.height + 100 && p.opacity > 0.1 && animationDuration < MAX_ANIMATION_TIME) {
                stillActive = true;

                // Draw particle with current opacity
                confettiCtx.save();
                confettiCtx.globalAlpha = p.opacity;
                confettiCtx.translate(p.x, p.y);
                confettiCtx.rotate(p.rotation * Math.PI / 180);
                confettiCtx.fillStyle = p.color;
                confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                confettiCtx.restore();

                // Update position
                p.x += p.velocity.x;
                p.y += p.velocity.y;

                // Apply gravity
                p.velocity.y += gravity;

                // Update rotation
                p.rotation += p.rotationSpeed;

                // Gradually reduce opacity as particle falls
                // This creates a fade-out effect
                if (p.y > elements.confettiCanvas.height - 200) {
                    p.opacity -= 0.02; // Fade out gradually
                }
            }
        }

        // Continue animation if there are still visible particles and game is not over
        if (stillActive && !gameState.gameOver && animationDuration < MAX_ANIMATION_TIME) {
            // Store the animation ID in gameState so it can be canceled if needed
            gameState.confettiAnimationId = requestAnimationFrame(animateConfetti);
        } else {
            // Stop the animation when all particles are gone or game is over
            finalizeAnimation();
        }
    }

    // Function to ensure proper cleanup when animation ends
    function finalizeAnimation() {
        // Only run this once
        if (animationCompleted) return;
        animationCompleted = true;

        // Cancel any lingering animation frames
        if (gameState.confettiAnimationId) {
            cancelAnimationFrame(gameState.confettiAnimationId);
            gameState.confettiAnimationId = null;
        }

        // Ensure canvas is completely cleared
        confettiCtx.clearRect(0, 0, elements.confettiCanvas.width, elements.confettiCanvas.height);

        // Hide the canvas properly
        elements.confettiCanvas.classList.add('hidden');

    }

    // Start animation
    gameState.confettiAnimationId = requestAnimationFrame(animateConfetti);

    // Safety timeout - force cleanup if animation somehow gets stuck
    setTimeout(finalizeAnimation, MAX_ANIMATION_TIME + 100);
}

// Play sound effect
export function playSound(type) {
    if (gameState.muted) return;

    const sounds = {
        correct: elements.correctSound,
        wrong: elements.wrongSound,
        gameover: elements.gameoverSound
    };

    const sound = sounds[type];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

// End the game
export function endGame() {
    gameState.gameOver = true;

    // Stop any timers or animations
    stopTimer();
    stopMovingShapes();

    // Update final score
    elements.finalScore.textContent = gameState.score;

    // Play game over sound
    playSound('gameover');

    // Show game over screen
    elements.gameOverScreen.classList.remove('hidden');

    // Save high score
    saveHighScore();
}

// Hide game over screen
export function hideGameOverScreen() {
    elements.gameOverScreen.classList.add('hidden');
}

// Start the timer for timed mode
export function startTimer() {
    // Clear any existing timer
    stopTimer();

    // Start new timer interval
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        elements.timer.textContent = gameState.timeRemaining;

        // Check for time up
        if (gameState.timeRemaining <= 0) {
            stopTimer();
            endGame();
        }
    }, 1000);
}

// Stop the timer
export function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// Save high score and return position information
export function saveHighScore() {
    // Only save if score is greater than 0
    if (gameState.score > 0) {
        // Get existing high scores for the current mode
        let highScores = loadHighScoresByMode(gameState.currentMode);

        // Create new score entry
        const scoreEntry = {
            name: gameState.playerName,
            score: gameState.score,
            difficulty: gameState.currentDifficulty,
            mode: gameState.currentMode,
            date: new Date().toISOString()
        };

        // Add new score
        highScores.push(scoreEntry);

        // Sort by score (descending)
        highScores.sort((a, b) => b.score - a.score);

        // Get player's position in leaderboard
        const playerPosition = highScores.findIndex(score =>
            score.name === scoreEntry.name &&
            score.score === scoreEntry.score &&
            score.date === scoreEntry.date
        ) + 1;

        // Keep only top 10
        highScores = highScores.slice(0, 10);

        // Save back to local storage with mode prefix
        localStorage.setItem(`shapeGameHighScores_${gameState.currentMode}`, JSON.stringify(highScores));

        // Show leaderboard position message on game over screen
        if (playerPosition <= 10) {
            showLeaderboardPosition(playerPosition);
        }

        return playerPosition;
    }

    return 0;
}

// Show the player's position on the leaderboard on the game over screen
export function showLeaderboardPosition(position) {
    // Check if an element already exists
    let leaderboardPositionElement = document.getElementById('leaderboard-position');

    if (!leaderboardPositionElement) {
        // Create the element
        leaderboardPositionElement = document.createElement('div');
        leaderboardPositionElement.id = 'leaderboard-position';
        leaderboardPositionElement.className = 'leaderboard-position';
        // Add ARIA attributes for accessibility
        leaderboardPositionElement.setAttribute('role', 'status');
        leaderboardPositionElement.setAttribute('aria-live', 'polite');

        // Insert it after the final score
        const finalScoreParent = elements.finalScore.parentNode;
        finalScoreParent.parentNode.insertBefore(leaderboardPositionElement, finalScoreParent.nextSibling);
    }

    // Set the text and class based on position
    let positionText = '';
    let ariaLabel = '';

    if (position === 1) {
        positionText = '🏆 You got 1st place on the leaderboard! 🏆';
        ariaLabel = 'Congratulations! You achieved first place on the leaderboard!';
        leaderboardPositionElement.classList.add('top-three');
    } else if (position === 2) {
        positionText = '🥈 You got 2nd place on the leaderboard! 🥈';
        ariaLabel = 'Great job! You achieved second place on the leaderboard!';
        leaderboardPositionElement.classList.add('top-three');
    } else if (position === 3) {
        positionText = '🥉 You got 3rd place on the leaderboard! 🥉';
        ariaLabel = 'Well done! You achieved third place on the leaderboard!';
        leaderboardPositionElement.classList.add('top-three');
    } else {
        positionText = `You ranked #${position} on the leaderboard!`;
        ariaLabel = `You ranked number ${position} on the leaderboard!`;
        leaderboardPositionElement.classList.remove('top-three');
    }

    leaderboardPositionElement.textContent = positionText;
    leaderboardPositionElement.setAttribute('aria-label', ariaLabel);

    // Announce the leaderboard position to screen readers
    announceTo('assertive', ariaLabel);
}

// Load high scores by game mode
export function loadHighScoresByMode(mode) {
    return JSON.parse(localStorage.getItem(`shapeGameHighScores_${mode}`) || '[]');
}

// Force game board to have proper dimensions
export function ensureGameBoardDimensions() {
    // Get the game board element
    const gameBoard = elements.gameBoard;

    // Set minimum dimensions
    gameBoard.style.minHeight = '300px';
    gameBoard.style.minWidth = '300px';

    // Force layout recalculation
    void gameBoard.offsetHeight;

    // If dimensions are still problematic, set explicit dimensions
    if (gameBoard.clientWidth < 300 || gameBoard.clientHeight < 300) {
        gameBoard.style.height = '70vh';
        gameBoard.style.width = '100%';
    }
}
