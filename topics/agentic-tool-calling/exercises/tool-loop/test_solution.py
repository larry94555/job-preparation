"""Tests for run_agent. Run: python test_solution.py"""

from solution import run_agent


class Resp:
    def __init__(self, stop_reason, tool_name=None, tool_input=None, text=None):
        self.stop_reason = stop_reason
        self.tool_name = tool_name
        self.tool_input = tool_input
        self.text = text


class FakeClient:
    """Scripts one tool_use turn, then an end_turn."""

    def __init__(self, script):
        self.script = list(script)
        self.calls = 0

    def create(self, messages):
        self.calls += 1
        return self.script.pop(0)


class LoopingClient:
    """Always asks for a tool — never ends. Used to test the step cap."""

    def create(self, messages):
        return Resp("tool_use", tool_name="noop", tool_input={"n": 1})


def test_runs_tool_then_returns_text():
    ran = {}

    def get_weather(args):
        ran["input"] = args
        return "sunny"

    client = FakeClient(
        [
            Resp("tool_use", tool_name="get_weather", tool_input={"city": "Paris"}),
            Resp("end_turn", text="It is sunny in Paris."),
        ]
    )
    out = run_agent(client, "weather in Paris?", {"get_weather": get_weather})
    assert ran["input"] == {"city": "Paris"}, ran
    assert out == "It is sunny in Paris.", out
    assert client.calls == 2, client.calls


def test_returns_immediately_on_end_turn():
    client = FakeClient([Resp("end_turn", text="hello")])
    out = run_agent(client, "hi", {})
    assert out == "hello", out
    assert client.calls == 1, client.calls


def test_step_cap_prevents_infinite_loop():
    calls = {"n": 0}

    def noop(args):
        calls["n"] += 1
        return "ok"

    raised = False
    try:
        run_agent(LoopingClient(), "spin", {"noop": noop})
    except RuntimeError:
        raised = True
    assert raised, "an endlessly tool-calling model must hit the step cap"
    assert calls["n"] <= 10, calls["n"]


test_runs_tool_then_returns_text()
test_returns_immediately_on_end_turn()
test_step_cap_prevents_infinite_loop()
print("ALL PASS")
