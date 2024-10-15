from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from datetime import datetime, timedelta
from sqlalchemy import func
import itertools
import logging
import csv
import io
import requests
import os

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

    @bp.route('/add_activity/<int:trip_id>', methods=['GET', 'POST'])
    def add_activity(trip_id):
        trip = Trip.query.get_or_404(trip_id)
        categories = ['Sightseeing', 'Food', 'Transportation', 'Accommodation', 'Entertainment', 'Shopping', 'Other']
        
        if request.method == 'POST':
            title = request.form['title']
            date = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
            start_time = datetime.strptime(request.form['start_time'], '%H:%M').time()
            end_time = datetime.strptime(request.form['end_time'], '%H:%M').time()
            location = request.form['location']
            category = request.form['category']
            latitude = float(request.form['latitude'])
            longitude = float(request.form['longitude'])

            new_activity = Activity(
                trip_id=trip_id,
                title=title,
                date=date,
                start_time=start_time,
                end_time=end_time,
                location=location,
                category=category,
                latitude=latitude,
                longitude=longitude
            )
            db.session.add(new_activity)
            db.session.commit()
            flash('New activity added successfully!', 'success')
            return redirect(url_for('routes.trip_detail', trip_id=trip_id))
        
        return render_template('add_activity.html', trip=trip, categories=categories)

    @bp.route('/edit_activity/<int:activity_id>', methods=['GET', 'POST'])
    def edit_activity(activity_id):
        activity = Activity.query.get_or_404(activity_id)
        if request.method == 'POST':
            activity.title = request.form['title']
            activity.date = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
            activity.start_time = datetime.strptime(request.form['start_time'], '%H:%M').time()
            activity.end_time = datetime.strptime(request.form['end_time'], '%H:%M').time()
            activity.location = request.form['location']
            activity.category = request.form['category']
            activity.latitude = float(request.form['latitude'])
            activity.longitude = float(request.form['longitude'])
            db.session.commit()
            flash('Activity updated successfully!', 'success')
            return redirect(url_for('routes.trip_detail', trip_id=activity.trip_id))
        return render_template('edit_activity.html', activity=activity)

    @bp.route('/delete_activity/<int:activity_id>', methods=['POST'])
    def delete_activity(activity_id):
        activity = Activity.query.get_or_404(activity_id)
        trip_id = activity.trip_id
        db.session.delete(activity)
        db.session.commit()
        flash('Activity deleted successfully!', 'success')
        return redirect(url_for('routes.trip_detail', trip_id=trip_id))

    @bp.route('/import_activities/<int:trip_id>', methods=['GET', 'POST'])
    def import_activities(trip_id):
        trip = Trip.query.get_or_404(trip_id)
        if request.method == 'POST':
            if 'file' not in request.files:
                flash('No file part', 'error')
                return redirect(request.url)
            file = request.files['file']
            if file.filename == '':
                flash('No selected file', 'error')
                return redirect(request.url)
            if file and file.filename.endswith('.csv'):
                try:
                    stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
                    csv_input = csv.reader(stream)
                    next(csv_input)  # Skip header row
                    for row in csv_input:
                        title, date, start_time, end_time, location, category, latitude, longitude = row
                        new_activity = Activity(
                            trip_id=trip_id,
                            title=title,
                            date=datetime.strptime(date, '%Y-%m-%d').date(),
                            start_time=datetime.strptime(start_time, '%H:%M').time(),
                            end_time=datetime.strptime(end_time, '%H:%M').time(),
                            location=location,
                            category=category,
                            latitude=float(latitude),
                            longitude=float(longitude)
                        )
                        db.session.add(new_activity)
                    db.session.commit()
                    flash('Activities imported successfully!', 'success')
                    return redirect(url_for('routes.trip_detail', trip_id=trip_id))
                except Exception as e:
                    db.session.rollback()
                    flash(f'Error importing activities: {str(e)}', 'error')
                    return redirect(request.url)
            else:
                flash('Please upload a CSV file', 'error')
                return redirect(request.url)
        return render_template('import_activities.html', trip=trip)

# Do not return bp from init_routes
