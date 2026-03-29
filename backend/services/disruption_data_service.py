"""
services/disruption_data_service.py

Simulates external disruption data sources — weather, air quality, heatwave.
Each function mimics a real third-party API call and returns structured data
ready to be fed into the trigger engine.

Replace the random simulation with real API calls (OpenWeatherMap, AQICN, etc.)
by swapping only the internals of each function — the return shape stays identical.
"""

import random


def get_weather_data(location: str) -> dict:
    """
    Simulate a weather API response for the given location.
    Severity represents rainfall in mm.

    Real API replacement: OpenWeatherMap, WeatherAPI, IMD (India Met Dept)
    """
    return {
        "event_type": "rain",
        "location":   location,
        "severity":   round(random.uniform(0, 100), 2),
    }


def get_air_quality_data(location: str) -> dict:
    """
    Simulate an air quality API response for the given location.
    Severity represents the AQI (Air Quality Index) value.

    Real API replacement: AQICN, IQAir, CPCB (India)
    """
    return {
        "event_type": "aqi",
        "location":   location,
        "severity":   round(random.uniform(100, 500), 2),
    }


def get_heatwave_data(location: str) -> dict:
    """
    Simulate a heatwave / temperature API response for the given location.
    Severity represents temperature in °C.

    Real API replacement: OpenWeatherMap (temp field), IMD heatwave alerts
    """
    return {
        "event_type": "heat",
        "location":   location,
        "severity":   round(random.uniform(35, 50), 2),
    }


def get_all_disruption_data(location: str) -> list:
    """
    Fetch all three disruption readings for a location in one call.

    Returns:
        List of disruption dicts, one per event type.
    """
    return [
        get_weather_data(location),
        get_air_quality_data(location),
        get_heatwave_data(location),
    ]