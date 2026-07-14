"""Reference solution: a rolling short-term conversation buffer."""

from collections import deque


class ShortTermBuffer:
    def __init__(self, capacity):
        if not isinstance(capacity, int) or capacity <= 0:
            raise ValueError("capacity must be a positive int")
        self.capacity = capacity
        self._messages = deque(maxlen=capacity)

    def add(self, message):
        # deque(maxlen=capacity) evicts the oldest automatically when full.
        self._messages.append(message)

    def window(self):
        return list(self._messages)

    def __len__(self):
        return len(self._messages)
