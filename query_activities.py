from main import app, db, Activity
from flask_sqlalchemy import SQLAlchemy

with app.app_context():
    activities = Activity.query.all()
    print([{'id': a.id, 'trip_id': a.trip_id, 'title': a.title, 'latitude': a.latitude, 'longitude': a.longitude} for a in activities])
