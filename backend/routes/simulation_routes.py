"""
routes/simulation_routes.py

Re-exports simulate_bp from simulate_routes so app.py can use:
    from routes.simulation_routes import simulation_bp

All endpoint logic lives in simulate_routes.py to keep one
blueprint for the /simulate prefix and avoid Flask conflicts.
"""

from routes.simulate_routes import simulate_bp as simulation_bp

__all__ = ["simulation_bp"]