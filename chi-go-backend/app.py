# pip install flask flask_sqlalchemy psycopg2-binary flask_cors
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow all origins by default

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password123@localhost:5432/chi-go'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# -------------------------------
# Models
# -------------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)  # Add password field
    role = db.Column(db.String(50), nullable=False)  # "admin" or "user"

class Place(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)  # e.g. "Attraction" or "Restaurant"
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(50), nullable=False)  # e.g. Google Place ID

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    place_id = db.Column(db.Integer, db.ForeignKey('place.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('posts', lazy=True))
    place = db.relationship('Place', backref=db.backref('posts', lazy=True))

# -------------------------------
# API Endpoints for Users
# -------------------------------
@app.route('/api/users', methods=['GET'])
def get_users():
    query = request.args.get("query")
    role = request.args.get("role")  # Optional role filter

    # If no query is provided, return all users
    if not query and not role:
        users = User.query.all()
    else:
        users = User.query.filter(
            or_(
                User.name.ilike(f"%{query}%") if query else True,
                User.email.ilike(f"%{query}%") if query else True
            )
        )
        if role:
            users = users.filter_by(role=role)

    return jsonify([{"id": u.id, "name": u.name, "email": u.email, "role": u.role} for u in users])

@app.route('/api/users', methods=['POST'])
def register():
    data = request.get_json()
    new_user = User(
        name=data.get("name"),
        email=data.get("email"),
        password=data.get("password"),
        role=data.get("role")
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    user = User.query.get_or_404(user_id)
    user.name = data.get("name", user.name)
    user.email = data.get("email", user.email)
    user.password = data.get("password", user.password)
    user.role = data.get("role", user.role)
    db.session.commit()
    return jsonify({"message": "User updated", "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}})

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"})

@app.route('/api/users/count', methods=['GET'])
def get_total_users():
    count = User.query.count()
    return jsonify({"count": count})

# -------------------------------
# API Endpoints for Places
# -------------------------------
@app.route('/api/places', methods=['GET'])
def get_places():
    query = request.args.get("query")
    if query:
        q = f"%{query.lower()}%"
        places = Place.query.filter(
            or_(
                Place.type.ilike(q),
                Place.name.ilike(q),
                Place.address.ilike(q),
                Place.code.ilike(q)
            )
        ).all()
    else:
        places = Place.query.all()
    return jsonify([
        {"id": p.id, "type": p.type, "name": p.name, "address": p.address, "code": p.code} for p in places
    ])

@app.route('/api/places', methods=['POST'])
def add_place():
    data = request.get_json()
    new_place = Place(
        type=data.get("type"),
        name=data.get("name"),
        address=data.get("address"),
        code=data.get("code")
    )
    db.session.add(new_place)
    db.session.commit()
    return jsonify({
        "message": "Place added",
        "place": {"id": new_place.id, "type": new_place.type, "name": new_place.name, "address": new_place.address, "code": new_place.code}
    }), 201

@app.route('/api/places/<int:place_id>', methods=['PUT'])
def update_place(place_id):
    data = request.get_json()
    place = Place.query.get_or_404(place_id)
    place.type = data.get("type", place.type)
    place.name = data.get("name", place.name)
    place.address = data.get("address", place.address)
    place.code = data.get("code", place.code)
    db.session.commit()
    return jsonify({
        "message": "Place updated",
        "place": {"id": place.id, "type": place.type, "name": place.name, "address": place.address, "code": place.code}
    })

@app.route('/api/places/<int:place_id>', methods=['DELETE'])
def delete_place(place_id):
    place = Place.query.get_or_404(place_id)
    db.session.delete(place)
    db.session.commit()
    return jsonify({"message": "Place deleted"})

@app.route('/api/places/rankings', methods=['GET'])
def get_rankings():
    attractions = db.session.query(
        Place.name, db.func.count(Post.id).label("userCount")
    ).join(Post, Place.id == Post.place_id).filter(Place.type == "Attraction").group_by(Place.name).order_by(db.desc("userCount")).limit(5).all()

    restaurants = db.session.query(
        Place.name, db.func.count(Post.id).label("userCount")
    ).join(Post, Place.id == Post.place_id).filter(Place.type == "Restaurant").group_by(Place.name).order_by(db.desc("userCount")).limit(5).all()

    return jsonify({
        "attractions": [{"name": a[0], "userCount": a[1]} for a in attractions],
        "restaurants": [{"name": r[0], "userCount": r[1]} for r in restaurants]
    })

# -------------------------------
# API Endpoints for Posts
# -------------------------------
@app.route('/api/posts', methods=['GET'])
def get_all_posts():
    posts = Post.query.all()
    return jsonify([
        {
            "id": post.id,
            "user_name": post.user.name,
            "place_name": post.place.name,
            "place_type": post.place.type
        }
        for post in posts
    ])

@app.route('/api/posts', methods=['POST'])
def add_post():
    data = request.get_json()
    user_id = data.get("user_id")
    place_id = data.get("place_id")

    # Check if the user already added the place
    existing_post = Post.query.filter_by(user_id=user_id, place_id=place_id).first()
    if existing_post:
        return jsonify({"message": "Place already added"}), 400

    new_post = Post(user_id=user_id, place_id=place_id)
    db.session.add(new_post)
    db.session.commit()
    return jsonify({"message": "Place added to user's list"}), 201

@app.route('/api/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    data = request.get_json()
    post = Post.query.get_or_404(post_id)
    post.user_id = data.get("user_id", post.user_id)
    post.place_id = data.get("place_id", post.place_id)
    db.session.commit()
    return jsonify({"message": "Post updated"})

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted"})

@app.route('/api/posts/<int:user_id>', methods=['GET'])
def get_user_posts(user_id):
    posts = Post.query.filter_by(user_id=user_id).all()
    return jsonify([
        {"place_id": post.place_id, "place_name": post.place.name, "place_type": post.place.type}
        for post in posts
    ])

# -------------------------------
# API Endpoint for Login
# -------------------------------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    role = data.get("role")
    username = data.get("username")
    password = data.get("password")
    user = User.query.filter_by(name=username, role=role).first()
    if user and user.password == password:
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)