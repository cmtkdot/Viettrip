from main import app, db, Activity
from datetime import date

sample_activities = [
    {
        'trip_id': 1,
        'date': date(2024, 10, 29),
        'title': 'Visit Hanoi Old Quarter',
        'location': 'Hanoi Old Quarter, Vietnam',
        'latitude': 21.0338,
        'longitude': 105.8500
    },
    {
        'trip_id': 1,
        'date': date(2024, 10, 30),
        'title': 'Ha Long Bay Cruise',
        'location': 'Ha Long Bay, Vietnam',
        'latitude': 20.9101,
        'longitude': 107.1839
    },
    {
        'trip_id': 1,
        'date': date(2024, 11, 1),
        'title': 'Explore Hoi An Ancient Town',
        'location': 'Hoi An, Vietnam',
        'latitude': 15.8801,
        'longitude': 108.3380
    }
]

with app.app_context():
    for activity_data in sample_activities:
        activity = Activity(**activity_data)
        db.session.add(activity)
    db.session.commit()
    print("Sample activities added successfully.")
