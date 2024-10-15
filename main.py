from app import create_app
import os

print("Starting the Flask application...")

app = create_app()

if __name__ == "__main__":
    print("Flask app created, about to run...")
    port = int(os.environ.get("PORT", 5000))
    print(f"Attempting to run on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
    print("This line will only be reached if the app exits normally.")
