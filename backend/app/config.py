import os
from datetime import timedelta

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'postgresql://albums_countdown_user:nick6196@localhost:5432/albums_countdown_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Production settings
    if os.environ.get('FLASK_ENV') == 'production':
        # Ensure critical keys are set in production
        if JWT_SECRET_KEY == 'dev-secret-key-change-in-production':
            raise ValueError("JWT_SECRET_KEY must be set in production!")
        if SECRET_KEY == 'dev-secret-key':
            raise ValueError("SECRET_KEY must be set in production!")
