#!/usr/bin/env python3
import os
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from models import db, Trip, Activity
from sqlalchemy import func

app = Flask(__name__)
CORS(app)

# Configure the SQLAlchemy part of the app instance
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')

# Initialize SQLAlchemy
db.init_app(app)

@app.route('/')
def index():
    google_maps_api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    return render_template('index.html', google_maps_api_key=google_maps_api_key)

@app.route('/api/map')
def map_data():
    trip_id = request.args.get('trip_id', type=int)
    
    if trip_id:
        activities = Activity.query.filter_by(trip_id=trip_id).all()
    else:
        activities = Activity.query.all()
    
    markers = [
        {
            'lat': activity.latitude,
            'lng': activity.longitude,
            'title': activity.title
        }
        for activity in activities
        if activity.latitude and activity.longitude
    ]
    
    if markers:
        center = {
            'lat': sum(marker['lat'] for marker in markers) / len(markers),
            'lng': sum(marker['lng'] for marker in markers) / len(markers)
        }
    else:
        center = {'lat': 0, 'lng': 0}
    
    map_data = {
        'center': center,
        'zoom': 10 if trip_id else 2,
        'markers': markers
    }
    
    return jsonify(map_data)

@app.route('/api/trips')
def get_trips():
    trips = Trip.query.all()
    return jsonify([trip.to_dict() for trip in trips])

@app.route('/api/activities')
def get_activities():
    trip_id = request.args.get('trip_id', type=int)
    if trip_id:
        activities = Activity.query.filter_by(trip_id=trip_id).all()
    else:
        activities = Activity.query.all()
    return jsonify([activity.to_dict() for activity in activities])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
