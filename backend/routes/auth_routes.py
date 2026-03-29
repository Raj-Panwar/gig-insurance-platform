from flask import Blueprint, request, jsonify
from database.db import db
from models.user import User, VALID_ROLES
from utils.jwt_helper import generate_token

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


# ---------------------------------------------------------------------------
# POST /auth/register
# ---------------------------------------------------------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    required_fields = ["name", "phone", "city", "platform"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    if User.query.filter_by(phone=data["phone"]).first():
        return jsonify({"error": "A user with this phone number already exists."}), 409

    if data.get("email") and User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "A user with this email already exists."}), 409

    user = User(
        name     = data["name"].strip(),
        phone    = data["phone"].strip(),
        email    = data.get("email", "").strip() or None,
        city     = data["city"].strip(),
        platform = data["platform"].strip(),
        role     = "worker",
    )
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id, user.role)

    return jsonify({
        "message": "User registered successfully.",
        "token":   token,
        "user":    _serialize(user),
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

    token = generate_token(user.id, user.role)

    return jsonify({
        "message": "Login successful.",
        "token":   token,
        "user_id": user.id,
        "role":    user.role,
        "user":    _serialize(user),
    }), 200


# ---------------------------------------------------------------------------
# POST /auth/refresh
# ---------------------------------------------------------------------------
@auth_bp.route("/refresh", methods=["POST"])
def refresh_token():
    from utils.jwt_helper import _extract_token, decode_token
    import jwt

    token = _extract_token()
    if not token:
        return jsonify({"error": "Authorization token is missing."}), 401

    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired — please log in again."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token."}), 401

    user = User.query.get(payload["user_id"])
    if not user:
        return jsonify({"error": "User not found."}), 401

    new_token = generate_token(user.id, user.role)
    return jsonify({"token": new_token}), 200


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def _serialize(user: User) -> dict:
    return {
        "id":         user.id,
        "name":       user.name,
        "phone":      user.phone,
        "email":      user.email,
        "city":       user.city,
        "platform":   user.platform,
        "role":       user.role,
        "created_at": user.created_at.isoformat(),
    }