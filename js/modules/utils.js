/**
 * Collection of utility functions used throughout the game.
 * @fileoverview Pure helper functions for randomization, string formatting, and accessibility.
 * @author WebDevGuy
 * @version 1.0.0
 */

/**
 * Selects a random item from an array.
 * @param {Array} array - The array to select from
 * @returns {*} A randomly selected item from the array
 * @throws {Error} If array is empty or not an array
 */
export function getRandomItem(array) {
    if (!Array.isArray(array) || array.length === 0) {
        throw new Error('getRandomItem requires a non-empty array');
    }

    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer between min and max
 * @throws {Error} If min is greater than max or if parameters aren't numbers
 */
export function getRandomNumber(min, max) {
    if (typeof min !== 'number' || typeof max !== 'number') {
        throw new Error('getRandomNumber requires numeric parameters');
    }

    if (min > max) {
        throw new Error('Min value cannot be greater than max value');
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * Modifies the original array rather than creating a copy.
 * @param {Array} array - The array to shuffle (modified in place)
 * @returns {Array} The same array, now shuffled
 * @throws {Error} If parameter is not an array
 */
export function shuffleArray(array) {
    if (!Array.isArray(array)) {
        throw new Error('shuffleArray requires an array parameter');
    }

    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // ES6 destructuring swap
    }

    return array;
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} string - The string to capitalize
 * @returns {string} String with first letter capitalized
 * @throws {Error} If parameter is not a string
 */
export function capitalize(string) {
    if (typeof string !== 'string') {
        throw new Error('capitalize requires a string parameter');
    }

    if (string.length === 0) {
        return string;
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Announces a message to screen readers without visual display.
 * Creates a temporary hidden DOM element with aria-live for screen reader announcements.
 * @param {'polite'|'assertive'} priority - How urgently screen readers should announce this
 * @param {string} message - The message to announce to screen reader users
 * @returns {void}
 * @throws {Error} If priority is not 'polite' or 'assertive', or if message is not a string
 */
export function announceTo(priority, message) {
    if (priority !== 'polite' && priority !== 'assertive') {
        throw new Error('announceTo priority must be "polite" or "assertive"');
    }

    if (typeof message !== 'string') {
        throw new Error('announceTo message must be a string');
    }

    if (message.trim().length === 0) {
        return; // Don't announce empty messages
    }

    // Create a hidden element for the announcement
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('role', 'status');
    announcer.className = 'sr-only'; // Screen reader only - hidden from visual display
    announcer.textContent = message;

    // Add to DOM so screen readers can detect it
    document.body.appendChild(announcer);

    // Remove after announcement (screen readers need time to process)
    setTimeout(() => {
        if (document.body.contains(announcer)) {
            document.body.removeChild(announcer);
        }
    }, 1000);

}
