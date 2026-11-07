# Coaching prescription integrity corrections

This investigation implements only IA01 (accepted running adjustments must change the executable prescription consistently) and IA02 (extra strength progression must use valid, comparable, current evidence). It starts from investigation PR128, commit `cc8eef90b628269758bfdcb9b383aee8c41e2895`.

- [Engineering report](engineering-report.md): contracts, before/after behavior, compatibility and verification.
- [Synthetic before/after proof](before-after-proof.json): identical fictional inputs evaluated by the PR128 engine and this correction.
- [Independent assurance](priya-assurance.md): Priya's separate challenges and controls.
- [Original independent audit](../independent-coaching-audit/README.md): historical findings and generated evidence, retained unchanged.

No recovery-policy correction, new dose policy, live programme regeneration, activation, history edit, merge or deployment is included. Future athlete approval remains necessary. Test success establishes the stated software invariants; it does not establish individual coaching efficacy or readiness for competition.
