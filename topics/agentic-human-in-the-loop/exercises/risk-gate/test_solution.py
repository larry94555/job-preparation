"""Tests for assess_risk. Run: python test_solution.py"""

from solution import assess_risk


def test_high_risk_actions():
    for action in (
        "delete_user",
        "send_email_to_customer",
        "charge_payment",
        "post_public_tweet",
        "modify_database_schema",
    ):
        assert assess_risk(action) == "high", action


def test_medium_risk_actions():
    for action in ("create_ticket", "update_record", "schedule_job"):
        assert assess_risk(action) == "medium", action


def test_low_risk_actions():
    for action in ("read_file", "lookup_user", "list_orders", "noop"):
        assert assess_risk(action) == "low", action


def test_default_is_low():
    assert assess_risk("something_unheard_of") == "low"


test_high_risk_actions()
test_medium_risk_actions()
test_low_risk_actions()
test_default_is_low()
print("ALL PASS")
