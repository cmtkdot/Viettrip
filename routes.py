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
            
            activities_data = [{
                'id': activity.id,
                'title': activity.title,
                'date': activity.date.strftime('%Y-%m-%d'),
                'start_time': activity.start_time.strftime('%H:%M'),
                'end_time': activity.end_time.strftime('%H:%M'),
                'location': activity.location,
                'category': activity.category,
                'latitude': activity.latitude,
                'longitude': activity.longitude
            } for activity in activities]
            
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
        name = "Vietnam Trip"
        start_date = datetime.now().date()
        end_date = start_date + timedelta(days=14)
        new_trip = Trip(name=name, start_date=start_date, end_date=end_date)
        db.session.add(new_trip)
        db.session.commit()
        flash('Vietnam trip created successfully!', 'success')
        return redirect(url_for('routes.index'))

    @bp.route('/weekly_view/<int:trip_id>')
    def weekly_view(trip_id):
        trip = Trip.query.get_or_404(trip_id)
        activities = Activity.query.filter_by(trip_id=trip_id).order_by(Activity.date, Activity.start_time).all()
        
        grouped_activities = itertools.groupby(activities, key=lambda x: x.date)
        weekly_activities = {date: list(activities) for date, activities in grouped_activities}
        
        return render_template('weekly_view.html', trip=trip, weekly_activities=weekly_activities)

    @bp.route('/edit_trip/<int:trip_id>', methods=['GET', 'POST'])
    def edit_trip(trip_id):
        trip = Trip.query.get_or_404(trip_id)
        if request.method == 'POST':
            trip.name = request.form['name']
            trip.start_date = datetime.strptime(request.form['start_date'], '%Y-%m-%d').date()
            trip.end_date = datetime.strptime(request.form['end_date'], '%Y-%m-%d').date()
            db.session.commit()
            flash('Trip updated successfully!', 'success')
            return redirect(url_for('routes.index'))
        return render_template('edit_trip.html', trip=trip)

    @bp.route('/delete_trip/<int:trip_id>', methods=['POST'])
    def delete_trip(trip_id):
        trip = Trip.query.get_or_404(trip_id)
        db.session.delete(trip)
        db.session.commit()
        flash('Trip deleted successfully!', 'success')
        return redirect(url_for('routes.index'))

# Do not return bp from init_routes
