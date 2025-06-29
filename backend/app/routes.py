from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User, UserProgress, Album, UserRating

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'Missing username, email, or password'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password_hash=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({
        'message': 'Login successful',
        'user_id': user.id,
        'access_token': access_token,
        'username': user.username,
        'email': user.email
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Successfully logged out'}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email
    }), 200

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('', methods=['GET'])
@jwt_required()
def get_progress():
    user_id = get_jwt_identity()
    
    user_progress = UserProgress.query.filter_by(user_id=user_id).first()
    
    if not user_progress:
        return jsonify({'message': 'No progress found', 'needs_onboarding': True}), 404
    
    if user_progress and user_progress.album:
        # Check if user has completed all albums
        if user_progress.album.rank == 1:
            # Check if they've actually marked it as complete
            completed_albums = UserRating.query.filter_by(user_id=user_id).count()
            if completed_albums >= 500:
                return jsonify({
                    'all_completed': True,
                    'message': 'All albums completed!'
                }), 200
        
        return jsonify({
            'all_completed': False,
            'current_album': {
                'id': user_progress.album.id,
                'rank': user_progress.album.rank,
                'artist': user_progress.album.artist,
                'album': user_progress.album.album,
                'info': user_progress.album.info,
                'description': user_progress.album.description
            }
        }), 200
    
    return jsonify({'message': 'No album data found'}), 404

@progress_bp.route('/initialize', methods=['POST'])
@jwt_required()
def initialize_progress():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Check if user already has progress
    existing_progress = UserProgress.query.filter_by(user_id=user_id).first()
    if existing_progress:
        return jsonify({'message': 'Progress already initialized'}), 400
    
    album_rank = data.get('album_rank', 500)  # Default to 500 if not specified
    
    # Validate rank
    if not isinstance(album_rank, int) or album_rank < 1 or album_rank > 500:
        return jsonify({'message': 'Invalid album rank. Must be between 1 and 500'}), 400
    
    # Find the album by rank
    album = Album.query.filter_by(rank=album_rank).first()
    if not album:
        return jsonify({'message': f'Album with rank {album_rank} not found'}), 404
    
    # Create user progress
    user_progress = UserProgress(user_id=user_id, current_album_id=album.id)
    db.session.add(user_progress)
    db.session.commit()
    
    return jsonify({
        'message': 'Progress initialized successfully',
        'current_album': {
            'id': album.id,
            'rank': album.rank,
            'artist': album.artist,
            'album': album.album,
            'info': album.info,
            'description': album.description
        }
    }), 201

@progress_bp.route('/complete', methods=['POST'])
@jwt_required()
def complete_album():
    user_id = get_jwt_identity()
    
    user_progress = UserProgress.query.filter_by(user_id=user_id).first()
    
    if not user_progress:
        return jsonify({'message': 'No progress found for user'}), 404
    
    current_album = user_progress.album
    if not current_album:
        return jsonify({'message': 'No current album found'}), 404
    
    if current_album.rank == 1:
        return jsonify({
            'message': 'Congratulations! You\'ve completed all 500 albums!',
            'all_completed': True
        }), 200
    
    next_album = Album.query.filter_by(rank=current_album.rank - 1).first()
    
    if not next_album:
        return jsonify({'message': 'Next album not found'}), 404
    
    user_progress.current_album_id = next_album.id
    db.session.commit()
    
    return jsonify({
        'message': 'Album completed successfully',
        'all_completed': False,
        'next_album': {
            'id': next_album.id,
            'rank': next_album.rank,
            'artist': next_album.artist,
            'album': next_album.album,
            'info': next_album.info,
            'description': next_album.description
        }
    }), 200

albums_bp = Blueprint('albums', __name__)

@albums_bp.route('', methods=['GET'])
@jwt_required()
def get_albums():
    albums = Album.query.order_by(Album.rank.desc()).all()
    
    albums_data = [{
        'id': album.id,
        'rank': album.rank,
        'artist': album.artist,
        'album': album.album,
        'info': album.info,
        'description': album.description
    } for album in albums]
    
    return jsonify({'albums': albums_data}), 200

ratings_bp = Blueprint('ratings', __name__)

@ratings_bp.route('', methods=['POST'])
@jwt_required()
def submit_rating():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    album_id = data.get('album_id')
    rating = data.get('rating')
    
    if not album_id or rating is None:
        return jsonify({'message': 'Missing album_id or rating'}), 400
    
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({'message': 'Rating must be an integer between 1 and 5'}), 400
    
    album = Album.query.get(album_id)
    if not album:
        return jsonify({'message': 'Album not found'}), 404
    
    existing_rating = UserRating.query.filter_by(user_id=user_id, album_id=album_id).first()
    
    if existing_rating:
        existing_rating.rating = rating
    else:
        new_rating = UserRating(user_id=user_id, album_id=album_id, rating=rating)
        db.session.add(new_rating)
    
    db.session.commit()
    
    return jsonify({'message': 'Rating submitted successfully'}), 200

@ratings_bp.route('', methods=['GET'])
@jwt_required()
def get_ratings():
    user_id = get_jwt_identity()
    
    ratings = UserRating.query.filter_by(user_id=user_id).join(Album).order_by(Album.rank.desc()).all()
    
    ratings_data = [{
        'id': rating.id,
        'album_id': rating.album_id,
        'rating': rating.rating,
        'created_at': rating.created_at.isoformat(),
        'album': {
            'id': rating.album.id,
            'rank': rating.album.rank,
            'artist': rating.album.artist,
            'album': rating.album.album
        }
    } for rating in ratings]
    
    return jsonify({'ratings': ratings_data}), 200
