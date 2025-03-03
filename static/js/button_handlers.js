// Make sure these functions are available (imported from utility_functions.js)
/* global showLoadingSpinner, hideLoadingSpinner, logResponse, updateReviewStatus,
   fetchCurrentRecord, fetchUpcomingRecords, incrementAssignmentCounter */

document.addEventListener('DOMContentLoaded', () => {
    // Common error handler
    function handleError(error, message = 'No more records to review') {
        console.error('Error:', error);
        const container = document.getElementById('record-container');
        container.innerHTML = `<p>${message}</p>`;

        // Disable buttons when no records are left
        ['match-btn', 'no-match-btn', 'unsure-btn'].forEach(btnId => {
            document.getElementById(btnId).disabled = true;
        });
    }

    // Common fetch handler
    async function handleFetch(url, method = 'POST') {
        try {
            showLoadingSpinner();
            console.log(`Making ${method} request to ${url}`);

            const response = await fetch(url, { method });
            logResponse(response);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received data:', data);
            return data;
        } catch (error) {
            console.error(`Error in ${url}:`, error);
            throw error;
        }
    }

    // Match button handler
    document.getElementById('match-btn').addEventListener('click', async () => {
        try {
            console.log('Match button clicked');
            const data = await handleFetch('/match');
            await fetchCurrentRecord();
            await fetchUpcomingRecords();
            incrementAssignmentCounter();
        } catch (error) {
            handleError(error);
        } finally {
            hideLoadingSpinner();
        }
    });

    // No Match button handler
    document.getElementById('no-match-btn').addEventListener('click', async () => {
        try {
            console.log('No Match button clicked');
            const data = await handleFetch('/no_match');
            await fetchCurrentRecord();
            await fetchUpcomingRecords();
            incrementAssignmentCounter();
        } catch (error) {
            handleError(error);
        } finally {
            hideLoadingSpinner();
        }
    });

    // Unsure button handler
    document.getElementById('unsure-btn').addEventListener('click', async () => {
        try {
            console.log('Unsure button clicked');
            const data = await handleFetch('/unsure');
            await fetchCurrentRecord();
            await fetchUpcomingRecords();
            incrementAssignmentCounter();
        } catch (error) {
            handleError(error);
        } finally {
            hideLoadingSpinner();
        }
    });

    // Go Back One button handler
    document.getElementById('go-back-btn').addEventListener('click', async () => {
        try {
            console.log('Go Back button clicked');
            const record = await handleFetch('/go_back_one');

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

            updateReviewStatus();
            await fetchUpcomingRecords();
        } catch (error) {
            handleError(error, 'No previous records to review');
        } finally {
            hideLoadingSpinner();
        }
    });

    // Export results handler
    document.getElementById('export-btn').addEventListener('click', async () => {
        try {
            console.log('Export button clicked');
            showLoadingSpinner();

            const response = await fetch('/export_review_results');
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `review_results_${new Date().toISOString().replace(/:/g, '-')}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            hideLoadingSpinner();
        }
    });
});