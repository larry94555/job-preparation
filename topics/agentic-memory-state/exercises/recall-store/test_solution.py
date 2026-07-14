"""Tests for MemoryStore. Run: python test_solution.py"""

from solution import MemoryStore


def test_recall_ranks_by_relevance_not_insertion_order():
    s = MemoryStore()
    s.remember("weather paris sunny")            # 0 query terms
    s.remember("prefers editor")                 # 1 query term: prefers
    s.remember("prefers python prefers tests")   # 2 distinct: prefers, python
    out = s.recall("prefers python", 2)
    # Most relevant (2 overlaps) must come before the 1-overlap item — insertion
    # order would put "prefers editor" first, so this proves relevance ranking.
    assert out[0] == "prefers python prefers tests", out
    assert out[1] == "prefers editor", out


def test_zero_overlap_items_excluded():
    s = MemoryStore()
    s.remember("apples and oranges")
    s.remember("the deadline is friday")
    out = s.recall("friday deadline", 5)
    assert out == ["the deadline is friday"], out


def test_respects_k():
    s = MemoryStore()
    for i in range(5):
        s.remember(f"shared term item number {i}")
    out = s.recall("shared term", 3)
    assert len(out) == 3, out


def test_ties_broken_by_insertion_order():
    s = MemoryStore()
    s.remember("alpha shared")   # score 1, idx 0
    s.remember("beta shared")    # score 1, idx 1
    out = s.recall("shared", 2)
    assert out == ["alpha shared", "beta shared"], out


def test_different_queries_return_different_items():
    s = MemoryStore()
    s.remember("cat sat on the mat")
    s.remember("dog ran in the park")
    assert s.recall("cat", 5) == ["cat sat on the mat"], s.recall("cat", 5)
    assert s.recall("dog", 5) == ["dog ran in the park"], s.recall("dog", 5)


test_recall_ranks_by_relevance_not_insertion_order()
test_zero_overlap_items_excluded()
test_respects_k()
test_ties_broken_by_insertion_order()
test_different_queries_return_different_items()
print("ALL PASS")
