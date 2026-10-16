"""
A1 Touch FC — FC 27 Squad Management Database Models (SQLite & SQLAlchemy)
Compatible with local Windows Python runtime.
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    display_name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), default='PLAYER') # OWNER, MANAGER, ASSISTANT_MANAGER, PLAYER
    player_id = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Player(db.Model):
    __tablename__ = 'players'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)
    display_name = db.Column(db.String(100), nullable=False)
    discord_username = db.Column(db.String(80), nullable=False)
    ea_fc_username = db.Column(db.String(80), nullable=False)
    main_position = db.Column(db.String(10), nullable=False)
    secondary_position = db.Column(db.String(10), nullable=False)
    third_position = db.Column(db.String(10), nullable=True)
    preferred_foot = db.Column(db.String(10), default='Right')
    player_number = db.Column(db.Integer, default=10)
    availability = db.Column(db.String(20), default='AVAILABLE') # AVAILABLE, MAYBE, UNAVAILABLE
    availability_reason = db.Column(db.Text, nullable=True)
    available_after = db.Column(db.String(30), nullable=True)
    form_rating = db.Column(db.Integer, default=75) # 0 to 100
    squad_status = db.Column(db.String(30), default='RESERVE') # STARTING_XI, BENCH, RESERVE, UNAVAILABLE, TRIALIST
    bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "displayName": self.display_name,
            "discordUsername": self.discord_username,
            "eaFcUsername": self.ea_fc_username,
            "mainPosition": self.main_position,
            "secondaryPosition": self.secondary_position,
            "thirdPosition": self.third_position,
            "preferredFoot": self.preferred_foot,
            "playerNumber": self.player_number,
            "availability": self.availability,
            "availabilityReason": self.availability_reason,
            "availableAfter": self.available_after,
            "formRating": self.form_rating,
            "squadStatus": self.squad_status,
            "bio": self.bio,
        }

class PlayerNote(db.Model):
    __tablename__ = 'player_notes'
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    author_name = db.Column(db.String(100), nullable=False)
    author_role = db.Column(db.String(50), nullable=False)
    note = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SquadLineup(db.Model):
    __tablename__ = 'squad_lineups'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), default='A1 Touch FC Starting XI')
    formation = db.Column(db.String(20), default='4-3-3')
    is_active = db.Column(db.Boolean, default=True)
    starting_slots_json = db.Column(db.Text, nullable=False)
    bench_player_ids_json = db.Column(db.Text, default='[]')
    updated_by = db.Column(db.String(100), default='Manager')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
