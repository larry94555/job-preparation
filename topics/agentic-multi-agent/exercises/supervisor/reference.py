"""Reference solution: the supervisor pattern with a bounded revision loop."""


def supervise(research_agent, writer_agent, critic_agent, task, max_revisions=3) -> str:
    research = research_agent(task)
    content = writer_agent(research, None)
    for _ in range(max_revisions):
        review = critic_agent(content)
        if review["approved"]:
            return content
        content = writer_agent(research, review["issues"])
    return content
