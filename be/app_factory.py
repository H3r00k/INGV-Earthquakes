from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db
from flask_jwt_extended import JWTManager
from routes.earthquakes.earthquakes import earthquakes_bp

from models.auth.user import User
from routes.auth.auth import auth_bp
from models.data.earthquake import Earthquake

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    #inizializzazione estensioni
    db.init_app(app)
    
    #jwt token
    jwt = JWTManager(app)
    
    #CORS CONFIG
    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://localhost:4200",
            "http://127.0.0.1:4200",
        ]
    )
    
    #registrazioni blueprint
    app.register_blueprint(auth_bp)
    app.register_blueprint(earthquakes_bp)
    
    if app.config['FLASK_ENV'] == 'development':
        with app.app_context():
            db.create_all()
            
    
    #route di test
    @app.route('/')
    def home():
        return "DB creato con successo"

    return app
    
    
    