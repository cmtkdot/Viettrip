from app import db
from datetime import datetime

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Activity {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat(),
            'time': self.time.isoformat(),
            'title': self.title,
            'location': self.location,
            'description': self.description
        }
