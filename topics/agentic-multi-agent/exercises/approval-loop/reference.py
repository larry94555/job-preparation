"""Reference solution: an approval loop with a bounded exit."""


def revise_until_approved(draft, critic, revise, max_tries=3) -> dict:
    for n in range(1, max_tries + 1):
        r = critic(draft)
        if r["approved"]:
            return {"content": draft, "approved": True, "tries": n}
        draft = revise(draft, r["issues"])
    return {"content": draft, "approved": False, "tries": max_tries}
