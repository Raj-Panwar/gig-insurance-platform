"""
utils/auth_middleware.py

Role-based access control decorators.
Import and apply these to any route that requires elevated privileges.
"""

from functools import wraps
from flask import request, jsonify
from models.user import User


def admin_required(f):
    """
    Decorator that restricts a route to admin users only.

    Expects the request to include the following header:
        X-User-Id: <user_id>

    Responses:
        403  — missing header, user not found, or role != "admin"
        ...  — original route handler runs normally if check passes
    
    Usage:
        @some_blueprint.route("/admin/workers", methods=["GET"])
        @admin_required
        def get_all_workers():
            ...
    """
    @wraps(f)
    def decorated(*args, **kwargs):

        # ── Step 1: Read user_id from request header ─────────────────────────
        user_id = request.headers.get("X-User-Id")

        if not user_id:
            return jsonify({
                "error": "Admin access required",
                "detail": "Missing 'X-User-Id' header.",
            }), 403

        # ── Step 2: Validate user_id is a valid integer ──────────────────────
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({
                "error": "Admin access required",
                "detail": "'X-User-Id' must be a valid integer.",
            }), 403

        # ── Step 3: Fetch user from DB ───────────────────────────────────────
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                "error": "Admin access required",
                "detail": "User not found.",
            }), 403

        # ── Step 4: Check role ───────────────────────────────────────────────
        if user.role != "admin":
            return jsonify({
                "error": "Admin access required",
            }), 403

        # ── Step 5: Pass the verified user into the route via Flask's g ──────
        from flask import g
        g.current_user = user

        return f(*args, **kwargs)

    return decorated