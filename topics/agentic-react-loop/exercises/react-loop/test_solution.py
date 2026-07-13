"""Tests for run_react. Run: python test_solution.py"""

from solution import run_react


class Step:
    def __init__(self, kind, tool=None, tool_input=None, answer=None):
        self.kind = kind
        self.tool = tool
        self.tool_input = tool_input
        self.answer = answer


class ScriptedClient:
    """Replays a fixed list of steps: some actions, then a final."""

    def __init__(self, script):
        self.script = list(script)
        self.calls = 0

    def step(self, messages):
        self.calls += 1
        return self.script.pop(0)


class LoopingClient:
    """Always asks for an action — never finishes. Used to test the step cap."""

    def step(self, messages):
        return Step("action", tool="noop", tool_input={"n": 1})


def test_two_actions_then_final():
    seen = []

    def look(args):
        seen.append(args)
        return "42"

    client = ScriptedClient(
        [
            Step("action", tool="look", tool_input={"q": "a"}),
            Step("action", tool="look", tool_input={"q": "b"}),
            Step("final", answer="done: 42"),
        ]
    )
    out = run_react(client, "solve it", {"look": look})
    assert out["answer"] == "done: 42", out
    assert out["steps"] == 3, out
    assert client.calls == 3, client.calls
    assert seen == [{"q": "a"}, {"q": "b"}], seen
    assert isinstance(out["log"], list) and len(out["log"]) == 3, out


def test_immediate_final():
    client = ScriptedClient([Step("final", answer="quick")])
    out = run_react(client, "trivial", {})
    assert out["answer"] == "quick", out
    assert out["steps"] == 1, out
    assert client.calls == 1, client.calls


def test_step_limit_stops_the_loop():
    calls = {"n": 0}

    def noop(args):
        calls["n"] += 1
        return "ok"

    out = run_react(LoopingClient(), "spin", {"noop": noop}, max_steps=5)
    assert out["answer"] is None, out
    assert out["steps"] == 5, out
    assert out.get("stopped") == "step_limit", out
    assert calls["n"] <= 5, calls["n"]


test_two_actions_then_final()
test_immediate_final()
test_step_limit_stops_the_loop()
print("ALL PASS")
