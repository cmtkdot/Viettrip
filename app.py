import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "a secret key"
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///app.db")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    db.init_app(app)

    with app.app_context():
        from models import init_models
        Trip, Activity, Todo = init_models(db)
        db.drop_all()  # Drop all existing tables
        db.create_all()  # Recreate tables with updated schema

        # Import and register blueprints/routes
        from routes import init_routes
        app.register_blueprint(init_routes(db, Trip, Activity, Todo))

    return app
