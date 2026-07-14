"""Keep an audit trail of what the agent did and why.

Implement an AuditLog class:
  - record(action, params, risk, decision): append a record to an internal list,
    preserving the order calls were made.
  - query(action=None): return the matching records. If action is None, return
    ALL records; otherwise return only the records whose "action" equals action.

Each record should carry at least: action, params, risk, decision.
"""


class AuditLog:
    def __init__(self):
        raise NotImplementedError

    def record(self, action, params, risk, decision):
        raise NotImplementedError

    def query(self, action=None):
        raise NotImplementedError
