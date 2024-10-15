import sys
from app import create_app
import os
import logging

# Configure logging
logging.basicConfig(filename='app_log.txt', level=logging.DEBUG, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Redirect stdout and stderr to the log file
sys.stdout = open('app_log.txt', 'a')
sys.stderr = open('app_log.txt', 'a')

logging.info("Starting the Flask application...")

try:
    logging.info("About to create the app...")
    app = create_app()
    logging.info("App created successfully.")
except Exception as e:
    logging.error(f"Error creating app: {str(e)}", exc_info=True)
    raise

if __name__ == "__main__":
    logging.info("Flask app created, about to run...")
    try:
        port = int(os.environ.get("PORT", 5000))
        logging.info(f"Attempting to run app on port {port}")
        app.run(host='0.0.0.0', port=port, debug=True)
    except Exception as e:
        logging.error(f"Error running app: {str(e)}", exc_info=True)
        raise
    logging.info("This line will only be reached if the app exits normally.")
else:
    logging.info("This script is being imported, not run directly.")

# Close the file handlers
sys.stdout.close()
sys.stderr.close()
