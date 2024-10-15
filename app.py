from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Trip, Activity, Todo
import os
from dotenv import load_dotenv
from werkzeug.urls import url_quote
import logging
from sqlalchemy import inspect
from datetime import datetime

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

print("Starting to load environment variables...")
load_dotenv()
print("Environment variables loaded.")

print("Creating Flask app...")
app = Flask(__name__)
CORS(app)
print("Flask app created and CORS initialized.")

# Database configuration
print("Configuring database...")
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')
print(f"Database URL: {app.config['SQLALCHEMY_DATABASE_URI']}")
print(f"Secret Key set: {'Yes' if app.config['SECRET_KEY'] else 'No'}")

print("Initializing database...")
db.init_app(app)
print("Database initialized.")

def init_db():
    with app.app_context():
        inspector = inspect(db.engine)
        if not inspector.has_table("trip"):
            logger.info("Creating database tables...")
            db.create_all()
            logger.info("Database tables created.")
        else:
            logger.info("Database tables already exist.")

@app.route('/')
def root():
    return jsonify({"message": "Welcome to the Trip Planner API"}), 200

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/test')
def test():
    return jsonify({"message": "Test route is working"}), 200

@app.route('/api/trips', methods=['GET', 'POST'])
def trips():
    if request.method == 'GET':
        logger.debug("Fetching all trips")
        all_trips = Trip.query.all()
        logger.debug(f"Found {len(all_trips)} trips")
        return jsonify([trip.to_dict() for trip in all_trips])
    elif request.method == 'POST':
        data = request.json
        logger.debug(f"Received POST request with data: {data}")
        new_trip = Trip(
            name=data['name'],
            start_date=datetime.strptime(data['startDate'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['endDate'], '%Y-%m-%d').date()
        )
        db.session.add(new_trip)
        db.session.commit()
        logger.debug(f"Created new trip: {new_trip.to_dict()}")
        return jsonify(new_trip.to_dict()), 201

@app.route('/api/trips/<int:trip_id>', methods=['GET', 'PUT', 'DELETE'])
def trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    
    if request.method == 'GET':
        return jsonify(trip.to_dict())
    elif request.method == 'PUT':
        data = request.json
        trip.name = data.get('name', trip.name)
        trip.start_date = datetime.strptime(data.get('startDate', trip.start_date.isoformat()), '%Y-%m-%d').date()
        trip.end_date = datetime.strptime(data.get('endDate', trip.end_date.isoformat()), '%Y-%m-%d').date()
        db.session.commit()
        return jsonify(trip.to_dict())
    elif request.method == 'DELETE':
        db.session.delete(trip)
        db.session.commit()
        return '', 204

@app.route('/api/debug/db_schema')
def db_schema():
    logger.debug("Fetching database schema")
    inspector = inspect(db.engine)
    schema = {}
    for table_name in inspector.get_table_names():
        columns = []
        for column in inspector.get_columns(table_name):
            columns.append(f"{column['name']} ({column['type']})")
        schema[table_name] = columns
    return jsonify(schema)

if __name__ == '__main__':
    init_db()  # Initialize the database before running the app
    port = int(os.getenv('PORT', 8080))
    logger.info(f"Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
    logger.info("Flask server started.")
