"""
A1 Touch FC — FC 27 Squad Management Platform
Local Windows Python (Flask + SQLite) Backend
"""

import json
import os
from flask import Flask, request, jsonify, render_template_string, session
from models import db, User, Player, PlayerNote, SquadLineup

app = Flask(__name__)
app.config['SECRET_KEY'] = 'a1touchfc2027_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///a1_touch_fc.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def rank_players_for_position(target_pos, players, assigned_ids):
    recommendations = []
    for p in players:
        pos_score = 0
        match_type = "NONE"
        if p.main_position == target_pos:
            pos_score = 100
            match_type = "MAIN"
        elif p.secondary_position == target_pos:
            pos_score = 70
            match_type = "SECONDARY"
        elif p.third_position == target_pos:
            pos_score = 50
            match_type = "THIRD"

        avail_score = 25 if p.availability == 'AVAILABLE' else (-15 if p.availability == 'MAYBE' else -60)
        total_score = pos_score + (p.form_rating or 75) + avail_score

        recommendations.append({
            "player": p.to_dict(),
            "score": total_score,
            "matchType": match_type,
            "isAssigned": p.id in assigned_ids
        })

    # Sort priority: matchType then score
    weight = {"MAIN": 4000, "SECONDARY": 3000, "THIRD": 2000, "NONE": 0}
    recommendations.sort(key=lambda r: weight[r["matchType"]] + r["score"], reverse=True)
    return recommendations

@app.before_request
def setup_db():
    if not hasattr(app, 'db_initialized'):
        db.create_all()
        # Seed Messi if empty
        if Player.query.count() == 0:
            owner = User(username='owner', display_name='A1 Chairman', role='OWNER')
            owner.set_password('a1touch2027')
            db.session.add(owner)

            p = Player(
                display_name='Messi',
                discord_username='messi#1010',
                ea_fc_username='A1_Messi10',
                main_position='RW',
                secondary_position='CAM',
                third_position='ST',
                preferred_foot='Right',
                player_number=10,
                availability='AVAILABLE',
                form_rating=92,
                squad_status='STARTING_XI',
                bio='Elite playmaker and finisher'
            )
            db.session.add(p)
            db.session.commit()
        app.db_initialized = True

@app.route('/api/players', methods=['GET', 'POST'])
def api_players():
    if request.method == 'POST':
        data = request.json or {}
        p = Player(
            display_name=data.get('displayName'),
            discord_username=data.get('discordUsername'),
            ea_fc_username=data.get('eaFcUsername'),
            main_position=data.get('mainPosition'),
            secondary_position=data.get('secondaryPosition'),
            third_position=data.get('thirdPosition') or None,
            preferred_foot=data.get('preferredFoot', 'Right'),
            player_number=int(data.get('playerNumber', 10)),
            availability=data.get('availability', 'AVAILABLE'),
            availability_reason=data.get('availabilityReason'),
            available_after=data.get('availableAfter'),
            form_rating=75,
            squad_status='RESERVE',
            bio=data.get('bio')
        )
        db.session.add(p)
        db.session.commit()
        return jsonify({"ok": True, "player": p.to_dict()})

    players = Player.query.all()
    return jsonify({"players": [p.to_dict() for p in players]})

@app.route('/api/recommendations', methods=['GET'])
def api_recommendations():
    pos = request.args.get('position', 'ST')
    players = Player.query.all()
    recs = rank_players_for_position(pos, players, set())
    return jsonify({"position": pos, "recommendations": recs})

if __name__ == '__main__':
    print("==================================================")
    print("A1 TOUCH FC — Windows Python Server Running!")
    print("Local URL: http://127.0.0.1:5000")
    print("Database: SQLite (a1_touch_fc.db)")
    print("==================================================")
    app.run(host='127.0.0.1', port=5000, debug=True)
