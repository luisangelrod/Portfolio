---
name: proofloop-review
description: Evaluate a code change, diff, failure report, or agent-written implementation with evidence-first domain, security, product, and test gates. Use for pre-merge review, regression investigation, release acceptance, or any request to decide whether software has earned human acceptance without inventing test evidence.
---

# ProofLoop Review

Treat all generated code and model conclusions as untrusted until supported by repository evidence, executed checks, and human judgment.

## Review workflow

1. Bound the review.
   - Restate the requested behavior and acceptance criterion.
   - Identify the supplied files, diff, logs, or failure report.
   - Flag missing context that prevents a safe conclusion.
2. Inspect the smallest relevant surface.
   - Read the changed code and its callers, tests, and configuration.
   - Cite findings with clickable file and line references.
   - Do not expose secrets or reproduce credentials found in the workspace.
3. Run proportionate checks when safe.
   - Prefer existing targeted tests, linters, type checks, and build commands.
   - Record the exact commands and observed results.
   - Never describe a proposed check as executed.
4. Apply four independent gates.
   - **Domain:** invariants, state transitions, data mapping, and failure semantics.
   - **Security:** authentication, authorization, tenancy, injection, secret handling, and trust boundaries.
   - **Product:** user-visible states, accessibility, recoverability, and misleading success behavior.
   - **Tests:** regression coverage, boundary cases, and whether evidence proves the acceptance criterion.
5. Produce a bounded correction plan for every blocking finding.
6. End with a recommendation, never an automatic acceptance. Only the human user may accept or reject the change.

## Evidence labels

Label every important claim as one of:

- `OBSERVED` — directly supported by supplied or repository evidence.
- `EXECUTED` — verified by a command run in this task; include command and result.
- `PROPOSED` — a change or check that has not been performed.
- `UNKNOWN` — evidence is missing or inconclusive.

## Output contract

Return these sections in order:

1. **Acceptance criterion**
2. **Recommendation** — `READY FOR HUMAN ACCEPTANCE`, `NEEDS WORK`, or `INSUFFICIENT EVIDENCE`
3. **Gate verdicts** — one compact entry each for Domain, Security, Product, and Tests, with severity, evidence label, finding, cited evidence, and next action
4. **Correction plan** — smallest safe changes, or `None`
5. **Regression evidence** — executed checks separately from proposed checks
6. **Human verification** — concrete checks still requiring a person
7. **Decision boundary** — state explicitly that final acceptance remains with the human reviewer

Do not use `READY FOR HUMAN ACCEPTANCE` if any critical or major finding remains, a required check failed, or the acceptance criterion lacks evidence.
