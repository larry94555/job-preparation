"""Reference solution: relevance-ranked long-term memory store."""


def _terms(text):
    return {w for w in text.lower().split() if w}


class MemoryStore:
    def __init__(self):
        self._items = []  # list of (insertion_index, text)

    def remember(self, text):
        if not isinstance(text, str) or not text.strip():
            raise ValueError("remembered text must be a non-empty string")
        self._items.append((len(self._items), text))

    def recall(self, query, k):
        if not isinstance(k, int) or k <= 0:
            raise ValueError("k must be a positive int")

        query_terms = _terms(query)

        scored = []
        for idx, text in self._items:
            score = len(_terms(text) & query_terms)
            if score > 0:
                scored.append((score, idx, text))

        # Highest score first; ties broken by insertion order (smaller idx first).
        scored.sort(key=lambda t: (-t[0], t[1]))
        return [text for _score, _idx, text in scored[:k]]
