from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Trip
import os
from dotenv import load_dotenv
from werkzeug.urls import quote as url_quote

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')

db.init_app(app)

@app.route('/api/trips', methods=['GET', 'POST'])
def trips():
    if request.method == 'GET':
        all_trips = Trip.query.all()
        return jsonify([trip.to_dict() for trip in all_trips])
    elif request.method == 'POST':
        data = request.json
        new_trip = Trip(
            destination=data['destination'],
            start_date=data['startDate'],
            end_date=data['endDate'],
            activities=data.get('activities', [])
        )
        db.session.add(new_trip)
        db.session.commit()
        return jsonify(new_trip.to_dict()), 201

@app.route('/api/trips/<int:trip_id>', methods=['GET', 'PUT', 'DELETE'])
def trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    
    if request.method == 'GET':
        return jsonify(trip.to_dict())
    elif request.method == 'PUT':
        data = request.json
        trip.destination = data.get('destination', trip.destination)
        trip.start_date = data.get('startDate', trip.start_date)
        trip.end_date = data.get('endDate', trip.end_date)
        trip.activities = data.get('activities', trip.activities)
        db.session.commit()
        return jsonify(trip.to_dict())
    elif request.method == 'DELETE':
        db.session.delete(trip)
        db.session.commit()
        return '', 204

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
