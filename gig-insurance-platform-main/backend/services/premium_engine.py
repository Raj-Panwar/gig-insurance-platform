"""
services/premium_engine.py
Dynamic Premium Engine — calculates weekly premium based on risk factors.
"""


BASE_PREMIUM     = 30
MINIMUM_PREMIUM  = 10

# Zone adjustments
ZONE_ADJUSTMENTS = {
    "HIGH":   20,
    "MEDIUM": 10,
    "LOW":     0,
}

# Weather thresholds
WEATHER_HIGH_THRESHOLD = 0.7
WEATHER_LOW_THRESHOLD  = 0.3
WEATHER_HIGH_ADJUSTMENT = +10
WEATHER_LOW_ADJUSTMENT  =  -5


def calculate_premium(zone_risk_level: str, weather_risk: float, base_coverage_amount: float) -> dict:
    """
    Calculate the weekly premium based on zone risk and weather risk.

    Args:
        zone_risk_level     : "LOW", "MEDIUM", or "HIGH"
        weather_risk        : float between 0.0 and 1.0
        base_coverage_amount: policy coverage amount (reserved for future scaling logic)

    Returns:
        dict with keys:
            weekly_premium  (int)
            risk_factor     (str) — human-readable explanation
    """
    zone = zone_risk_level.upper()

    if zone not in ZONE_ADJUSTMENTS:
        raise ValueError(f"Invalid zone_risk_level '{zone_risk_level}'. Must be LOW, MEDIUM, or HIGH.")

    if not (0.0 <= weather_risk <= 1.0):
        raise ValueError(f"weather_risk must be between 0.0 and 1.0, got {weather_risk}.")

    premium = BASE_PREMIUM
    risk_labels = []

    # ── Zone adjustment ──────────────────────────────────────────────────────
    zone_adj = ZONE_ADJUSTMENTS[zone]
    if zone_adj > 0:
        premium += zone_adj
        risk_labels.append(f"{zone.capitalize()} risk zone")

    # ── Weather adjustment ───────────────────────────────────────────────────
    if weather_risk > WEATHER_HIGH_THRESHOLD:
        premium += WEATHER_HIGH_ADJUSTMENT
        risk_labels.append("elevated weather risk")
    elif weather_risk < WEATHER_LOW_THRESHOLD:
        premium += WEATHER_LOW_ADJUSTMENT
        risk_labels.append("low weather risk")

    # ── Floor ────────────────────────────────────────────────────────────────
    premium = max(premium, MINIMUM_PREMIUM)

    # ── Build risk_factor string ─────────────────────────────────────────────
    if risk_labels:
        risk_factor = " with ".join(risk_labels)
        # capitalise first letter
        risk_factor = risk_factor[0].upper() + risk_factor[1:]
    else:
        risk_factor = "Standard risk — base premium applied"

    return {
        "weekly_premium": premium,
        "risk_factor":    risk_factor,
    }