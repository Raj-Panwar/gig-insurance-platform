from flask import Blueprint, request, jsonify

trigger_bp = Blueprint("trigger", __name__, url_prefix="/trigger")


@trigger_bp.route("/event", methods=["POST"])
def trigger_event():
    try:
        print("🔥 API HIT")

        data = request.get_json()
        print("📦 DATA:", data)

        event = {
            "type": data.get("event_type"),
            "city": data.get("location"),
            "value": data.get("severity")
        }

        user_id = data.get("user_id")

        print("➡️ Calling Claim Engine")

        from services.claim_service import process_claim

        # ✅ THIS already saves to DB (as we fixed earlier)
        claim = process_claim(event, user_id)

        print("📤 CLAIM:", claim)

        if claim:
            return jsonify({
                "success": True,
                "claim": claim   # ✅ NO asdict
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
    