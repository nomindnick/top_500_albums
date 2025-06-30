from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    # In production, static files are in /app/static
    # In development, they're in ../static relative to this file
    if os.environ.get('FLASK_ENV') == 'production':
        static_folder = '/app/static'
    else:
        static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../frontend/dist')
    
    app = Flask(__name__, static_folder=static_folder, static_url_path='/')
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configure CORS for production
    if os.environ.get('FLASK_ENV') == 'production':
        CORS(app, resources={r"/api/*": {"origins": "*"}})
    else:
        CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]}})

    try:
        from app.routes import auth_bp, progress_bp, albums_bp, ratings_bp
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(progress_bp, url_prefix='/api/progress')
        app.register_blueprint(albums_bp, url_prefix='/api/albums')
        app.register_blueprint(ratings_bp, url_prefix='/api/ratings')
    except Exception as e:
        print(f"Error importing routes: {e}")
        import traceback
        traceback.print_exc()
    
    # Add a debug endpoint to test if Flask is running
    @app.route('/api/health')
    def health_check():
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods),
                'path': str(rule)
            })
        return {
            'status': 'ok', 
            'env': os.environ.get('FLASK_ENV', 'not set'),
            'routes_count': len(routes),
            'routes': routes
        }
    
    # Serve React app in production
    if os.environ.get('FLASK_ENV') == 'production':
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_react_app(path):
            # Don't match API routes
            if path.startswith('api/'):
                return {'error': 'Not found'}, 404
            
            # Check if it's a static file
            if path and os.path.exists(os.path.join(app.static_folder, path)):
                return send_from_directory(app.static_folder, path)
            
            # For all other routes, return index.html (React Router will handle it)
            return send_from_directory(app.static_folder, 'index.html')

    return app
