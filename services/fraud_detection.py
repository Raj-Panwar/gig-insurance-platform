"""
services/fraud_detection.py

GPS-based fraud detection for parametric insurance claims.

Two validation strategies:
  1. check_location_fraud()     — Haversine GPS distance check (precise)
  2. validate_worker_location() — City string match check (simple fallback)
"""

import math

# Maximum allowed distance in km before a claim is flagged
FRAUD_DISTANCE_THRESHOLD_KM = 20.0
EARTH_RADIUS_KM = 6371.0


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the great-circle distance between two GPS coordinates.

    Args:
        lat1, lng1 : worker's current latitude / longitude
        lat2, lng2 : policy zone's latitude / longitude

    Returns:
        Distance in kilometres (float)
    """
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])

    d_lat = lat2 - lat1
    d_lng = lng2 - lng1

    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(d_lng / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))

    return round(EARTH_RADIUS_KM * c, 2)


def check_location_fraud(
    worker_lat: float,
    worker_lng: float,
    policy_lat: float,
    policy_lng: float,
) -> dict:
    """
    Haversine-based fraud check.
    Flags the claim if the worker is more than FRAUD_DISTANCE_THRESHOLD_KM
    away from the policy zone.

    Returns:
        {
            "fraud_flag":  bool
            "distance_km": float
        }
    """
    distance_km = _haversine(worker_lat, worker_lng, policy_lat, policy_lng)
    fraud_flag  = distance_km > FRAUD_DISTANCE_THRESHOLD_KM

    return {
        "fraud_flag":  fraud_flag,
        "distance_km": distance_km,
    }


def validate_worker_location(worker_city: str, event_location: str) -> bool:
    """
    Simple city-string fraud check.
    Returns True if the worker's stored city matches the event location.
    Returns False if the cities differ — claim should be rejected.

    Comparison is case-insensitive and strips whitespace.

    Args:
        worker_city    : city stored in the worker_locations table
        event_location : location field from the disruption event

    Returns:
        True  → locations match, claim is valid
        False → locations differ, claim should be rejected
    """
    if not worker_city or not event_location:
        return False   # missing data — reject to be safe

    return worker_city.strip().lower() == event_location.strip().lower()