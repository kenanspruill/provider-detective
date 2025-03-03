from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd
import numpy as np
import logging
import os
from datetime import datetime

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
handler = logging.FileHandler('app.log')
handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)


def create_matches_dataframe_from_csv(file_path='input.csv'):
    """
    Create a DataFrame for match review from a CSV file
    """
    try:
        if not os.path.exists(file_path):
            logger.error(f"Input file not found: {file_path}")
            raise FileNotFoundError(f"Input file not found: {file_path}")

        matches_df = pd.read_csv(file_path)

        # Validate required columns
        required_columns = [
            'first_record.orig_Organization_Name',
            'first_record.fuzzy_ConnectHubOrganizationId',
            'first_record.fuzzy_ConnectHubDisplayLabel',
            'first_record.fuzzy_fuzzy_match_score',
            'npi_count'
        ]

        missing_columns = [col for col in required_columns if col not in matches_df.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")

        return matches_df

    except Exception as e:
        logger.error(f"Error reading CSV file: {str(e)}")
        raise

class MatchReviewApp:
    def __init__(self, matches_df):
        self.matches_df = matches_df
        self.current_index = 0
        self.matched_records = []
        self.unmatched_records = []
        self.unsure_records = []  # Add this line

    def get_current_record(self):
        """
        Get the current record

        Returns:
            dict: Current record details
        """
        if self.current_index < len(self.matches_df):
            record = self.matches_df.iloc[self.current_index]
            return {
                'org_name': str(record['first_record.orig_Organization_Name']),
                'connecthub_org_id': str(record['first_record.fuzzy_ConnectHubOrganizationId']),
                'connecthub_display_label': str(record['first_record.fuzzy_ConnectHubDisplayLabel']),
                'match_score': float(record['first_record.fuzzy_fuzzy_match_score']),
                'npi_count': int(record['npi_count']),
                'input_label': str(record['first_record.fuzzy_input_Cleaned_Label']),
                'input_states': ', '.join(map(str, record['unique_input_states'])) if isinstance(record['unique_input_states'], (list, np.ndarray)) else str(record['unique_input_states']),
                'connecthub_label': str(record['first_record.fuzzy_ConnectHub_Cleaned_Label']),
                'connecthub_states': ', '.join(map(str, record['unique_connecthub_states'])) if isinstance(record['unique_connecthub_states'], (list, np.ndarray)) else str(record['unique_connecthub_states'])
            }
        return None
# Create Flask app
app = Flask(__name__)


@app.route('/')
def index():
    """
    Render the main review page
    """
    return render_template('index.html')  # Changed from match_review.html # render_template('match_review.html')
@app.route('/current_record')
def current_record():
    """
    Get the current record for review
    """
    record = match_review.get_current_record()
    if record:
        return jsonify(record)
    return jsonify({"error": "No more records"}), 404

@app.route('/match', methods=['POST'])
def record_match():
    """
    Record a match decision
    """
    try:
        current_record = match_review.get_current_record()
        if current_record:
            match_review.matched_records.append(current_record)
            match_review.current_index += 1
            next_record = match_review.get_current_record()
            if next_record:
                return jsonify(next_record)
            else:
                return jsonify({"error": "No more records"}), 404
        else:
            return jsonify({"error": "No current record"}), 400
    except Exception as e:
        logger.error(f"Error in match route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/no_match', methods=['POST'])
def record_no_match():
    """
    Record a no match decision
    """
    try:
        current_record = match_review.get_current_record()
        if current_record:
            match_review.unmatched_records.append(current_record)
            match_review.current_index += 1
            next_record = match_review.get_current_record()
            if next_record:
                return jsonify(next_record)
            else:
                return jsonify({"error": "No more records"}), 404
        else:
            return jsonify({"error": "No current record"}), 400
    except Exception as e:
        logger.error(f"Error in no_match route: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Add these routes to your existing Flask app
@app.route('/review_status', methods=['GET'])
def review_status():
    """
    Get the current review status
    """
    try:
        status = {
            'current_index': match_review.current_index,
            'total_records': len(match_review.matches_df),
            'matched_count': len(match_review.matched_records),
            'unmatched_count': len(match_review.unmatched_records)
        }
        print("Status being returned:", status)  # Add this debug line
        return jsonify(status)
    except Exception as e:
        print(f"Error in review_status: {e}")  # Add this debug line
        return jsonify({"error": str(e)}), 500
@app.route('/get_matched_records', methods=['GET'])
def get_matched_records():
    """
    Retrieve all matched records
    """
    return jsonify({
        'matched_records': match_review.matched_records,
        'total_matched': len(match_review.matched_records)
    })

@app.route('/get_unmatched_records', methods=['GET'])
def get_unmatched_records():
    """
    Retrieve all unmatched records
    """
    return jsonify({
        'unmatched_records': match_review.unmatched_records,
        'total_unmatched': len(match_review.unmatched_records)
    })

@app.route('/get_all_review_results', methods=['GET'])
def get_all_review_results():
    """
    Retrieve all review results
    """
    return jsonify({
        'matched_records': match_review.matched_records,
        'unmatched_records': match_review.unmatched_records,
        'total_records': len(match_review.matches_df),
        'total_matched': len(match_review.matched_records),
        'total_unmatched': len(match_review.unmatched_records),
        'review_progress': {
            'current_index': match_review.current_index,
            'percentage_complete': (match_review.current_index / len(match_review.matches_df)) * 100 if match_review.matches_df is not None else 0
        }
    })


@app.route('/unsure', methods=['POST'])
def record_unsure():
    """
    Record an unsure decision
    """
    try:
        logger.info(f"Current index before unsure: {match_review.current_index}")
        logger.info(f"Total records: {len(match_review.matches_df)}")

        current_record = match_review.get_current_record()
        if current_record:
            # Record unsure in separate list
            match_review.unsure_records.append(current_record)
            match_review.current_index += 1

            logger.info(f"Unsure record: {current_record['org_name']}")
            logger.info(f"Current index after unsure: {match_review.current_index}")

            next_record = match_review.get_current_record()
            if next_record:
                logger.info(f"Next record: {next_record['org_name']}")
                return jsonify(next_record)
            else:
                logger.info("No more records to review")
                return jsonify({"error": "No more records"}), 404
        else:
            logger.warning("Attempted to mark as unsure when no current record exists")
            return jsonify({"error": "No current record"}), 400
    except Exception as e:
        logger.error(f"Error in unsure route: {str(e)}")
        return jsonify({"error": str(e)}), 500
@app.route('/export_review_results', methods=['GET'])
def export_review_results():
    """
    Export review results to a CSV file
    """
    import pandas as pd
    import os
    from flask import send_file

    # Combine matched, unmatched, and unsure records with match status
    matched_records = [dict(record, match_status='match') for record in match_review.matched_records]
    unmatched_records = [dict(record, match_status='no_match') for record in match_review.unmatched_records if record.get('match_status') != 'unsure']
    unsure_records = [record for record in match_review.unmatched_records if record.get('match_status') == 'unsure']
    all_reviewed = matched_records + unmatched_records + unsure_records

    # Convert to DataFrame
    df = pd.DataFrame(all_reviewed)

    # Add unique_npis column from the original dataset
    df['unique_npis'] = match_review.matches_df['unique_npis']

    # Create export directory if it doesn't exist
    export_dir = 'review_exports'
    os.makedirs(export_dir, exist_ok=True)

    # Generate filename with timestamp
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f'{export_dir}/review_results_{timestamp}.csv'

    # Export to CSV
    df.to_csv(filename, index=False)

    # Send file for download
    return send_file(filename, as_attachment=True)
@app.route('/go_back_one', methods=['POST'])
def go_back_one():
    """
    Go back to the previous record
    """
    try:
        if match_review.current_index > 0:
            match_review.current_index -= 1
            previous_record = match_review.get_current_record()
            if previous_record:
                return jsonify(previous_record)
            else:
                return jsonify({"error": "No previous record"}), 404
        else:
            return jsonify({"error": "Already at the first record"}), 400
    except Exception as e:
        logger.error(f"Error in go_back_one route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/upcoming_records', methods=['GET'])
def get_upcoming_records():
    """
    Get the next few upcoming records
    """
    try:
        upcoming_records = []
        for i in range(match_review.current_index + 1, min(match_review.current_index + 6, len(match_review.matches_df))):
            record = match_review.matches_df.iloc[i]
            upcoming_records.append({
                'input_label': str(record['first_record.fuzzy_input_Original_Label']),
                'connecthub_label': str(record['first_record.fuzzy_ConnectHub_Original_Label'])
            })
        return jsonify(upcoming_records)
    except Exception as e:
        logger.error(f"Error in get_upcoming_records route: {str(e)}")
        return jsonify({"error": str(e)}), 500
@app.route('/autosave_review_results', methods=['POST'])
def autosave_review_results():
    """
    Autosave review results to a CSV file
    """
    import pandas as pd
    import os

    # Combine matched, unmatched, and unsure records with match status
    matched_records = [dict(record, match_status='match') for record in match_review.matched_records]
    unmatched_records = [dict(record, match_status='no_match') for record in match_review.unmatched_records if record.get('match_status') != 'unsure']
    unsure_records = [record for record in match_review.unmatched_records if record.get('match_status') == 'unsure']
    all_reviewed = matched_records + unmatched_records + unsure_records

    # Convert to DataFrame
    df = pd.DataFrame(all_reviewed)

    # Add unique_npis column from the original dataset
    df['unique_npis'] = match_review.matches_df['unique_npis']

    # Create export directory if it doesn't exist
    export_dir = 'review_exports'
    os.makedirs(export_dir, exist_ok=True)

    # Generate filename with timestamp
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f'{export_dir}/review_results_autosave_{timestamp}.csv'

    # Export to CSV
    df.to_csv(filename, index=False)

    return jsonify({"message": "Autosave successful"})

if __name__ == '__main__':
    sample_matches_df = create_matches_dataframe_from_csv('input.csv')
    print(f"Loaded {len(sample_matches_df)} records")  # Add this
    match_review = MatchReviewApp(sample_matches_df)
    app.run(debug=True)