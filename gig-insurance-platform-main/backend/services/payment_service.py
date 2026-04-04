"""
services/payment_service.py

Simulates an instant payment gateway for demo purposes.
Replace the internals of process_mock_payment() with a real
payment provider SDK (Razorpay, Stripe, PayU) when going live.
"""

import uuid
import random
from datetime import datetime

# Supported mock payment methods — weighted toward UPI for India context
PAYMENT_METHODS = ["UPI", "IMPS", "NEFT", "Wallet"]


def _generate_transaction_id() -> str:
    """Generate a short, unique transaction ID prefixed with TXN."""
    unique = uuid.uuid4().hex[:8].upper()
    return f"TXN{unique}"


def process_mock_payment(user_id: int, amount: float) -> dict:
    """
    Simulate a payment gateway disbursement to a gig worker.

    In production, replace this with a real API call:
        razorpay_client.payout.create(...)
        stripe.Transfer.create(...)

    Args:
        user_id : ID of the worker receiving the payment
        amount  : Payout amount in INR

    Returns:
        dict with transaction details
    
    Raises:
        ValueError : if user_id or amount are invalid
    """
    if not user_id or user_id <= 0:
        raise ValueError("user_id must be a positive integer.")
    if amount <= 0:
        raise ValueError("Payment amount must be greater than zero.")

    transaction_id = _generate_transaction_id()
    method         = random.choice(PAYMENT_METHODS)
    timestamp      = datetime.utcnow()

    return {
        "transaction_id": transaction_id,
        "user_id":        user_id,
        "amount":         round(amount, 2),
        "status":         "success",
        "method":         method,
        "timestamp":      timestamp.strftime("%Y-%m-%d"),
        "timestamp_full": timestamp.isoformat(),
    }