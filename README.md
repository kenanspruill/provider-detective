# provider-detective

This project is designed to generate an interface for matching providers and endpoints with similar names. It utilizes Flask for the web framework and pandas for data manipulation.
## Installation

1) Run `python app.py`
2) Go to: http://127.0.0.1:5000/ 

## Organization Matching Review Interface

### Purpose 🎯

This application helps healthcare data professionals align and validate organizational records across different datasets. Our primary goal is to create accurate mappings between various healthcare organization identifiers.

### Key Objectives 🔍

- Match practitioners and organizations across multiple FHIR resource paths
- Validate connections between:
  - Organizations
  - Practitioner Roles
  - Practitioners
  - Locations
- Improve data integrity and interoperability in healthcare information systems

### Review Process 📋

For each record, you will:
1. Carefully examine the organization details
2. Compare input and ConnectHub labels
3. Consider matching criteria such as:
   - Name similarity
   - Fuzzy match scores
   - NPI (National Provider Identifier) consistency
   - Geographical state alignment

### Matching Considerations 🤔

- Look for semantic similarities in organization names
- Check for consistent state information
- Verify NPI uniqueness and distribution
- Evaluate the confidence of potential matches

### Decision Options ✅❌

- **Match**: When records represent the same organization
- **No Match**: When records are distinctly different entities

### Why This Matters 💡

Accurate organization matching is crucial for:
- Healthcare data interoperability
- Reducing duplicate records
- Improving data quality
- Facilitating better healthcare information exchange