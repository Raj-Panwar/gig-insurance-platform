"""
services/notification_service.py

Notification service for the parametric insurance platform.
Currently logs notifications to console.

To integrate real providers, replace each function body:
  - SMS  → Twilio / MSG91 / Fast2SMS
  - Email → SendGrid / AWS SES
  - Push  → Firebase Cloud Messaging
"""

import logging

logger = logging.getLogger(__name__)


def notify_claim_created(user_id: int, claim_id: int, trigger_type: str, status: str):
    """
    Notify a worker when a claim is auto-created by the trigger engine.

    Real implementation: SMS to worker.phone
    """
    message = (
        f"[CLAIM] User {user_id} — Claim #{claim_id} created. "
        f"Type: {trigger_type.upper()}. Status: {status}."
    )
    logger.info(message)
    print(f"📲 NOTIFY: {message}")

    # TODO: Replace with real SMS
    # client = Fast2SMS(api_key=os.getenv("FAST2SMS_KEY"))
    # client.send(to=user.phone, message=message)


def notify_payout_processed(user_id: int, amount: float, transaction_id: str):
    """
    Notify a worker when a payout is successfully processed.

    Real implementation: SMS + push notification
    """
    message = (
        f"[PAYOUT] User {user_id} — ₹{amount:.2f} disbursed. "
        f"Transaction: {transaction_id}."
    )
    logger.info(message)
    print(f"💰 NOTIFY: {message}")


def notify_fraud_flagged(user_id: int, claim_id: int, reason: str):
    """
    Notify admin team when a claim is flagged or rejected for fraud.

    Real implementation: Email to admin
    """
    message = (
        f"[FRAUD ALERT] Claim #{claim_id} for User {user_id} "
        f"flagged/rejected. Reason: {reason}."
    )
    logger.warning(message)
    print(f"🚨 FRAUD ALERT: {message}")


def notify_policy_created(user_id: int, policy_id: int, coverage_amount: float):
    """
    Notify a worker when their policy is activated.
    """
    message = (
        f"[POLICY] User {user_id} — Policy #{policy_id} activated. "
        f"Coverage: ₹{coverage_amount:.2f}."
    )
    logger.info(message)
    print(f"📋 NOTIFY: {message}")