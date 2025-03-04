// button_handlers.js
import {
    showLoadingSpinner,
    hideLoadingSpinner,
    logResponse,
    updateReviewStatus
} from './utility_functions.js';
import { fetchCurrentRecord, fetchUpcomingRecords } from './record_fetching.js';

// Error handler
function handleError(error, message = 'No more records to review') {
    console.error('Error:', error);
    const container = document.getElementById('record-container');
    container.innerHTML = `<p>${message}</p>`;

    ['match-btn', 'no-match-btn', 'unsure-btn'].forEach(btnId => {
        document.getElementById(btnId).disabled = true;
    });
}

// Process functions
async function processMatch() {
    showLoadingSpinner();
    try {
        const response = await fetch('/match', { method: 'POST' });
        const data = await response.json();
        console.log('Match processed:', data);
        await fetchCurrentRecord();
        return data;
    } catch (error) {
        console.error('Error processing match:', error);
        throw error;
    } finally {
        hideLoadingSpinner();
    }
}

async function processNoMatch() {
    showLoadingSpinner();
    try {
        const response = await fetch('/no_match', { method: 'POST' });
        const data = await response.json();
        console.log('No match processed:', data);
        await fetchCurrentRecord();
        return data;
    } catch (error) {
        console.error('Error processing no match:', error);
        throw error;
    } finally {
        hideLoadingSpinner();
    }
}

async function processUnsure() {
    showLoadingSpinner();
    try {
        const response = await fetch('/unsure', { method: 'POST' });
        const data = await response.json();
        console.log('Unsure processed:', data);
        await fetchCurrentRecord();
        return data;
    } catch (error) {
        console.error('Error processing unsure:', error);
        throw error;
    } finally {
        hideLoadingSpinner();
    }
}

// Setup function to add all event listeners
function setupEventListeners() {
    // Match button handler

        // Check if all required elements exist
    const matchBtn = document.getElementById('match-btn');
    const noMatchBtn = document.getElementById('no-match-btn');
    const unsureBtn = document.getElementById('unsure-btn');
    const goBackBtn = document.getElementById('go-back-btn');
    const exportBtn = document.getElementById('export-btn');

    if (!matchBtn || !noMatchBtn || !unsureBtn || !goBackBtn || !exportBtn) {
        console.error('Some required buttons are missing from the DOM:', {
            matchBtn: !!matchBtn,
            noMatchBtn: !!noMatchBtn,
            unsureBtn: !!unsureBtn,
            goBackBtn: !!goBackBtn,
            exportBtn: !!exportBtn
        });
        return;
    }

    document.getElementById('match-btn').addEventListener('click', async () => {
        try {
            console.log('Match button clicked');
            await processMatch();
            await fetchUpcomingRecords();
            await updateReviewStatus();
            window.incrementAssignmentCounter();
        } catch (error) {
            handleError(error);
        }
    });

    // No Match button handler
    document.getElementById('no-match-btn').addEventListener('click', async () => {
        try {
            console.log('No Match button clicked');
            await processNoMatch();
            await fetchUpcomingRecords();
            await updateReviewStatus();
            window.incrementAssignmentCounter();
        } catch (error) {
            handleError(error);
        }
    });

    // Unsure button handler
    document.getElementById('unsure-btn').addEventListener('click', async () => {
        try {
            console.log('Unsure button clicked');
            await processUnsure();
            await fetchUpcomingRecords();
            await updateReviewStatus();
            window.incrementAssignmentCounter();
        } catch (error) {
            handleError(error);
        }
    });

    // Go Back One button handler
    document.getElementById('go-back-btn').addEventListener('click', async () => {
        try {
            console.log('Go Back button clicked');
            showLoadingSpinner();
            const response = await fetch('/go_back_one', { method: 'POST' });

            if (!response.ok) {
                throw new Error('No previous records');
            }

            const record = await response.json();
            console.log('Go Back response:', record);

            if (record.error) {
                throw new Error(record.error);
            }

            // Update the record display
            const container = document.getElementById('record-container');
            container.innerHTML = `
                <h2>Organization Details</h2>
                <div>
                    <h3>Info</h3>
                    <p><strong class="tooltip">Name:<span class="tooltiptext">The official name of the organization</span></strong> ${record.org_name}</p>
                    <p><strong class="tooltip">ConnectHub Org ID:<span class="tooltiptext">Unique identifier for the organization in ConnectHub</span></strong> ${record.connecthub_org_id}</p>
                    <p><strong class="tooltip">ConnectHub Display Label:<span class="tooltiptext">The display label for the organization in ConnectHub</span></strong> ${record.connecthub_display_label}</p>
                    <p><strong class="tooltip">Match Score:<span class="tooltiptext">The confidence score of the match</span></strong> ${record.match_score}</p>
                    <p><strong class="tooltip">NPI Count:<span class="tooltiptext">Number of National Provider Identifiers associated with the organization</span></strong> ${record.npi_count}</p>
                </div>
                <div>
                    <h3>Input</h3>
                    <p><strong class="tooltip">Input Label:<span class="tooltiptext">The label provided for matching</span></strong> ${record.input_label}</p>
                    <p><strong class="tooltip">Input States:<span class="tooltiptext">The states associated with the input label</span></strong> ${record.input_states}</p>
                </div>
                <div>
                    <h3>ConnectHub</h3>
                    <p><strong class="tooltip">ConnectHub Label:<span class="tooltiptext">The label in ConnectHub for the organization</span></strong> ${record.connecthub_label}</p>
                    <p><strong class="tooltip">ConnectHub States:<span class="tooltiptext">The states associated with the ConnectHub label</span></strong> ${record.connecthub_states}</p>
                </div>
            `;

            await updateReviewStatus();
            await fetchUpcomingRecords();
        } catch (error) {
            handleError(error, 'No previous records to review');
        } finally {
            hideLoadingSpinner();
        }
    });

    //
    // In button_handlers.js, update the export button handler in the setupEventListeners function:

    // Export results handler
        // Export results handler
    exportBtn.addEventListener('click', async () => {
        try {
            console.log('Export button clicked');
            showLoadingSpinner();

            const response = await fetch('/export_review_results');
            console.log('Export response:', response);

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            console.log('Received blob:', blob);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `review_results_${new Date().toISOString().replace(/:/g, '-')}.csv`;

            document.body.appendChild(a);
            console.log('Triggering download...');
            a.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                console.log('Download cleanup completed');
            }, 100);

        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export results. Please try again.');
        } finally {
            hideLoadingSpinner();
        }
    });
    console.log('All event listeners set up successfully');

}

// Export necessary functions
export { processMatch, processNoMatch, processUnsure, setupEventListeners };