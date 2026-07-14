"""Tests for run_capstone. Run: python test_solution.py"""

from solution import run_capstone


class Step:
    def __init__(self, kind, tool=None, tool_input=None, answer=None):
        self.kind = kind
        self.tool = tool
        self.tool_input = tool_input
        self.answer = answer


class ScriptedClient:
    """Returns each scripted step in order."""

    def __init__(self, script):
        self.script = list(script)
        self.calls = 0

    def step(self, messages):
        self.calls += 1
        return self.script.pop(0)


class LoopingClient:
    """Always asks for the same tool — never finishes. Tests the step cap."""

    def step(self, messages):
        return Step("action", tool="spin", tool_input={"n": 1})


def test_runs_tools_then_returns_final():
    def search(args):
        return "found: " + args["q"]

    def summarize(args):
        return "summary text"

    client = ScriptedClient(
        [
            Step("action", tool="search", tool_input={"q": "agents"}),
            Step("action", tool="summarize", tool_input={"text": "x"}),
            Step("final", answer="done"),
        ]
    )
    out = run_capstone(client, "do the task", {"search": search, "summarize": summarize})
    assert out["answer"] == "done", out
    assert out["steps"] == 3, out
    assert out["trace"] == [
        {"tool": "search", "ok": True},
        {"tool": "summarize", "ok": True},
    ], out


def test_bad_observation_marked_not_ok():
    def good(args):
        return "real result"

    def garbage(args):
        return ""  # empty observation — must be flagged ok: False

    client = ScriptedClient(
        [
            Step("action", tool="garbage", tool_input={}),
            Step("action", tool="good", tool_input={}),
            Step("final", answer="finished"),
        ]
    )
    out = run_capstone(client, "task", {"good": good, "garbage": garbage})
    assert out["answer"] == "finished", out
    assert out["trace"] == [
        {"tool": "garbage", "ok": False},
        {"tool": "good", "ok": True},
    ], out


def test_none_observation_marked_not_ok():
    def none_tool(args):
        return None

    client = ScriptedClient(
        [
            Step("action", tool="none_tool", tool_input={}),
            Step("final", answer="ok"),
        ]
    )
    out = run_capstone(client, "task", {"none_tool": none_tool})
    assert out["trace"] == [{"tool": "none_tool", "ok": False}], out


def test_immediate_final():
    client = ScriptedClient([Step("final", answer="straight to the point")])
    out = run_capstone(client, "task", {})
    assert out["answer"] == "straight to the point", out
    assert out["steps"] == 1, out
    assert out["trace"] == [], out


def test_step_limit_stops_the_loop():
    calls = {"n": 0}

    def spin(args):
        calls["n"] += 1
        return "again"

    out = run_capstone(LoopingClient(), "spin forever", {"spin": spin}, max_steps=5)
    assert out["answer"] is None, out
    assert out["steps"] == 5, out
    assert out["stopped"] == "step_limit", out
    assert len(out["trace"]) == 5, out
    assert calls["n"] == 5, calls


test_runs_tools_then_returns_final()
test_bad_observation_marked_not_ok()
test_none_observation_marked_not_ok()
test_immediate_final()
test_step_limit_stops_the_loop()
print("ALL PASS")
