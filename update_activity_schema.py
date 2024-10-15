from main import app, db
from sqlalchemy import text

with app.app_context():
    # Alter the 'activity' table to make 'start_time', 'end_time', 'category', and 'price' nullable
    db.session.execute(text("ALTER TABLE activity ALTER COLUMN start_time DROP NOT NULL;"))
    db.session.execute(text("ALTER TABLE activity ALTER COLUMN end_time DROP NOT NULL;"))
    db.session.execute(text("ALTER TABLE activity ALTER COLUMN category DROP NOT NULL;"))
    db.session.execute(text("ALTER TABLE activity ALTER COLUMN price DROP NOT NULL;"))
    db.session.commit()
    print("Activity table schema updated successfully.")
