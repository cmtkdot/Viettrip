from flask import render_template, request, jsonify, redirect, url_for
from app import app, db
from models import Activity
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
            price=float(request.form['price'])
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
    
    return render_template('weekly_view.html', week_activities=week_activities, start_of_week=start_of_week, timedelta=timedelta)

@app.route('/weekly_view_data')
def weekly_view_data():
    start_date = request.args.get('start_date')
    categories = request.args.get('categories', '').split(',')
    
    if start_date:
        start_of_week = datetime.strptime(start_date, '%Y-%m-%d').date()
    else:
        start_of_week = datetime.now().date() - timedelta(days=datetime.now().weekday())
    
    end_of_week = start_of_week + timedelta(days=6)
    
    activities_query = Activity.query.filter(
        Activity.date >= start_of_week,
        Activity.date <= end_of_week
    )
    
    if categories and categories[0]:  # Check if categories list is not empty
        activities_query = activities_query.filter(Activity.category.in_(categories))
    
    activities = activities_query.order_by(Activity.date, Activity.start_time).all()
    
    week_activities = {(start_of_week + timedelta(days=i)).isoformat(): [] for i in range(7)}
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
            price=float(activity_data['price'])
        )
        db.session.add(new_activity)
    db.session.commit()
    return jsonify({'message': 'Activities added successfully'}), 201

@app.route('/activities/<int:activity_id>')
def get_activity(activity_id):
    activity = Activity.query.get_or_404(activity_id)
    return jsonify(activity.to_dict())
