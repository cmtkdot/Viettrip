from app import db
from datetime import datetime

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    def __init__(self, **kwargs):
        super(Activity, self).__init__(**kwargs)

    def __repr__(self):
        return f'<Activity {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat(),
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'title': self.title,
            'location': self.location,
            'description': self.description,
            'category': self.category,
            'price': self.price,
            'latitude': self.latitude,
            'longitude': self.longitude
        }
