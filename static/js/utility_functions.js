// utility_functions.js
export function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
}

export function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

export function logResponse(response) {
    console.log('Response status:', response.status);
    console.log('Response body:', response);
}

export function updateReviewStatus() {
    return fetch('/review_status')
        .then(response => {
            if (!response.ok) {
                throw new Error('Could not fetch review status');
            }
            return response.json();
        })
        .then(status => {
            document.getElementById('current-record').textContent = status.current_index + 1;
            document.getElementById('total-records').textContent = status.total_records;
            document.getElementById('matched-count').textContent = status.matched_count;
            document.getElementById('unmatched-count').textContent = status.unmatched_count;
        })
        .catch(error => {
            console.error('Error updating status:', error);
        });
}

// Autosave function
function autosave() {
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

// Increment assignment counter and check for autosave
function incrementAssignmentCounter() {
    assignmentCounter++;
    if (assignmentCounter >= 25) {
        autosave();
        assignmentCounter = 0; // Reset counter after autosave
    }
}
