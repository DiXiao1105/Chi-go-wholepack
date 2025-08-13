# Flask and DB setup (must come before route definitions)
# -------------------------------
from flask import abort

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from flask_cors import CORS

import uuid
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, origins=[r"http://localhost:\d+", r"http://127.0.0.1:\d+"], supports_credentials=True)  # Allow all origins by default

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://capstone:Group4!!!@capstone-nu.postgres.database.azure.com:5432/chi-go-database?sslmode=require'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Helper: check admin (for demo, allow all; add real check for production)
def require_admin():
    # TODO: Implement real admin check
    pass

# Models
# -------------------------------
class User(db.Model):
    id = db.Column(db.String(36), primary_key=True)  # UUID
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)  # Encrypted password
    role = db.Column(db.String(50), default="user", nullable=False)  # 'user' | 'admin'
    avatar = db.Column(db.String(200), nullable=True)  # Avatar URL
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

class Place(db.Model):
    id = db.Column(db.String(36), primary_key=True)  # UUID
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(200), nullable=True)  # Image URL
    category = db.Column(db.String(50), nullable=False)  # e.g., Park, Museum, Restaurant
    location_lat = db.Column(db.Float, nullable=False)  # Latitude
    location_lng = db.Column(db.Float, nullable=False)  # Longitude
    location_address = db.Column(db.String(200), nullable=False)  # Address
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

class Post(db.Model):
    id = db.Column(db.String(36), primary_key=True)  # UUID
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    checklist = db.Column(db.JSON, nullable=False)  # Array of items (itemId, itemType, name, image)
    likes = db.Column(db.JSON, nullable=True)  # Array of user IDs who liked the post
    like_count = db.Column(db.Integer, default=0, nullable=False)
    is_public = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableList

class Checklist(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    items = db.Column(MutableList.as_mutable(JSONB), default=list, nullable=False)  # ★
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)


@app.route('/api/places/rankings', methods=['GET'])
def get_places_rankings():
    # Get all places
    places = Place.query.all()
    checklists = Checklist.query.all()
    # Count how many checklists reference each place
    place_user_counts = {}
    for place in places:
        count = 0
        for checklist in checklists:
            # checklist.items is a list of dicts with itemId, itemType, etc.
            if any(i.get('itemId') == place.id for i in (checklist.items or [])):
                count += 1
        place_user_counts[place.id] = count
    # Split by category
    attractions = [
        {'name': p.name, 'userCount': place_user_counts.get(p.id, 0)}
        for p in places if p.category == 'Attraction'
    ]
    restaurants = [
        {'name': p.name, 'userCount': place_user_counts.get(p.id, 0)}
        for p in places if p.category == 'Restaurant'
    ]
    # Sort and take top 10
    attractions = sorted(attractions, key=lambda x: x['userCount'], reverse=True)[:10]
    restaurants = sorted(restaurants, key=lambda x: x['userCount'], reverse=True)[:10]
    return jsonify({
        'attractions': attractions,
        'restaurants': restaurants
    })

# add/delete checklist
@app.route('/api/checklists/<user_id>/add', methods=['POST'])
def add_to_user_checklist(user_id):
    data = request.get_json()
    checklist = Checklist.query.filter_by(user_id=user_id).first()

    if not checklist:
        checklist = Checklist(
            id=str(uuid.uuid4()),
            user_id=user_id,
            items=[],
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        db.session.add(checklist)

    items = list(checklist.items or [])
    if not any(i.get('itemId') == data['itemId'] and i.get('itemType') == data['itemType'] for i in items):
        items.append(data)
    checklist.items = items
    checklist.updated_at = datetime.datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Item added', 'items': checklist.items}), 200

@app.route('/api/checklists/<user_id>/remove', methods=['DELETE'])
def remove_from_user_checklist(user_id):
    data = request.get_json()
    item_id = data.get('itemId')
    item_type = data.get('itemType')

    checklist = Checklist.query.filter_by(user_id=user_id).first()
    if not checklist:
        return jsonify({'message': 'Checklist not found'}), 404

    items = [i for i in (checklist.items or []) if not (i.get('itemId') == item_id and i.get('itemType') == item_type)]
    checklist.items = items
    checklist.updated_at = datetime.datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Item removed', 'items': checklist.items}), 200


# -------------------------------
# API Endpoint to Create Post
# -------------------------------
@app.route('/api/posts', methods=['POST'])
def create_post():
    data = request.get_json()
    post = Post(
        id=str(uuid.uuid4()),
        user_id=data.get('user_id'),
        title=data.get('title'),
        description=data.get('description'),
        checklist=data.get('checklist', []),
        likes=[],
        like_count=0,
        is_public=True,
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.session.add(post)
    db.session.commit()
    return jsonify({'success': True, 'post_id': post.id}), 201

# -------------------------------
# Attractions Public API Endpoint
# -------------------------------
@app.route('/api/attractions', methods=['GET'])
def get_attractions():
    attractions = Place.query.filter_by(category='Attraction').all()
    return jsonify([
        {
            "_id": a.id,
            "name": a.name,
            "description": a.description,
            "image": a.image,
            "category": a.category,
            "location": {
                "lat": a.location_lat,
                "lng": a.location_lng,
                "address": a.location_address
            }
        }
        for a in attractions
    ])

# -------------------------------
# General Place Endpoints (for AdminPlaces.js, AddPlace.js)
# -------------------------------
@app.route('/api/places', methods=['GET'])
def get_places():
    places = Place.query.all()
    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "image": p.image,
            "category": p.category,
            "location_lat": p.location_lat,
            "location_lng": p.location_lng,
            "location_address": p.location_address,
            "is_active": p.is_active,
            "created_at": p.created_at,
            "updated_at": p.updated_at
        }
        for p in places
    ])

@app.route('/api/places', methods=['POST'])
def create_place():
    data = request.get_json()
    place = Place(
        id=str(uuid.uuid4()),
        name=data.get('name'),
        description=data.get('description'),
        image=data.get('image'),
        category=data.get('category', 'Attraction'),
        # Support both nested and top-level location fields for compatibility
    location_lat = data.get('location', {}).get('lat') if 'location' in data else data.get('location_lat'),
    location_lng = data.get('location', {}).get('lng') if 'location' in data else data.get('location_lng'),
    location_address = data.get('location', {}).get('address') if 'location' in data else data.get('location_address'),
        # ...existing code...
        is_active=data.get('isActive', True),
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.session.add(place)
    db.session.commit()
    return jsonify({'success': True, 'id': place.id})

@app.route('/api/places/<string:place_id>', methods=['DELETE'])
def delete_place(place_id):
    place = Place.query.get(place_id)
    if not place:
        return jsonify({'message': 'Place not found'}), 404
    db.session.delete(place)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/places/<place_id>', methods=['PUT'])
def update_place(place_id):
    data = request.get_json()
    place = Place.query.get(place_id)
    if not place:
        return jsonify({'message': 'Place not found'}), 404
    place.name = data.get('name', place.name)
    place.description = data.get('description', place.description)
    place.image = data.get('image', place.image)
    place.category = data.get('category', place.category)
    place.location_lat = data.get('location_lat', place.location_lat)
    place.location_lng = data.get('location_lng', place.location_lng)
    place.location_address = data.get('location_address', place.location_address)
    # Accept both camelCase and snake_case for is_active, and always update if present
    if 'is_active' in data:
        place.is_active = bool(data['is_active'])
    elif 'isActive' in data:
        place.is_active = bool(data['isActive'])
    place.updated_at = datetime.datetime.utcnow()
    db.session.commit()
    return jsonify({'success': True})


# -------------------------------
# General User Endpoints (for AdminUsers.js)
# -------------------------------
@app.route('/api/users/<string:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.role = data.get('role', user.role)
    user.avatar = data.get('avatar', user.avatar)
    user.is_active = data.get('is_active', user.is_active)
    user.updated_at = datetime.datetime.utcnow()
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/users/<string:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'success': True})
# -------------------------------
# Admin Endpoints
# -------------------------------

# Attractions management
@app.route('/admin/attractions', methods=['POST'])
def admin_create_attraction():
    require_admin()
    data = request.get_json()
    attraction = Place(
        id=str(uuid.uuid4()),
        name=data.get('name'),
        description=data.get('description'),
        image=data.get('image'),
        category='Attraction',
        location_lat=data['location']['lat'],
        location_lng=data['location']['lng'],
        location_address=data['location']['address'],
        is_active=data.get('isActive', True),
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.session.add(attraction)
    db.session.commit()
    return jsonify({'success': True, 'id': attraction.id})

@app.route('/admin/attractions/<string:attraction_id>', methods=['PUT'])
def admin_update_attraction(attraction_id):
    require_admin()
    data = request.get_json()
    attraction = Place.query.get(attraction_id)
    if not attraction:
        abort(404)
    attraction.name = data.get('name', attraction.name)
    attraction.description = data.get('description', attraction.description)
    attraction.image = data.get('image', attraction.image)
    attraction.location_lat = data['location']['lat']
    attraction.location_lng = data['location']['lng']
    attraction.location_address = data['location']['address']
    attraction.is_active = data.get('isActive', attraction.is_active)
    attraction.updated_at = datetime.datetime.utcnow()
    db.session.commit()
    return jsonify({'success': True})

@app.route('/admin/attractions/<string:attraction_id>', methods=['DELETE'])
def admin_delete_attraction(attraction_id):
    require_admin()
    attraction = Place.query.get(attraction_id)
    if not attraction:
        abort(404)
    db.session.delete(attraction)
    db.session.commit()
    return jsonify({'success': True})

# Restaurants management
@app.route('/admin/restaurants', methods=['POST'])
def admin_create_restaurant():
    require_admin()
    data = request.get_json()
    restaurant = Place(
        id=str(uuid.uuid4()),
        name=data.get('name'),
        description=data.get('description'),
        image=data.get('image'),
        category='Restaurant',
        location_lat=data['location']['lat'],
        location_lng=data['location']['lng'],
        location_address=data['location']['address'],
        is_active=data.get('isActive', True),
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.session.add(restaurant)
    db.session.commit()
    return jsonify({'success': True, 'id': restaurant.id})

@app.route('/admin/restaurants/<string:restaurant_id>', methods=['PUT'])
def admin_update_restaurant(restaurant_id):
    require_admin()
    data = request.get_json()
    restaurant = Place.query.get(restaurant_id)
    if not restaurant:
        abort(404)
    restaurant.name = data.get('name', restaurant.name)
    restaurant.description = data.get('description', restaurant.description)
    restaurant.image = data.get('image', restaurant.image)
    restaurant.location_lat = data['location']['lat']
    restaurant.location_lng = data['location']['lng']
    restaurant.location_address = data['location']['address']
    restaurant.is_active = data.get('isActive', restaurant.is_active)
    restaurant.updated_at = datetime.datetime.utcnow()
    db.session.commit()
    return jsonify({'success': True})

@app.route('/admin/restaurants/<string:restaurant_id>', methods=['DELETE'])
def admin_delete_restaurant(restaurant_id):
    require_admin()
    restaurant = Place.query.get(restaurant_id)
    if not restaurant:
        abort(404)
    db.session.delete(restaurant)
    db.session.commit()
    return jsonify({'success': True})

# Posts management
@app.route('/admin/posts', methods=['GET'])
def admin_get_all_posts():
    require_admin()
    posts = Post.query.all()
    return jsonify([
        {
            "id": post.id,
            "user_id": post.user_id,
            "title": post.title,
            "description": post.description,
            "checklist": post.checklist,
            "likes": post.likes,
            "like_count": post.like_count,
            "is_public": post.is_public,
            "created_at": post.created_at,
            "updated_at": post.updated_at
        }
        for post in posts
    ])

@app.route('/admin/posts/<string:post_id>', methods=['DELETE'])
def admin_delete_post(post_id):
    require_admin()
    post = Post.query.get(post_id)
    if not post:
        abort(404)
    db.session.delete(post)
    db.session.commit()
    return jsonify({'success': True})

# Users management
@app.route('/admin/users', methods=['GET'])
def admin_get_all_users():
    require_admin()
    users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "avatar": u.avatar,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "updated_at": u.updated_at
        }
        for u in users
    ])

@app.route('/admin/users/<string:user_id>', methods=['PUT'])
def admin_update_user(user_id):
    require_admin()
    data = request.get_json()
    user = User.query.get(user_id)
    if not user:
        abort(404)
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.role = data.get('role', user.role)
    user.avatar = data.get('avatar', user.avatar)
    user.is_active = data.get('is_active', user.is_active)
    user.updated_at = datetime.datetime.utcnow()
    db.session.commit()
    return jsonify({'success': True})

@app.route('/admin/users/<string:user_id>', methods=['DELETE'])
def admin_delete_user(user_id):
    require_admin()
    user = User.query.get(user_id)
    if not user:
        abort(404)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'success': True})



# -------------------------------
# API Endpoints for Individual Post (PUT/DELETE)
# -------------------------------
@app.route('/api/posts/<string:post_id>', methods=['PUT'])
def update_post(post_id):
    data = request.get_json()
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404
    post.title = data.get('title', post.title)
    post.description = data.get('description', post.description)
    post.checklist = data.get('checklist', post.checklist)
    post.updated_at = datetime.datetime.utcnow()
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/posts/<string:post_id>', methods=['DELETE'])
def delete_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404
    db.session.delete(post)
    db.session.commit()
    return jsonify({'success': True})

# -------------------------------
# Auth Endpoints
import uuid
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'message': 'Username or email already exists'}), 409
    user = User(
        id=str(uuid.uuid4()),
        username=username,
        email=email,
        password=generate_password_hash(password),
        role='user',
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow(),
        is_active=True
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'token': 'mock-jwt-token'  # Replace with real JWT in production
    })

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid username or password'}), 401
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'token': 'mock-jwt-token'  # Replace with real JWT in production
    })

# -------------------------------
# API Endpoints for Users
@app.route('/api/users/count', methods=['GET'])
def get_user_count():
    count = User.query.count()
    return jsonify({'count': count})
# -------------------------------
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "avatar": u.avatar,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "updated_at": u.updated_at
        }
        for u in users
    ])

# -------------------------------

# API Endpoints for Restaurants (alias for places with category 'Restaurant')
@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    restaurants = Place.query.filter_by(category='Restaurant').all()
    return jsonify([
        {
            "_id": r.id,
            "name": r.name,
            "description": r.description,
            "image": r.image,
            "cuisine": getattr(r, 'cuisine', ''),
            "location": {
                "lat": r.location_lat,
                "lng": r.location_lng,
                "address": r.location_address
            },
            "is_active": r.is_active,
            "created_at": r.created_at,
            "updated_at": r.updated_at
        }
        for r in restaurants
    ])


# -------------------------------
# API Endpoints for Posts
# -------------------------------
@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    # Fetch all user ids in posts
    user_ids = {post.user_id for post in posts}
    users = {u.id: u.username for u in User.query.filter(User.id.in_(user_ids)).all()}
    return jsonify([
        {
            "id": post.id,
            "user_id": post.user_id,
            "username": users.get(post.user_id, "User"),
            "title": post.title,
            "description": post.description,
            "checklist": post.checklist,
            "likes": post.likes,
            "like_count": post.like_count,
            "is_public": post.is_public,
            "created_at": post.created_at,
            "updated_at": post.updated_at
        }
        for post in posts
    ])


# -------------------------------
# API Endpoints for Checklist
# -------------------------------
@app.route('/api/checklists', methods=['GET'])
def get_checklists():
    checklists = Checklist.query.all()
    return jsonify([
        {
            "id": checklist.id,
            "user_id": checklist.user_id,
            "items": checklist.items,
            "created_at": checklist.created_at,
            "updated_at": checklist.updated_at
        }
        for checklist in checklists
    ])

@app.route('/api/checklists/<string:user_id>', methods=['GET'])
def get_user_checklist(user_id):
    checklist = Checklist.query.filter_by(user_id=user_id).first()
    if not checklist:
        return jsonify({"id": None, "user_id": user_id, "items": [], "created_at": None, "updated_at": None})
    items = checklist.items
    if isinstance(items, dict):
        items = list(items.values())
    elif not isinstance(items, list):
        items = []
    return jsonify({
        "id": checklist.id,
        "user_id": checklist.user_id,
        "items": items,
        "created_at": checklist.created_at,
        "updated_at": checklist.updated_at
    })

# Add item to checklist
@app.route('/api/checklists/<string:user_id>/add', methods=['POST'])
def add_to_checklist(user_id):
    data = request.get_json()
    print(f"[add_to_checklist] user_id={user_id}, data={data}")
    checklist = Checklist.query.filter_by(user_id=user_id).first()
    if not checklist:
        checklist = Checklist(
            id=str(uuid.uuid4()),
            user_id=user_id,
            items=[],
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        db.session.add(checklist)
        print(f"[add_to_checklist] Created new checklist: {checklist.id}")
    items = checklist.items or []
    print(f"[add_to_checklist] Before append, items={items}")
    # Prevent duplicates
    print(f"[add_to_checklist] Checking duplicates: data={data}, items={items}")
    if not any(item.get('itemId') == data.get('itemId') and item.get('itemType') == data.get('itemType') for item in items):
        items.append(data)
        print(f"[add_to_checklist] Appended item: {data}")
    else:
        print(f"[add_to_checklist] Duplicate item, not appended. data={data}, items={items}")
    checklist.items = list(items)
    checklist.updated_at = datetime.datetime.utcnow()
    print(f"[add_to_checklist] Before commit, checklist.items={checklist.items}")
    db.session.commit()
    print(f"[add_to_checklist] After commit, checklist.id={checklist.id}, items={checklist.items}")
    return jsonify({"success": True, "items": checklist.items})

# Remove item from checklist
@app.route('/api/checklists/<string:user_id>/remove', methods=['DELETE'])
def remove_from_checklist(user_id):
    item_id = request.args.get('itemId')
    item_type = request.args.get('itemType')
    checklist = Checklist.query.filter_by(user_id=user_id).first()
    if not checklist:
        return jsonify({"success": False, "message": "Checklist not found"}), 404
    items = checklist.items or []
    new_items = [item for item in items if not (item['itemId'] == item_id and item['itemType'] == item_type)]
    checklist.items = new_items
    checklist.updated_at = datetime.datetime.utcnow()
    db.session.commit()
    return jsonify({"success": True, "items": checklist.items})

# -------------------------------
# Run the Application
# -------------------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
