from flask import render_template, request, jsonify, redirect, url_for
from app import app, db
from models import Activity
from datetime import datetime

@app.route('/')
def index():
    activities = Activity.query.order_by(Activity.date, Activity.time).all()
    return render_template('index.html', activities=activities)

@app.route('/add_activity', methods=['GET', 'POST'])
def add_activity():
    if request.method == 'POST':
        date = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
        time = datetime.strptime(request.form['time'], '%H:%M').time()
        new_activity = Activity(
            date=date,
            time=time,
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
    activities = Activity.query.order_by(Activity.date, Activity.time).all()
    return jsonify([activity.to_dict() for activity in activities])
