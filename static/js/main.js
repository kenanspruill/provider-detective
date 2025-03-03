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
            assignmentCounter = 0; // Reset counter after autosave
        }
    }

    // Make incrementAssignmentCounter available globally
    window.incrementAssignmentCounter = incrementAssignmentCounter;

    // Initialize the application
    async function initializeApp() {
        try {
            console.log('Starting initial status update');
            await updateReviewStatus();
            console.log('Initial status update complete');

            console.log('Fetching initial record');
            await fetchCurrentRecord();
            console.log('Initial record fetch complete');

            console.log('Fetching upcoming records');
            await fetchUpcomingRecords();
            console.log('Initial upcoming records fetch complete');
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

    // Optional: Add periodic status updates
    setInterval(() => {
        updateReviewStatus()
            .then(() => console.log('Status updated'))
            .catch(error => console.error('Error updating status:', error));
    }, 30000); // Update every 30 seconds
});

// Make sure these functions are available globally if needed
window.autosave = autosave;