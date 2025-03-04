review-interface/
│
├── templates/
│   ├── index.html                      # Main HTML template
│   │
│   └── components/                     # HTML components
│       ├── record_container.html       # Record display component
│       ├── buttons.html               # Action buttons component
│       ├── status_container.html      # Status display component
│       ├── upcoming_records.html      # Upcoming records preview
│       ├── review_process.html        # Review process documentation
│       ├── matching_considerations.html # Matching criteria
│       └── why_matters.html           # Purpose explanation
│
├── static/
│   ├── css/
│   │   └── main.css                   # All styles
│   │
│   └── js/
│       ├── main.js                    # Main JavaScript file
│       ├── utility_functions.js       # Utility functions
│       ├── record_fetching.js         # Record fetching functions
│       └── button_handlers.js         # Button event handlers
│
├── app.py                             # Flask application
├── requirements.txt                   # Python dependencies
└── README.md                          # Project documentation