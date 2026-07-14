"""Bound an approval loop so it can't run forever.

revise_until_approved(draft, critic, revise, max_tries=3) -> dict

  Loop, counting tries (n = number of critic calls so far):
    r = critic(draft)   -> {"approved": bool, "issues": [...]}
    if r["approved"]: return {"content": draft, "approved": True, "tries": n}
    else: draft = revise(draft, r["issues"])
  After max_tries without approval:
    return {"content": draft, "approved": False, "tries": max_tries}
"""


def revise_until_approved(draft, critic, revise, max_tries=3) -> dict:
    raise NotImplementedError
