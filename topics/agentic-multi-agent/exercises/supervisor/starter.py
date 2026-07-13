"""Implement the supervisor coordinating three specialist agents.

supervise(research_agent, writer_agent, critic_agent, task, max_revisions=3) -> str

  - research = research_agent(task)
  - content  = writer_agent(research, None)
  - loop up to max_revisions times:
      review = critic_agent(content)   -> {"approved": bool, "issues": [...]}
      if review["approved"]: return content
      else: content = writer_agent(research, review["issues"])
  - after max_revisions without approval, return the last content
"""


def supervise(research_agent, writer_agent, critic_agent, task, max_revisions=3) -> str:
    raise NotImplementedError
