# app.py
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import uuid
from functools import wraps
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configuration from environment variables
app.config['MONGO_URI'] = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/gamehub')
mongo = PyMongo(app)

# Session-based auth helper
def get_user_from_request(request):
    # Get user ID from session cookie instead of JWT
    user_id = request.cookies.get('user_id')
    
    if not user_id:
        return None
    
    # Find user in database
    user = mongo.db.users.find_one({'_id': user_id})
    return user

# Auth middleware
def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user = get_user_from_request(request)
        
        if not current_user:
            return jsonify({'message': 'Authentication required!'}), 401
        
        # Pass the current user to the route
        return f(current_user, *args, **kwargs)
    
    return decorated

# Sample games data - in production, this would come from MongoDB
GAMES = [
    {
        "id": "game1",
        "title": "Snake Classic",
        "description": "Navigate the snake to collect food and grow longer without hitting walls or yourself.",
        "imageUrl": "/api/placeholder/400/320",
        "difficulty": "Easy"
    },
    {
        "id": "game2",
        "title": "Memory Match",
        "description": "Test your memory by matching pairs of cards in this classic concentration game.",
        "imageUrl": "/api/placeholder/400/320",
        "difficulty": "Medium"
    },
    {
        "id": "game3",
        "title": "Space Shooter",
        "description": "Defend Earth from alien invaders in this action-packed space adventure.",
        "imageUrl": "/api/placeholder/400/320",
        "difficulty": "Hard"
    },
    {
        "id": "game4",
        "title": "Puzzle Master",
        "description": "Solve challenging puzzles and train your brain with this addictive game.",
        "imageUrl": "/api/placeholder/400/320",
        "difficulty": "Medium"
    }
]

# Initialize games in MongoDB if they don't exist
def init_games():
    if mongo.db.games.count_documents({}) == 0:
        mongo.db.games.insert_many(GAMES)
        print("Games initialized in database")

# Routes
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    # Check if email already exists
    if mongo.db.users.find_one({'email': data['email']}):
        return jsonify({'message': 'Email already registered!'}), 409
    
    # Hash the password
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    
    # Create new user
    new_user = {
        '_id': str(uuid.uuid4()),
        'username': data['username'],
        'email': data['email'],
        'password': hashed_password,
        'created_at': datetime.datetime.utcnow()
    }
    
    mongo.db.users.insert_one(new_user)
    
    # Create response with session cookie
    response = make_response(jsonify({
        'message': 'User created successfully!',
        'user': {
            'id': new_user['_id'],
            'username': new_user['username'],
            'email': new_user['email']
        }
    }))
    
    # Set session cookie with user ID
    response.set_cookie('user_id', new_user['_id'], httponly=True, max_age=60*60*24*7)  # 7 days
    
    return response, 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Find user by email
    user = mongo.db.users.find_one({'email': data['email']})
    
    if not user:
        return jsonify({'message': 'Invalid email or password!'}), 401
    
    # Check password
    if check_password_hash(user['password'], data['password']):
        # Create response with session cookie
        response = make_response(jsonify({
            'message': 'Login successful!',
            'user': {
                'id': user['_id'],
                'username': user['username'],
                'email': user['email']
            }
        }))
        
        # Set session cookie with user ID
        response.set_cookie('user_id', user['_id'], httponly=True, max_age=60*60*24*7)  # 7 days
        
        return response
    
    return jsonify({'message': 'Invalid email or password!'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({'message': 'Logged out successfully!'}))
    response.delete_cookie('user_id')
    return response

@app.route('/api/auth/me', methods=['GET'])
@auth_required
def get_current_user(current_user):
    return jsonify({
        'id': current_user['_id'],
        'username': current_user['username'],
        'email': current_user['email']
    })

@app.route('/api/games', methods=['GET'])
def get_games():
    # Fetch games from MongoDB
    games = list(mongo.db.games.find({}, {'_id': 0}))
    return jsonify(games)

@app.route('/api/games/<game_id>/play', methods=['POST'])
@auth_required
def play_game(current_user, game_id):
    # Find game
    game = mongo.db.games.find_one({'id': game_id})
    
    if not game:
        return jsonify({'message': 'Game not found!'}), 404
    
    # Record game session
    game_session = {
        '_id': str(uuid.uuid4()),
        'user_id': current_user['_id'],
        'game_id': game_id,
        'started_at': datetime.datetime.utcnow(),
        'status': 'active'
    }
    
    mongo.db.game_sessions.insert_one(game_session)
    
    return jsonify({
        'message': 'Game session started!',
        'session_id': game_session['_id'],
        'game_id': game_id,
        'title': game['title']
    })

if __name__ == '__main__':
    init_games()  # Initialize games in MongoDB
    app.run(debug=True)