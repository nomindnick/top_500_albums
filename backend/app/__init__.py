from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    from app.routes import auth_bp, progress_bp, albums_bp, ratings_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(progress_bp, url_prefix='/api/progress')
    app.register_blueprint(albums_bp, url_prefix='/api/albums')
    app.register_blueprint(ratings_bp, url_prefix='/api/ratings')

    return app
