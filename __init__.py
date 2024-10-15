from .app import create_app, db
from .models import init_models
from .routes import init_routes

def create_and_configure_app():
    app = create_app()
    Trip, Activity, Todo = init_models(db)
    bp = init_routes(db, Trip, Activity, Todo)
    app.register_blueprint(bp)
    return app

app = create_and_configure_app()

if __name__ == '__main__':
    app.run(debug=True)
