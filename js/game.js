/**
 * Main application entry point for I Spy a Shape game.
 * Initializes event listeners, confetti canvas, and shows the setup modal.
 *
 * @fileoverview Application entry point
 * @author WebDevGuy
 * @version 1.0.0
 */

import { initEventListeners, showSetupModal } from './modules/events.js';
import { resizeConfettiCanvas } from './modules/rendering.js';
import { initAudioSettings } from './modules/elements.js';

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initAudioSettings();
    resizeConfettiCanvas();
    showSetupModal();
});
