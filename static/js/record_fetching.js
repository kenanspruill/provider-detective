// record_fetching.js
import {
    showLoadingSpinner,
    hideLoadingSpinner,
    logResponse,
    updateReviewStatus
} from './utility_functions.js';

export async function fetchCurrentRecord() {
    console.log('Fetching current record...');
    showLoadingSpinner();

    try {
        const response = await fetch('/current_record');
        console.log('Current record response:', response);

        if (!response.ok) {
            throw new Error('Could not fetch current record');
        }

        const record = await response.json();
        console.log('Received current record:', record);

        if (record.error) {
            throw new Error(record.error);
        }

        // Update the record container with the new record data
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
        return record;

    } catch (error) {
        console.error('Error fetching current record:', error);
        const container = document.getElementById('record-container');
        container.innerHTML = '<p>Could not load current record</p>';

        // Disable buttons when no records are left
        ['match-btn', 'no-match-btn', 'unsure-btn'].forEach(btnId => {
            document.getElementById(btnId).disabled = true;
        });
        throw error;
    } finally {
        hideLoadingSpinner();
    }
}

export async function fetchUpcomingRecords() {
    console.log('Fetching upcoming records...');

    try {
        const response = await fetch('/upcoming_records');
        console.log('Upcoming records response:', response);

        if (!response.ok) {
            throw new Error('Could not fetch upcoming records');
        }

        const records = await response.json();
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

        return records;

    } catch (error) {
        console.error('Error fetching upcoming records:', error);
        const container = document.getElementById('upcoming-records');
        container.innerHTML = '<p>Could not load upcoming records</p>';
        throw error;
    }
}