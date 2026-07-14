"""Tests for ShortTermBuffer. Run: python test_solution.py"""

from solution import ShortTermBuffer


def test_holds_messages_in_order():
    b = ShortTermBuffer(3)
    b.add("a")
    b.add("b")
    assert b.window() == ["a", "b"], b.window()
    assert len(b) == 2, len(b)


def test_caps_at_capacity_and_evicts_oldest():
    b = ShortTermBuffer(3)
    for m in ["a", "b", "c", "d"]:
        b.add(m)
    assert b.window() == ["b", "c", "d"], b.window()
    assert len(b) == 3, len(b)


def test_keeps_most_recent_after_many_adds():
    b = ShortTermBuffer(2)
    for m in ["1", "2", "3", "4", "5"]:
        b.add(m)
    assert b.window() == ["4", "5"], b.window()
    assert len(b) == 2, len(b)


def test_window_is_a_copy():
    b = ShortTermBuffer(2)
    b.add("a")
    w = b.window()
    w.append("mutated")
    assert b.window() == ["a"], b.window()


test_holds_messages_in_order()
test_caps_at_capacity_and_evicts_oldest()
test_keeps_most_recent_after_many_adds()
test_window_is_a_copy()
print("ALL PASS")
