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
        logger.debug(f"Fetching record at index: {self.current_index}")
        if self.current_index < len(self.matches_df):
            record = self.matches_df.iloc[self.current_index]
            logger.debug(f"Record found: {record}")
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
        logger.debug("No more records to fetch")
        return None
# Create Flask app
app = Flask(__name__)



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/current_record')
def current_record():
    record = match_review.get_current_record()
    if record:
        return jsonify(record)
    return jsonify({"error": "No more records"}), 404

@app.route('/match', methods=['POST'])
def record_match():
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

@app.route('/unsure', methods=['POST'])
def record_unsure():
    try:
        current_record = match_review.get_current_record()
        if current_record:
            match_review.unsure_records.append(current_record)
            match_review.current_index += 1
            next_record = match_review.get_current_record()
            if next_record:
                return jsonify(next_record)
            else:
                return jsonify({"error": "No more records"}), 404
        else:
            return jsonify({"error": "No current record"}), 400
    except Exception as e:
        logger.error(f"Error in unsure route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/review_status', methods=['GET'])
def review_status():
    try:
        status = {
            'current_index': match_review.current_index,
            'total_records': len(match_review.matches_df),
            'matched_count': len(match_review.matched_records),
            'unmatched_count': len(match_review.unmatched_records)
        }
        return jsonify(status)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_matched_records', methods=['GET'])
def get_matched_records():
    return jsonify({
        'matched_records': match_review.matched_records,
        'total_matched': len(match_review.matched_records)
    })

@app.route('/get_unmatched_records', methods=['GET'])
def get_unmatched_records():
    return jsonify({
        'unmatched_records': match_review.unmatched_records,
        'total_unmatched': len(match_review.unmatched_records)
    })

@app.route('/get_all_review_results', methods=['GET'])
def get_all_review_results():
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


@app.route('/export_review_results', methods=['GET'])
def export_review_results():
    """
    Export review results to a CSV file
    """
    try:
        # Combine matched and unmatched records with match status
        matched_records = [dict(record, match_status='match')
                           for record in match_review.matched_records]
        unmatched_records = [dict(record, match_status='no_match')
                             for record in match_review.unmatched_records
                             if record.get('match_status') != 'unsure']
        unsure_records = [record for record in match_review.unmatched_records
                          if record.get('match_status') == 'unsure']

        all_reviewed = matched_records + unmatched_records + unsure_records

        # Convert to DataFrame
        df = pd.DataFrame(all_reviewed)

        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f'review_results_{timestamp}.csv'

        # Create a temporary file
        import tempfile
        temp = tempfile.NamedTemporaryFile(delete=False)

        try:
            # Save DataFrame to CSV
            df.to_csv(temp.name, index=False)

            # Send file
            return send_file(
                temp.name,
                mimetype='text/csv',
                as_attachment=True,
                download_name=filename  # Use download_name instead of attachment_filename
            )
        finally:
            # Clean up the temporary file
            import os
            os.unlink(temp.name)

    except Exception as e:
        logger.error(f"Error in export_review_results: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/go_back_one', methods=['POST'])
def go_back_one():
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
    try:
        upcoming_records = []
        current_index = match_review.current_index
        total_records = len(match_review.matches_df)

        for i in range(current_index + 1, min(current_index + 6, total_records)):
            record = match_review.matches_df.iloc[i]
            upcoming_record = {
                'input_label': str(record['first_record.fuzzy_input_Original_Label']),
                'connecthub_label': str(record['first_record.fuzzy_ConnectHub_Original_Label'])
            }
            upcoming_records.append(upcoming_record)

        return jsonify(upcoming_records)

    except Exception as e:
        logger.error(f"Error in get_upcoming_records route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/autosave_review_results', methods=['POST'])
def autosave_review_results():
    import pandas as pd
    import os

    matched_records = [dict(record, match_status='match') for record in match_review.matched_records]
    unmatched_records = [dict(record, match_status='no_match') for record in match_review.unmatched_records if record.get('match_status') != 'unsure']
    unsure_records = [record for record in match_review.unmatched_records if record.get('match_status') == 'unsure']
    all_reviewed = matched_records + unmatched_records + unsure_records

    df = pd.DataFrame(all_reviewed)
    df['unique_npis'] = match_review.matches_df['unique_npis']

    export_dir = 'review_exports'
    os.makedirs(export_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f'{export_dir}/review_results_autosave_{timestamp}.csv'

    df.to_csv(filename, index=False)

    return jsonify({"message": "Autosave successful"})

if __name__ == '__main__':
    sample_matches_df = create_matches_dataframe_from_csv('input.csv')
    match_review = MatchReviewApp(sample_matches_df)
    app.run(debug=True)