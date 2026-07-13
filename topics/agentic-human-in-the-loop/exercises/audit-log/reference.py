"""Reference solution: an append-only audit trail with a query filter."""


class AuditLog:
    def __init__(self):
        self._records = []

    def record(self, action, params, risk, decision):
        self._records.append(
            {"action": action, "params": params, "risk": risk, "decision": decision}
        )

    def query(self, action=None):
        if action is None:
            return list(self._records)
        return [r for r in self._records if r["action"] == action]
