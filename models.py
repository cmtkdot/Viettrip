from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY

db = SQLAlchemy()

class Trip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    destination = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    activities = db.Column(ARRAY(db.String(100)))

    def to_dict(self):
        return {
            'id': self.id,
            'destination': self.destination,
            'startDate': self.start_date.isoformat(),
            'endDate': self.end_date.isoformat(),
            'activities': self.activities
        }
