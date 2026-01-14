from extensions import db

class Earthquake(db.Model):
    __tablename__ = 'earthquake'
    id = db.Column(db.Integer, primary_key=True)
    ingv_id = db.Column(db.String, unique=True, nullable=False)
    time = db.Column(db.DateTime, nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    depth_km = db.Column(db.Float, nullable=True)
    mag = db.Column(db.Float, nullable=True)
    place = db.Column(db.String(255), nullable=True)
    
    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)