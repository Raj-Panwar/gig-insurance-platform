from flask import Blueprint, request, jsonify
from services.trigger_engine import process_event

trigger_bp = Blueprint("trigger", __name__, url_prefix="/trigger")


# ---------------------------------------------------------------------------
# POST /trigger/event
# ---------------------------------------------------------------------------
@trigger_bp.route("/event", methods=["POST"])

def trigger_event():
    try:
        print("🔥 API HIT")

        data = request.get_json()
        print("📦 DATA:", data)

        event = data.get("event")
        user_id = data.get("user_id")

        print("➡️ Calling Claim Engine")

        from services.claim_engine import process_claim
        from dataclasses import asdict

        claim = process_claim(event, user_id)

        print("📤 CLAIM:", claim)

        if claim:
            return jsonify({
                "success": True,
                "claim": asdict(claim)
            })

        return jsonify({
            "success": False,
            "message": "No claim generated"
        })

    except Exception as e:
        print("❌ ERROR:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500