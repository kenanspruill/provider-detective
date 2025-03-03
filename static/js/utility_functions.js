function logResponse(response) {
    console.log('Response status:', response.status);
    console.log('Response body:', response);
}

function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

function updateReviewStatus() {
    console.log('Updating review status...'); // Debug log
    return fetch('/review_status')
        .then(response => {
            console.log('Review status response:', response); // Debug log
            if (!response.ok) {
                throw new Error('Could not fetch review status');
            }
            return response.json();
        })
        .then(status => {
            console.log('Received status:', status); // Debug log
            document.getElementById('current-record').textContent = status.current_index + 1;
            document.getElementById('total-records').textContent = status.total_records;
            document.getElementById('matched-count').textContent = status.matched_count;
            document.getElementById('unmatched-count').textContent = status.unmatched_count;
        })
        .catch(error => {
            console.error('Error updating status:', error);
        });
}