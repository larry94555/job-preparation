"""Implement a long-term memory store with relevance-ranked recall.

A MemoryStore remembers text items and, on recall, returns the top-k items most
RELEVANT to a query — NOT in insertion order.

Implement the class:
  - MemoryStore()
  - .remember(text)          : store an item (a non-empty string)
  - .recall(query, k)        : return up to k stored items, most relevant first

Relevance (deterministic, stdlib only):
  - Score an item by the number of DISTINCT query terms it contains (case-
    insensitive word overlap between the query and the item).
  - Rank items by score, highest first. Items with a score of 0 (no overlapping
    term) must NOT be returned.
  - Break ties by insertion order (earlier-remembered item first).
  - Return at most k items; k must be a positive int.

Recall must depend on the query: two different queries can return different items.
"""


class MemoryStore:
    def __init__(self):
        raise NotImplementedError

    def remember(self, text):
        raise NotImplementedError

    def recall(self, query, k):
        raise NotImplementedError
