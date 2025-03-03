// record_fetching.js

import {
    showLoadingSpinner,
    hideLoadingSpinner,
    logResponse,
    updateReviewStatus
} from './utility_functions.js';


export async function fetchCurrentRecord() {
    console.log('Fetching current record...'); // Debug log
    fetch('/current_record')
        .then(response => {
            console.log('Current record response:', response); // Debug log
            if (!response.ok) {
                throw new Error('Could not fetch current record');
            }
            return response.json();
        })
        .then(record => {
            console.log('Received current record:', record); // Debug log
            if (record.error) {
                alert(record.error);
                return;
            }
            const container = document.getElementById('current-record');
            container.innerHTML = `
                <div>
                    <h3>${record.org_name}</h3>
                    <p>ConnectHub ID: ${record.connecthub_org_id}</p>
                    <p>Display Label: ${record.connecthub_display_label}</p>
                    <p>Match Score: ${record.match_score}</p>
                    <p>NPI Count: ${record.npi_count}</p>
                    <p>Input Label: ${record.input_label}</p>
                    <p>Input States: ${record.input_states}</p>
                    <p>ConnectHub Label: ${record.connecthub_label}</p>
                    <p>ConnectHub States: ${record.connecthub_states}</p>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error fetching current record:', error);
        });
}
export async function fetchUpcomingRecords() {
    console.log('Fetching upcoming records...');
    return fetch('/upcoming_records')
        .then(response => {
            console.log('Upcoming records response:', response);
            if (!response.ok) {
                throw new Error('Could not fetch upcoming records');
            }
            return response.json();
        })
        .then(records => {
            console.log('Received upcoming records:', records);
            const container = document.getElementById('upcoming-records');

            if (!records || records.length === 0) {
                container.innerHTML = '<p>No more upcoming records</p>';
                return;
            }

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
                                <td>${record.input_label || 'N/A'}</td>
                                <td>${record.connecthub_label || 'N/A'}</td>
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
// export { fetchCurrentRecord, fetchUpcomingRecords };