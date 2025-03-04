// main.js
import {
    showLoadingSpinner,
    hideLoadingSpinner,
    updateReviewStatus
} from './utility_functions.js';
import { fetchCurrentRecord, fetchUpcomingRecords } from './record_fetching.js';
import { setupEventListeners } from './button_handlers.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, initializing...');

    let assignmentCounter = 0;

    function autosave() {
        console.log('Attempting autosave...');
        fetch('/autosave_review_results', { method: 'POST' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Autosave failed');
                }
                console.log('Autosave successful');
            })
            .catch(error => {
                console.error('Error during autosave:', error);
            });
    }

    function incrementAssignmentCounter() {
        assignmentCounter++;
        console.log(`Assignment counter: ${assignmentCounter}`);
        if (assignmentCounter >= 25) {
            autosave();
            assignmentCounter = 0;
        }
    }

    // Make functions available globally
    window.incrementAssignmentCounter = incrementAssignmentCounter;
    window.autosave = autosave;

    // Initialize the application
    async function initializeApp() {
        try {
            console.log('Starting initialization...');

            // Make sure DOM is ready
            await new Promise(resolve => setTimeout(resolve, 100));

            // Set up event listeners first
            setupEventListeners();
            console.log('Event listeners set up');

            // Then load data
            await updateReviewStatus();
            await fetchCurrentRecord();
            await fetchUpcomingRecords();

            console.log('Initialization complete');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    // Start the initialization process
    initializeApp();

    // Add error handling for global promise rejections
    window.addEventListener('unhandledrejection', event => {
        console.error('Unhandled promise rejection:', event.reason);
    });
});