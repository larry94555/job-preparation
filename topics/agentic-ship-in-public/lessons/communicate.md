# Ship in public — communicate the work

## Write up the work

Shipping the agent is half the capstone; **communicating it** is the other half, and it is the half that
travels. A reviewer rarely runs your code first — they read how you *talk* about it. The strongest write-up
is not a feature list; it is a short narrative with three beats: **the problem you chose, one surprising
decision, and one thing that broke and how you fixed it.** Those three beats are what make a write-up read
as real engineering rather than marketing.

- **The problem and the architecture.** State the task in one sentence and the shape of the agent in a
  few more — the bounded loop, the tools, where you validate. This is the same content as the README, told
  as a story.
- **One surprise.** Name a decision that did not go the way you expected — a tool you thought you needed
  and cut, a prompt that only worked once you constrained the output, a loop cap you had to lower.
  A **surprise** is credible because tutorials never have them; it proves you were actually in the code.
- **One break and fix.** Describe a concrete failure — the agent looped forever, a tool returned garbage
  the model trusted, an eval case you only caught because you wrote the eval — and exactly how you fixed
  it. A **break-and-fix** is the single most convincing thing you can show, because debugging is the job.

Communicate it as a **thread** — a short public write-up (a build-in-public **thread**, a blog post, a
README section) — paired with a **demo** you can link. A ninety-second **Loom**-style video of the agent
running, plus a few paragraphs on the surprise and the break, is worth more than a polished slide deck.
The point of the thread is not reach; it is a durable, linkable artifact that lets a stranger understand
what you built and trust that you understand it too.
