from flask import render_template, request, jsonify, redirect, url_for
from app import app, db
from models import Activity
from datetime import datetime
from itertools import groupby

@app.route('/')
def index():
    activities = Activity.query.order_by(Activity.date, Activity.start_time).all()
    grouped_activities = {}
    for date, group in groupby(activities, key=lambda x: x.date):
        grouped_activities[date] = list(group)
    return render_template('index.html', grouped_activities=grouped_activities)

@app.route('/add_activity', methods=['GET', 'POST'])
def add_activity():
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
            description=request.form['description']
        )
        db.session.add(new_activity)
        db.session.commit()
        return redirect(url_for('index'))
    return render_template('add_activity.html')

@app.route('/activities')
def get_activities():
    activities = Activity.query.order_by(Activity.date, Activity.start_time).all()
    return jsonify([activity.to_dict() for activity in activities])
