from app import app, db
from models import Activity
from flask import render_template, request, jsonify, redirect, url_for
from datetime import datetime, timedelta
from sqlalchemy import func
import itertools

@app.route('/')
def index():
    activities = Activity.query.order_by(Activity.date, Activity.start_time).all()
    grouped_activities = {}
    for date, group in itertools.groupby(activities, key=lambda x: x.date):
        grouped_activities[date] = list(group)
    return render_template('index.html', grouped_activities=grouped_activities)

@app.route('/add_activity', methods=['GET', 'POST'])
def add_activity():
    categories = ['Travel', 'Accommodation', 'Sightseeing', 'Cultural', 'Food', 'Entertainment', 'Historical']
    if request.method == 'POST':
        date = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
        start_time = datetime.strptime(request.form['start_time'], '%H:%M').time()
        end_time = datetime.strptime(request.form['end_time'], '%H:%M').time()
        new_activity = Activity(
            date=date,
            start_time=start_time,
            end_time=end_time,
            title=request.form['title'],
            location=request.form['location'],
            description=request.form['description'],
            category=request.form['category'],
            price=float(request.form['price']),
            latitude=float(request.form['latitude']) if request.form.get('latitude') else None,
            longitude=float(request.form['longitude']) if request.form.get('longitude') else None
        )
        db.session.add(new_activity)
        db.session.commit()
        return redirect(url_for('index'))
    return render_template('add_activity.html', categories=categories)

@app.route('/activities')
def get_activities():
    activities = Activity.query.order_by(Activity.date, Activity.start_time).all()
    return jsonify([activity.to_dict() for activity in activities])

@app.route('/weekly_view')
def weekly_view():
    trip_start_date = datetime(2024, 10, 28).date()
    trip_end_date = datetime(2024, 11, 13).date()
    today = datetime.now().date()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    
    activities = Activity.query.filter(
        Activity.date >= start_of_week,
        Activity.date <= end_of_week
    ).order_by(Activity.date, Activity.start_time).all()
    
    week_activities = {(start_of_week + timedelta(days=i)): [] for i in range(7)}
    for activity in activities:
        week_activities[activity.date].append(activity)
    
    return render_template('weekly_view.html', week_activities=week_activities, start_of_week=start_of_week, timedelta=timedelta, trip_start_date=trip_start_date, trip_end_date=trip_end_date)

@app.route('/weekly_view_data')
def weekly_view_data():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    categories = request.args.get('categories', '').split(',')
    
    if start_date and end_date:
        start_of_week = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_of_week = datetime.strptime(end_date, '%Y-%m-%d').date()
    else:
        start_of_week = datetime.now().date() - timedelta(days=datetime.now().weekday())
        end_of_week = start_of_week + timedelta(days=6)
    
    activities_query = Activity.query.filter(
        Activity.date >= start_of_week,
        Activity.date <= end_of_week
    )
    
    if categories and categories[0]:
        activities_query = activities_query.filter(Activity.category.in_(categories))
    
    activities = activities_query.order_by(Activity.date, Activity.start_time).all()
    
    week_activities = {(start_of_week + timedelta(days=i)).isoformat(): [] for i in range((end_of_week - start_of_week).days + 1)}
    for activity in activities:
        activity_dict = activity.to_dict()
        activity_dict['start_minutes'] = activity.start_time.hour * 60 + activity.start_time.minute
        activity_dict['end_minutes'] = activity.end_time.hour * 60 + activity.end_time.minute
        activity_dict['duration_minutes'] = activity_dict['end_minutes'] - activity_dict['start_minutes']
        week_activities[activity.date.isoformat()].append(activity_dict)
    
    return jsonify(week_activities)

@app.route('/bulk_add_activities', methods=['POST'])
def bulk_add_activities():
    activities_data = request.json.get('activities', [])
    added_activities = []
    for activity_data in activities_data:
        date = datetime.strptime(activity_data['date'], '%m/%d/%Y').date()
        start_time = datetime.strptime(activity_data['start_time'], '%I:%M %p').time()
        end_time = datetime.strptime(activity_data['end_time'], '%I:%M %p').time()
        new_activity = Activity(
            date=date,
            start_time=start_time,
            end_time=end_time,
            title=activity_data['title'],
            location=activity_data['location'],
            description=activity_data['description'],
            category=activity_data['category'],
            price=float(activity_data['price']),
            latitude=float(activity_data.get('latitude')) if activity_data.get('latitude') is not None else None,
            longitude=float(activity_data.get('longitude')) if activity_data.get('longitude') is not None else None
        )
        db.session.add(new_activity)
        added_activities.append(new_activity)
    db.session.commit()
    print(f"Added {len(added_activities)} activities to the database")
    return jsonify({'message': f'Successfully added {len(added_activities)} activities'}), 201

@app.route('/activities/<int:activity_id>')
def get_activity(activity_id):
    activity = Activity.query.get_or_404(activity_id)
    return jsonify(activity.to_dict())

@app.route('/map_view')
def map_view():
    activities = Activity.query.all()
    activity_data = []
    print(f"Total activities in database: {len(activities)}")
    for activity in activities:
        activity_dict = activity.to_dict()
        print(f"Activity: {activity.title}, Lat: {activity_dict['latitude']}, Lon: {activity_dict['longitude']}")
        if activity_dict['latitude'] is not None and activity_dict['longitude'] is not None:
            activity_data.append(activity_dict)
        else:
            print(f"Warning: Activity '{activity.title}' has missing coordinates")
    print(f"Activities with valid coordinates: {len(activity_data)}")
    return render_template('map_view.html', activities=activity_data)
