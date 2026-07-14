"""Tests for AuditLog. Run: python test_solution.py"""

from solution import AuditLog


def test_records_persist_in_order():
    log = AuditLog()
    log.record("delete_user", {"id": 1}, "high", "rejected")
    log.record("read_file", {"path": "x"}, "low", "executed")
    log.record("charge_payment", {"amount": 5}, "high", "executed")

    all_records = log.query()
    assert len(all_records) == 3, all_records
    assert [r["action"] for r in all_records] == [
        "delete_user",
        "read_file",
        "charge_payment",
    ], all_records
    assert all_records[0]["decision"] == "rejected", all_records
    assert all_records[2]["risk"] == "high", all_records


def test_query_filters_by_action():
    log = AuditLog()
    log.record("delete_user", {"id": 1}, "high", "rejected")
    log.record("delete_user", {"id": 2}, "high", "executed")
    log.record("read_file", {"path": "x"}, "low", "executed")

    deletes = log.query(action="delete_user")
    assert len(deletes) == 2, deletes
    assert all(r["action"] == "delete_user" for r in deletes), deletes

    reads = log.query(action="read_file")
    assert len(reads) == 1, reads

    none = log.query(action="never_happened")
    assert none == [], none


def test_query_none_returns_all():
    log = AuditLog()
    log.record("update_record", {"id": 9}, "medium", "executed")
    assert len(log.query()) == 1
    assert len(log.query(None)) == 1


test_records_persist_in_order()
test_query_filters_by_action()
test_query_none_returns_all()
print("ALL PASS")
