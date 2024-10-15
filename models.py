from datetime import datetime

def init_models(db):
    class Trip(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(100), nullable=False)
        start_date = db.Column(db.Date, nullable=False)
        end_date = db.Column(db.Date, nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)

        activities = db.relationship('Activity', back_populates='trip', cascade='all, delete-orphan')
        todos = db.relationship('Todo', back_populates='trip', cascade='all, delete-orphan')

        def __repr__(self):
            return f'<Trip {self.name}>'

        def to_dict(self):
            return {
                'id': self.id,
                'name': self.name,
                'start_date': self.start_date.isoformat(),
                'end_date': self.end_date.isoformat(),
            }

    class Activity(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        trip_id = db.Column(db.Integer, db.ForeignKey('trip.id'), nullable=False)
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

        trip = db.relationship('Trip', back_populates='activities')

        def __repr__(self):
            return f'<Activity {self.title}>'

        def to_dict(self):
            return {
                'id': self.id,
                'trip_id': self.trip_id,
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

    class Todo(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        trip_id = db.Column(db.Integer, db.ForeignKey('trip.id'), nullable=False)
        title = db.Column(db.String(100), nullable=False)
        description = db.Column(db.Text, nullable=True)
        is_completed = db.Column(db.Boolean, default=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)

        trip = db.relationship('Trip', back_populates='todos')

        def __repr__(self):
            return f'<Todo {self.title}>'

        def to_dict(self):
            return {
                'id': self.id,
                'trip_id': self.trip_id,
                'title': self.title,
                'description': self.description,
                'is_completed': self.is_completed,
                'created_at': self.created_at.isoformat()
            }

    return Trip, Activity, Todo
