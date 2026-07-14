"""Tests for execute_with_approval. Run: python test_solution.py"""

from solution import execute_with_approval


def make_execute(ran):
    def execute(action, params):
        ran.append(action)
        return f"did {action}"

    return execute


def test_high_risk_rejected_does_not_execute():
    ran = []
    audit = []
    out = execute_with_approval(
        "delete_user",
        {"id": 7},
        approve=lambda a, p: False,  # human says NO
        execute=make_execute(ran),
        audit=audit,
    )
    assert out == {"status": "rejected"}, out
    assert ran == [], "execute must NOT run on a rejected high-risk action"
    assert len(audit) == 1, audit
    assert audit[0]["decision"] == "rejected", audit
    assert audit[0]["action"] == "delete_user", audit


def test_high_risk_approved_executes():
    ran = []
    audit = []
    out = execute_with_approval(
        "charge_payment",
        {"amount": 100},
        approve=lambda a, p: True,  # human says YES
        execute=make_execute(ran),
        audit=audit,
    )
    assert out == {"status": "executed", "result": "did charge_payment"}, out
    assert ran == ["charge_payment"], ran
    assert len(audit) == 1, audit
    assert audit[0]["decision"] == "executed", audit


def test_low_risk_executes_without_approval():
    ran = []
    audit = []

    def approve(a, p):
        raise AssertionError("low-risk action must not ask for approval")

    out = execute_with_approval(
        "read_file",
        {"path": "x"},
        approve=approve,
        execute=make_execute(ran),
        audit=audit,
    )
    assert out == {"status": "executed", "result": "did read_file"}, out
    assert ran == ["read_file"], ran
    assert len(audit) == 1, audit
    assert audit[0]["risk"] == "low", audit


test_high_risk_rejected_does_not_execute()
test_high_risk_approved_executes()
test_low_risk_executes_without_approval()
print("ALL PASS")
