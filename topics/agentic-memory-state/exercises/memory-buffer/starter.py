"""Implement a rolling short-term conversation buffer.

A ShortTermBuffer holds at most `capacity` of the MOST RECENT messages. Adding a
message when the buffer is already full evicts the OLDEST message.

Implement the class:
  - ShortTermBuffer(capacity)      : capacity is a positive int
  - .add(message)                  : append a message; if over capacity, drop the oldest
  - .window()                      : return the current messages, oldest -> newest, as a list
  - len(buffer)                    : the number of messages currently held

Rules:
  - never hold more than `capacity` messages
  - when full, adding one evicts exactly the oldest (FIFO)
  - .window() returns a fresh list (mutating it must not corrupt the buffer)
"""


class ShortTermBuffer:
    def __init__(self, capacity):
        raise NotImplementedError

    def add(self, message):
        raise NotImplementedError

    def window(self):
        raise NotImplementedError

    def __len__(self):
        raise NotImplementedError
