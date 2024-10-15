from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from datetime import datetime, timedelta
from sqlalchemy import func
import itertools
import logging

bp = Blueprint('routes', __name__)

def init_routes(db, Trip, Activity, Todo):
    @bp.route('/')
    def index():
        trips = Trip.query.all()
        return render_template('index.html', trips=trips)

    @bp.route('/map_view/<int:trip_id>')
    def map_view(trip_id):
        try:
            trip = Trip.query.get_or_404(trip_id)
            activities = Activity.query.filter_by(trip_id=trip_id).order_by(Activity.date, Activity.start_time).all()
            
            # Convert activities to a list of dictionaries
            activities_data = []
            for activity in activities:
                activity_dict = {
                    'id': activity.id,
                    'title': activity.title,
                    'date': activity.date.strftime('%Y-%m-%d'),
                    'start_time': activity.start_time.strftime('%H:%M'),
                    'end_time': activity.end_time.strftime('%H:%M'),
                    'location': activity.location,
                    'category': activity.category,
                    'latitude': activity.latitude,
                    'longitude': activity.longitude
                }
                activities_data.append(activity_dict)
            
            return render_template('map_view.html', trip=trip, activities=activities_data)
        except Exception as e:
            logging.error(f"Error in map_view route: {str(e)}", exc_info=True)
            flash('An error occurred while loading the map view.', 'error')
            return redirect(url_for('routes.index'))

    @bp.route('/trip/<int:trip_id>')
    def trip_detail(trip_id):
        trip = Trip.query.get_or_404(trip_id)
        activities = Activity.query.filter_by(trip_id=trip_id).order_by(Activity.date, Activity.start_time).all()
        todos = Todo.query.filter_by(trip_id=trip_id).all()
        return render_template('trip_detail.html', trip=trip, activities=activities, todos=todos)

    @bp.route('/add_trip', methods=['GET', 'POST'])
    def add_trip():
        if request.method == 'POST':
            name = request.form['name']
            start_date = datetime.strptime(request.form['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(request.form['end_date'], '%Y-%m-%d').date()
            new_trip = Trip(name=name, start_date=start_date, end_date=end_date)
            db.session.add(new_trip)
            db.session.commit()
            flash('New trip added successfully!', 'success')
            return redirect(url_for('routes.index'))
        return render_template('add_trip.html')

    @bp.route('/create_vietnam_trip', methods=['POST'])
    def create_vietnam_trip():
        # Add logic to create a default Vietnam trip
        name = "Vietnam Trip"
        start_date = datetime.now().date()
        end_date = start_date + timedelta(days=14)
        new_trip = Trip(name=name, start_date=start_date, end_date=end_date)
        db.session.add(new_trip)
        db.session.commit()
        flash('Vietnam trip created successfully!', 'success')
        return redirect(url_for('routes.index'))

    return bp
