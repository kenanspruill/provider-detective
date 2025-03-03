import pandas as pd
import numpy as np

def create_sample_matches_dataframe(n_rows=10):
    """
    Create a sample DataFrame for match review

    Args:
        n_rows (int): Number of sample rows to generate

    Returns:
        pd.DataFrame: Sample matches DataFrame
    """
    # Sample data generation
    data = {
        'first_record.orig_Organization_Name': [
                                                   'Acme Healthcare Solutions',
                                                   'City General Hospital',
                                                   'Midwest Medical Center',
                                                   'Northeast Clinic',
                                                   'Southern Regional Health',
                                                   'West Coast Medical Group',
                                                   'Central State Hospital',
                                                   'Mountain View Healthcare',
                                                   'Riverside Medical Associates',
                                                   'Community Health Network'
                                               ][:n_rows],
        'first_record.fuzzy_ConnectHubOrganizationId': [
            f'CH{np.random.randint(1000, 9999)}' for _ in range(n_rows)
        ],
        'first_record.fuzzy_fuzzy_match_score': np.random.uniform(0.7, 1.0, n_rows).tolist(),
        'first_record.fuzzy_input_Cleaned_Label': [
                                                      'acme healthcare solutions',
                                                      'city general hospital',
                                                      'midwest medical center',
                                                      'northeast clinic',
                                                      'southern regional health',
                                                      'west coast medical group',
                                                      'central state hospital',
                                                      'mountain view healthcare',
                                                      'riverside medical associates',
                                                      'community health network'
                                                  ][:n_rows],
        'first_record.fuzzy_ConnectHub_Cleaned_Label': [
                                                           'acme healthcare solutions',
                                                           'city general hospital',
                                                           'midwest medical center',
                                                           'northeast clinic',
                                                           'southern regional health',
                                                           'west coast medical group',
                                                           'central state hospital',
                                                           'mountain view healthcare',
                                                           'riverside medical associates',
                                                           'community health network'
                                                       ][:n_rows],
        'unique_npis': [
            [f'1234{np.random.randint(10, 99)}' for _ in range(np.random.randint(1, 4))] for _ in range(n_rows)
        ],
        'npi_count': np.random.randint(1, 5, n_rows).tolist(),
        'unique_input_states': [
            ['CA', 'NY'] if np.random.random() > 0.5 else ['NY'] for _ in range(n_rows)
        ],
        'unique_connecthub_states': [
            ['CA', 'NY'] if np.random.random() > 0.5 else ['NY'] for _ in range(n_rows)
        ]
    }

    return pd.DataFrame(data)