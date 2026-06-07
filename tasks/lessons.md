# Lessons

## Don't dismiss a suspected bug as "by design" — verify against the domain rule

When I found that the ported doubles engine kept the **same player** serving on a
service change (server 1 → 2), I rationalised it as an intentional simplification
of the design and only relabelled the banner. It was actually a **bug**: real
pickleball gives each team two servers — the partner must serve as server 2.

- The serving player was derived purely from score parity + positions
  (`positions[t][score%2]`), which can't distinguish server 1 from server 2 (same
  score/positions, only the server *number* differs). Fix: track the serving
  player explicitly (`serverPlayer`) and flip to the partner on the `second`
  event; recompute it (by parity) for the incoming team on a side-out; keep the
  0-0-2 opening as a single server.
- Lesson: the user knows the domain. If behaviour contradicts a real-world rule,
  treat it as a bug and verify the rule, don't assume the design intended it.
  A faithful port can still carry a latent bug — port the *intent*, then check it
  against the actual rules.
