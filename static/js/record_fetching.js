function fetchCurrentRecord() {
    console.log('Fetching current record...'); // Debug log
    showLoadingSpinner();
    return fetch('/current_record')
        .then(response => {
            console.log('Current record response:', response); // Debug log
            logResponse(response);
            if (!response.ok) {
                throw new Error('No more records');
            }
            return response.json();
        })
        .then(record => {
            console.log('Received record:', record); // Debug log
            const container = document.getElementById('record-container');
            container.innerHTML = `
                <!-- Your existing HTML template -->
            `;

            // Call updateReviewStatus and wait for it to complete
            return updateReviewStatus().then(() => record);
        })
        .catch(error => {
            console.error('Error:', error);
            const container = document.getElementById('record-container');
            container.innerHTML = '<p>No more records to review</p>';

            // Disable buttons when no records are left
            ['match-btn', 'no-match-btn', 'unsure-btn'].forEach(btnId => {
                document.getElementById(btnId).disabled = true;
            });
            throw error;
        })
        .finally(hideLoadingSpinner);
}

function fetchUpcomingRecords() {
    fetch('/upcoming_records')
        .then(response => {
            if (!response.ok) {
                throw new Error('Could not fetch upcoming records');
            }
            return response.json();
        })
        .then(records => {
            const container = document.getElementById('upcoming-records');
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Input Label</th>
                            <th>ConnectHub Label</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${records.map(record => `
                            <tr>
                                <td>${record.input_label}</td>
                                <td>${record.connecthub_label}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        })
        .catch(error => {
            console.error('Error fetching upcoming records:', error);
            const container = document.getElementById('upcoming-records');
            container.innerHTML = '<p>Could not load upcoming records</p>';
        });
}

// Export functions to be used in other files
export { fetchCurrentRecord, fetchUpcomingRecords };