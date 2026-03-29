"""
utils/jwt_helper.py

JWT generation and verification for the parametric insurance platform.

Tokens are signed with the app SECRET_KEY and expire after JWT_EXPIRY_HOURS.
Include the token in every protected request:
    Authorization: Bearer <token>
"""

import jwt
from datetime import datetime, timedelta, timezone
from flask import request, jsonify, current_app
from functools import wraps
from models.user import User

JWT_EXPIRY_HOURS = 24


def generate_token(user_id: int, role: str) -> str:
    """
    Create a signed JWT for a user.

    Payload:
        user_id  — used to fetch the user on protected routes
        role     — "worker" | "admin" — used for RBAC checks
        exp      — expiry timestamp (UTC)
        iat      — issued-at timestamp (UTC)
    """
    payload = {
        "user_id": user_id,
        "role":    role,
        "exp":     datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat":     datetime.now(timezone.utc),
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT.

    Raises:
        jwt.ExpiredSignatureError  — token has expired
        jwt.InvalidTokenError      — token is malformed or signature mismatch
    """
    return jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])


def _extract_token() -> str | None:
    """Pull Bearer token from the Authorization header."""
    header = request.headers.get("Authorization", "")
    if header.startswith("Bearer "):
        return header[7:]
    return None


# ---------------------------------------------------------------------------
# Decorators
# ---------------------------------------------------------------------------

def login_required(f):
    """
    Protect any route — worker or admin.

    Sets flask.g.current_user to the authenticated User object.

    Usage:
        @some_bp.route("/protected")
        @login_required
        def protected():
            from flask import g
            return jsonify({"user": g.current_user.name})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = _extract_token()
        if not token:
            return jsonify({"error": "Authorization token is missing."}), 401

        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token."}), 401

        user = User.query.get(payload["user_id"])
        if not user:
            return jsonify({"error": "User not found."}), 401

        from flask import g
        g.current_user = user
        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    """
    Restrict route to admin users only.
    Replaces the header-based version in auth_middleware.py.

    Usage:
        @some_bp.route("/admin/only")
        @admin_required
        def admin_only():
            ...
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = _extract_token()
        if not token:
            return jsonify({"error": "Authorization token is missing."}), 401

        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token."}), 401

        user = User.query.get(payload["user_id"])
        if not user:
            return jsonify({"error": "User not found."}), 401
        if user.role != "admin":
            return jsonify({"error": "Admin access required."}), 403

        from flask import g
        g.current_user = user
        return f(*args, **kwargs)

    return decorated


def worker_self_only(f):
    """
    Ensure a worker can only access their own data.
    Route must have a <user_id> path parameter.

    Admins can access any user's data.

    Usage:
        @worker_bp.route("/claims/<int:user_id>")
        @login_required
        @worker_self_only
        def get_claims(user_id):
            ...
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        from flask import g
        current_user = g.current_user
        target_user_id = kwargs.get("user_id")

        if current_user.role == "admin":
            return f(*args, **kwargs)   # admins can access anyone

        if current_user.id != target_user_id:
            return jsonify({"error": "You can only access your own data."}), 403

        return f(*args, **kwargs)

    return decorated