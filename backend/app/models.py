from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    progress = db.relationship('UserProgress', backref='user', lazy=True, uselist=False)
    ratings = db.relationship('UserRating', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'

class Album(db.Model):
    __tablename__ = 'albums'
    id = db.Column(db.Integer, primary_key=True)
    rank = db.Column(db.Integer, unique=True, nullable=False)
    artist = db.Column(db.String(255), nullable=False)
    album = db.Column(db.String(255), nullable=False)
    info = db.Column(db.Text)
    description = db.Column(db.Text)

    user_progress = db.relationship('UserProgress', backref='album', lazy=True)
    user_ratings = db.relationship('UserRating', backref='album', lazy=True)

    def __repr__(self):
        return f'<Album {self.rank}: {self.album} by {self.artist}>'

class UserProgress(db.Model):
    __tablename__ = 'user_progress'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    current_album_id = db.Column(db.Integer, db.ForeignKey('albums.id'), nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<UserProgress User: {self.user_id}, Current Album: {self.current_album_id}>'

class UserRating(db.Model):
    __tablename__ = 'user_ratings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    album_id = db.Column(db.Integer, db.ForeignKey('albums.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False) # e.g., 1-5 stars
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('user_id', 'album_id', name='_user_album_uc'),)

    def __repr__(self):
        return f'<UserRating User: {self.user_id}, Album: {self.album_id}, Rating: {self.rating}>'
