from flask import Blueprint, request, jsonify
from database.db import db
from models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


# ---------------------------------------------------------------------------
# POST /auth/register
# ---------------------------------------------------------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    # Validate required fields
    required_fields = ["name", "phone", "city", "platform"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    # Reject duplicate phone numbers
    if User.query.filter_by(phone=data["phone"]).first():
        return jsonify({"error": "A user with this phone number already exists."}), 409

    user = User(
        name=data["name"].strip(),
        phone=data["phone"].strip(),
        city=data["city"].strip(),
        platform=data["platform"].strip(),
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully.",
        "user": _serialize(user),
    }), 201


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    phone = data.get("phone", "").strip()
    if not phone:
        return jsonify({"error": "Field 'phone' is required."}), 400

    user = User.query.filter_by(phone=phone).first()
    if not user:
        return jsonify({"error": "No user found with this phone number."}), 404

    return jsonify({
        "message": "Login successful.",
        "user": _serialize(user),
    }), 200


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def _serialize(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "city": user.city,
        "platform": user.platform,
        "created_at": user.created_at.isoformat(),
    }