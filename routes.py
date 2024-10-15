from flask import Blueprint, render_template, request, jsonify, redirect, url_for
from datetime import datetime, timedelta
from sqlalchemy import func
import itertools

bp = Blueprint('routes', __name__)

def init_routes(db, Trip, Activity, Todo):
    @bp.route('/')
    def index():
        trips = Trip.query.order_by(Trip.start_date).all()
        return render_template('index.html', trips=trips)

    @bp.route('/trip/<int:trip_id>')
    def trip_detail(trip_id):
        trip = Trip.query.get_or_404(trip_id)
        activities = Activity.query.filter_by(trip_id=trip_id).order_by(Activity.date, Activity.start_time).all()
        todos = Todo.query.filter_by(trip_id=trip_id).order_by(Todo.created_at).all()
        grouped_activities = {}
        for date, group in itertools.groupby(activities, key=lambda x: x.date):
            grouped_activities[date] = list(group)
        return render_template('trip_detail.html', trip=trip, grouped_activities=grouped_activities, todos=todos)

    @bp.route('/add_trip', methods=['GET', 'POST'])
    def add_trip():
        if request.method == 'POST':
            new_trip = Trip(
                name=request.form['name'],
                start_date=datetime.strptime(request.form['start_date'], '%Y-%m-%d').date(),
                end_date=datetime.strptime(request.form['end_date'], '%Y-%m-%d').date()
            )
            db.session.add(new_trip)
            db.session.commit()
            return redirect(url_for('routes.index'))
        return render_template('add_trip.html')

    @bp.route('/add_activity/<int:trip_id>', methods=['GET', 'POST'])
    def add_activity(trip_id):
        trip = Trip.query.get_or_404(trip_id)
        categories = ['Travel', 'Accommodation', 'Sightseeing', 'Cultural', 'Food', 'Entertainment', 'Historical']
        if request.method == 'POST':
            date = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
            start_time = datetime.strptime(request.form['start_time'], '%H:%M').time()
            end_time = datetime.strptime(request.form['end_time'], '%H:%M').time()
            new_activity = Activity(
                trip_id=trip_id,
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
            return redirect(url_for('routes.trip_detail', trip_id=trip_id))
        return render_template('add_activity.html', trip=trip, categories=categories)

    @bp.route('/activities/<int:trip_id>')
    def get_activities(trip_id):
        activities = Activity.query.filter_by(trip_id=trip_id).order_by(Activity.date, Activity.start_time).all()
        return jsonify([activity.to_dict() for activity in activities])

    @bp.route('/weekly_view/<int:trip_id>')
    def weekly_view(trip_id):
        trip = Trip.query.get_or_404(trip_id)
        today = datetime.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        
        activities = Activity.query.filter(
            Activity.trip_id == trip_id,
            Activity.date >= start_of_week,
            Activity.date <= end_of_week
        ).order_by(Activity.date, Activity.start_time).all()
        
        week_activities = {(start_of_week + timedelta(days=i)): [] for i in range(7)}
        for activity in activities:
            week_activities[activity.date].append(activity)
        
        return render_template('weekly_view.html', trip=trip, week_activities=week_activities, start_of_week=start_of_week, timedelta=timedelta)

    @bp.route('/weekly_view_data/<int:trip_id>')
    def weekly_view_data(trip_id):
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
            Activity.trip_id == trip_id,
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

    @bp.route('/bulk_add_activities/<int:trip_id>', methods=['POST'])
    def bulk_add_activities(trip_id):
        activities_data = request.json.get('activities', [])
        added_activities = []
        for activity_data in activities_data:
            date = datetime.strptime(activity_data['date'], '%m/%d/%Y').date()
            start_time = datetime.strptime(activity_data['start_time'], '%I:%M %p').time()
            end_time = datetime.strptime(activity_data['end_time'], '%I:%M %p').time()
            new_activity = Activity(
                trip_id=trip_id,
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

    @bp.route('/activity/<int:activity_id>')
    def get_activity(activity_id):
        activity = Activity.query.get_or_404(activity_id)
        return jsonify(activity.to_dict())

    @bp.route('/map_view/<int:trip_id>')
    def map_view(trip_id):
        trip = Trip.query.get_or_404(trip_id)
        activities = Activity.query.filter_by(trip_id=trip_id).all()
        activity_data = [activity.to_dict() for activity in activities]
        return render_template('map_view.html', trip=trip, activities=activity_data)

    @bp.route('/create_vietnam_trip', methods=['POST'])
    def create_vietnam_trip():
        vietnam_trip = Trip(
            name="Vietnam Trip",
            start_date=datetime(2023, 10, 28).date(),
            end_date=datetime(2023, 11, 13).date()
        )
        db.session.add(vietnam_trip)
        db.session.commit()
        return redirect(url_for('routes.trip_detail', trip_id=vietnam_trip.id))

    # New routes for todo list functionality
    @bp.route('/add_todo/<int:trip_id>', methods=['POST'])
    def add_todo(trip_id):
        new_todo = Todo(
            trip_id=trip_id,
            title=request.form['title'],
            description=request.form.get('description', '')
        )
        db.session.add(new_todo)
        db.session.commit()
        return redirect(url_for('routes.trip_detail', trip_id=trip_id))

    @bp.route('/update_todo/<int:todo_id>', methods=['POST'])
    def update_todo(todo_id):
        todo = Todo.query.get_or_404(todo_id)
        todo.is_completed = not todo.is_completed
        db.session.commit()
        return jsonify({'success': True, 'is_completed': todo.is_completed})

    @bp.route('/delete_todo/<int:todo_id>', methods=['POST'])
    def delete_todo(todo_id):
        todo = Todo.query.get_or_404(todo_id)
        db.session.delete(todo)
        db.session.commit()
        return jsonify({'success': True})

    return bp
