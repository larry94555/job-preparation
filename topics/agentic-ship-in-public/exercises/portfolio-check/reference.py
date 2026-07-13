"""Reference solution: portfolio readiness check."""

REQUIRED = ("agent", "readme", "evals", "demo")


def portfolio_ready(project) -> dict:
    missing = sorted(key for key in REQUIRED if not project.get(key))
    return {"ready": len(missing) == 0, "missing": missing}
