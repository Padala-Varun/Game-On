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
app.config['MONGO_URI'] = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/gamehub')
mongo = PyMongo(app)

# Session-based auth helper
def get_user_from_request(request):
    user_id = request.cookies.get('user_id')
    if not user_id:
        return None
    return mongo.db.users.find_one({'_id': user_id})

# Auth middleware
def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user = get_user_from_request(request)
        if not current_user:
            return jsonify({'message': 'Authentication required!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Sample games data
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

# Initialize games in MongoDB if empty
def init_games():
    if mongo.db.games.count_documents({}) == 0:
        mongo.db.games.insert_many(GAMES)
        print("Games initialized in database")

@app.route('/')
def index():
    return jsonify({"message": "Welcome to GameHub API!"})

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if mongo.db.users.find_one({'email': data['email']}):
        return jsonify({'message': 'Email already registered!'}), 409

    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    new_user = {
        '_id': str(uuid.uuid4()),
        'username': data['username'],
        'email': data['email'],
        'password': hashed_password,
        'created_at': datetime.datetime.utcnow()
    }
    mongo.db.users.insert_one(new_user)

    response = make_response(jsonify({
        'message': 'User created successfully!',
        'user': {
            'id': new_user['_id'],
            'username': new_user['username'],
            'email': new_user['email']
        }
    }))
    response.set_cookie('user_id', new_user['_id'], httponly=True, max_age=60*60*24*7)
    return response, 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = mongo.db.users.find_one({'email': data['email']})
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Invalid email or password!'}), 401

    response = make_response(jsonify({
        'message': 'Login successful!',
        'user': {
            'id': user['_id'],
            'username': user['username'],
            'email': user['email']
        }
    }))
    response.set_cookie('user_id', user['_id'], httponly=True, max_age=60*60*24*7)
    return response

@app.route('/api/auth/logout', methods=['POST'])
@auth_required
def logout(current_user):
    response = make_response(jsonify({'message': 'Logged out successfully!'}))
    response.delete_cookie('user_id')
    return response

@app.route('/api/games', methods=['GET'])
def get_games():
    games = list(mongo.db.games.find({}, {'_id': 0}))
    return jsonify(games)

@app.route('/api/placeholder/<int:width>/<int:height>')
def placeholder(width, height):
    return jsonify({
        "message": f"This is a placeholder image: {width}x{height}"
    })

if __name__ == '__main__':
    init_games()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
