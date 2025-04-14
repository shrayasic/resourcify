from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from datetime import timedelta
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import os

load_dotenv()

app = Flask(__name__)

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.environ.get("CLOUD_NAME"),
    api_key=os.environ.get("API_KEY"),
    api_secret=os.environ.get("API_SECRET"),
)

# Configure MongoDB connection
app.config["MONGO_URI"] = os.environ.get("MONGO_URI")
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

# Collections
users = mongo.db.users
topics = mongo.db.topics
subtopics = mongo.db.subtopics
resources = mongo.db.resources

# Authentication Routes
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    # Validate input fields
    if not all(key in data for key in ["username", "password", "gmail"]):
        return jsonify({"message": "Missing required fields: username, password, and gmail"}), 400

    # Check if username or Gmail already exists
    if users.find_one({"username": data["username"]}):
        return jsonify({"message": "Username already exists"}), 400
    if users.find_one({"gmail": data["gmail"]}):
        return jsonify({"message": "Gmail already exists"}), 400

    # Hash password
    hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    # Insert new user
    user_id = users.insert_one({
        "username": data["username"],
        "password": hashed_password,
        "gmail": data["gmail"]
    }).inserted_id

    return jsonify({"message": "User created successfully", "user_id": str(user_id)}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    user = users.find_one({"username": data["username"]})
    
    if not user or not bcrypt.check_password_hash(user["password"], data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401
    
    access_token = create_access_token(identity=str(user["_id"]))
    return jsonify(access_token=access_token), 200

# Topic Routes
@app.route("/api/topics", methods=["GET"])
@jwt_required()
def get_topics():
    user_id = get_jwt_identity()
    user_topics = list(topics.find({"user_id": user_id}))
    
    # Convert ObjectId to string for JSON serialization
    for topic in user_topics:
        topic["_id"] = str(topic["_id"])
    
    return jsonify(user_topics), 200

@app.route("/api/topics", methods=["POST"])
@jwt_required()
def create_topic():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Insert new topic
    topic_id = topics.insert_one({
        "name": data["name"],
        "user_id": user_id
    }).inserted_id
    
    return jsonify({"_id": str(topic_id), "name": data["name"]}), 201

@app.route("/api/topics/search", methods=["GET"])
@jwt_required()
def search_topics():
    query = request.args.get("query", "")
    user_id = get_jwt_identity()
    
    # Search topics by name
    user_topics = list(topics.find({
        "user_id": user_id,
        "name": {"$regex": query, "$options": "i"}  # Case-insensitive search
    }))
    
    # Convert ObjectId to string for JSON serialization
    for topic in user_topics:
        topic["_id"] = str(topic["_id"])
    
    return jsonify(user_topics), 200

# Subtopic Routes
@app.route("/api/topics/<topic_id>/subtopics", methods=["GET"])
@jwt_required()
def get_subtopics(topic_id):
    user_id = get_jwt_identity()
    
    # Verify topic belongs to user
    topic = topics.find_one({"_id": ObjectId(topic_id), "user_id": user_id})
    if not topic:
        return jsonify({"message": "Topic not found"}), 404
    
    topic_subtopics = list(subtopics.find({"topic_id": topic_id}))
    
    # Convert ObjectId to string for JSON serialization
    for subtopic in topic_subtopics:
        subtopic["_id"] = str(subtopic["_id"])
    
    return jsonify(topic_subtopics), 200

@app.route("/api/topics/<topic_id>/subtopics", methods=["POST"])
@jwt_required()
def create_subtopic(topic_id):
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Verify topic belongs to user
    topic = topics.find_one({"_id": ObjectId(topic_id), "user_id": user_id})
    if not topic:
        return jsonify({"message": "Topic not found"}), 404
    
    # Insert new subtopic
    subtopic_id = subtopics.insert_one({
        "name": data["name"],
        "topic_id": topic_id
    }).inserted_id
    
    return jsonify({"_id": str(subtopic_id), "name": data["name"]}), 201

@app.route("/api/topics/<topic_id>/subtopics/search", methods=["GET"])
@jwt_required()
def search_subtopics(topic_id):
    query = request.args.get("query", "")
    user_id = get_jwt_identity()
    
    # Verify topic belongs to user
    topic = topics.find_one({"_id": ObjectId(topic_id), "user_id": user_id})
    if not topic:
        return jsonify({"message": "Topic not found"}), 404
    
    # Search subtopics by name
    topic_subtopics = list(subtopics.find({
        "topic_id": topic_id,
        "name": {"$regex": query, "$options": "i"}  # Case-insensitive search
    }))
    
    # Convert ObjectId to string for JSON serialization
    for subtopic in topic_subtopics:
        subtopic["_id"] = str(subtopic["_id"])
    
    return jsonify(topic_subtopics), 200

# Resource Routes
@app.route("/api/subtopics/<subtopic_id>/resources", methods=["GET"])
@jwt_required()
def get_resources(subtopic_id):
    user_id = get_jwt_identity()
    tag_filter = request.args.get("tag", None)
    
    # Find the subtopic
    subtopic = subtopics.find_one({"_id": ObjectId(subtopic_id)})
    if not subtopic:
        return jsonify({"message": "Subtopic not found"}), 404
    
    # Verify topic belongs to user
    topic = topics.find_one({"_id": ObjectId(subtopic["topic_id"]), "user_id": user_id})
    if not topic:
        return jsonify({"message": "Access denied"}), 403
    
    # Build query based on tag filter
    query = {"subtopic_id": subtopic_id}
    if tag_filter:
        query["tag"] = tag_filter
    
    subtopic_resources = list(resources.find(query))
    
    # Convert ObjectId to string for JSON serialization
    for resource in subtopic_resources:
        resource["_id"] = str(resource["_id"])
    
    return jsonify(subtopic_resources), 200

@app.route("/api/subtopics/<subtopic_id>/resources", methods=["POST"])
@jwt_required()
def create_resource(subtopic_id):
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Find the subtopic
    subtopic = subtopics.find_one({"_id": ObjectId(subtopic_id)})
    if not subtopic:
        return jsonify({"message": "Subtopic not found"}), 404
    
    # Verify topic belongs to user
    topic = topics.find_one({"_id": ObjectId(subtopic["topic_id"]), "user_id": user_id})
    if not topic:
        return jsonify({"message": "Access denied"}), 403
    
    # Insert new resource
    resource_id = resources.insert_one({
        "title": data["title"],
        "url": data["url"],
        "tag": data["tag"],
        "subtopic_id": subtopic_id
    }).inserted_id
    
    return jsonify({
        "_id": str(resource_id),
        "title": data["title"],
        "url": data["url"],
        "tag": data["tag"]
    }), 201

# New route for file upload
@app.route("/api/subtopics/<subtopic_id>/resources/upload", methods=["POST"])
@jwt_required()
def upload_resource(subtopic_id):
    user_id = get_jwt_identity()

    # Find the subtopic
    subtopic = subtopics.find_one({"_id": ObjectId(subtopic_id)})
    if not subtopic:
        return jsonify({"message": "Subtopic not found"}), 404

    # Verify topic belongs to user
    topic = topics.find_one({"_id": ObjectId(subtopic["topic_id"]), "user_id": user_id})
    if not topic:
        return jsonify({"message": "Access denied"}), 403

    title = request.form.get('title')
    tag = request.form.get('tag')
    uploaded_file = request.files.get('file')

    if not uploaded_file:
        return jsonify({"message": "No file uploaded"}), 400

    try:
        # Upload the file to Cloudinary
        upload_result = cloudinary.uploader.upload(
            uploaded_file,
            resource_type="auto",  # This allows Cloudinary to detect the file type
            access_mode="public"   # Ensures the resource is publicly accessible
        )
        file_url = upload_result['secure_url']

        file_type = uploaded_file.content_type
        file_name = secure_filename(uploaded_file.filename)

        # Insert new resource
        resource_id = resources.insert_one({
            "title": title,
            "url": file_url,
            "tag": tag,
            "subtopic_id": subtopic_id,
            "file_type": file_type,
            "file_name": file_name
        }).inserted_id

        return jsonify({
            "_id": str(resource_id),
            "title": title,
            "url": file_url,
            "tag": tag,
            "file_type": file_type,
            "file_name": file_name
        }), 201
    except Exception as e:
        print(e)
        return jsonify({"message": "File upload failed"}), 500

@app.route("/api/tags", methods=["GET"])
@jwt_required()
def get_tags():
    # Get unique tags across all resources
    all_tags = resources.distinct("tag")
    return jsonify(all_tags), 200

# Topic Deletion Route
@app.route("/api/topics/<topic_id>", methods=["DELETE"])
@jwt_required()
def delete_topic(topic_id):
    user_id = get_jwt_identity()

    # Verify topic belongs to user
    topic = topics.find_one({"_id": ObjectId(topic_id), "user_id": user_id})
    if not topic:
        return jsonify({"message": "Topic not found"}), 404

    # Delete the topic and its associated subtopics and resources
    subtopics.delete_many({"topic_id": topic_id})
    resources.delete_many({"subtopic_id": {"$in": [
        str(subtopic["_id"]) for subtopic in subtopics.find({"topic_id": topic_id})
    ]}})
    topics.delete_one({"_id": ObjectId(topic_id)})

    return jsonify({"message": "Topic deleted successfully"}), 200

# Subtopic Deletion Route
@app.route("/api/topics/<topic_id>/subtopics/<subtopic_id>", methods=["DELETE"])
@jwt_required()
def delete_subtopic(topic_id, subtopic_id):
    user_id = get_jwt_identity()

    # Verify subtopic belongs to the user's topic
    subtopic = subtopics.find_one({"_id": ObjectId(subtopic_id), "topic_id": topic_id})
    if not subtopic:
        return jsonify({"message": "Subtopic not found"}), 404

    # Verify topic belongs to user
    topic = topics.find_one({"_id": ObjectId(topic_id), "user_id": user_id})
    if not topic:
        return jsonify({"message": "Access denied"}), 403

    # Delete the subtopic and its associated resources
    resources.delete_many({"subtopic_id": subtopic_id})
    subtopics.delete_one({"_id": ObjectId(subtopic_id)})

    return jsonify({"message": "Subtopic deleted successfully"}), 200

# Resource Deletion Route
@app.route("/api/subtopics/<subtopic_id>/resources/<resource_id>", methods=["DELETE"])
@jwt_required()
def delete_resource(subtopic_id, resource_id):
    user_id = get_jwt_identity()

    # Verify resource belongs to the user's subtopic
    resource = resources.find_one({"_id": ObjectId(resource_id), "subtopic_id": subtopic_id})
    if not resource:
        return jsonify({"message": "Resource not found"}), 404

    # Verify subtopic belongs to user's topic
    subtopic = subtopics.find_one({"_id": ObjectId(subtopic_id)})
    if not subtopic:
        return jsonify({"message": "Subtopic not found"}), 404

    topic = topics.find_one({"_id": ObjectId(subtopic["topic_id"]), "user_id": user_id})
    if not topic:
        return jsonify({"message": "Access denied"}), 403

    # Delete the resource
    resources.delete_one({"_id": ObjectId(resource_id)})

    return jsonify({"message": "Resource deleted successfully"}), 200

if __name__ == "__main__":
    app.run(debug=True)
