# Build it: a runSafely guard suite

## Composing guards

Most production robustness comes from **composing guards**: a candidate output is accepted only if it
passes **every** guard — schema-valid **and** fresh **and** non-empty, etc. Any single failing guard
rejects the candidate. This is the detect→mitigate pattern generalized: instead of one check, you run
a *suite* of them, and "OK" means all-clear.

Framed as code: `runSafely(produce, { guards, maxAttempts, fallback })`. Call `produce()`, test its
output against **all** `guards`; if they all pass, you're done.

## Bounding and falling back

Two rules make the difference between a guard suite and a new failure mode:

- **Bound the retries.** If the output fails a guard, retry — but only up to `maxAttempts`. An
  **unbounded** retry loop is itself a runaway/cost failure (the very thing you're guarding against).
- **Fall back, don't crash.** After the attempts are exhausted, return the `fallback` so the caller
  **always** gets a valid value — never an exception, never a silently-wrong one. And report that the
  fallback was used (an `ok: false`), because a fallback that's invisible becomes a *silent* regression.

Worked flow: `produce()` yields values `1, 2, 3, …`; with `guards = [v => v >= 3]` and
`maxAttempts = 5`, it accepts on the third attempt. With a producer that always fails the guard, it
calls `produce()` exactly `maxAttempts` times and then returns the fallback with `ok: false`. Bounded,
safe, and visible — the three properties that keep a guard suite from becoming the outage.
