# ProofLoop demo script — target 2:20

## 0:00–0:20 — Problem and promise

Show the hero and system contract.

> Coding agents can produce plausible code quickly, but plausible is not accepted. ProofLoop makes agent-written code earn acceptance through four independent evidence gates and a final decision that only a human can make.

## 0:20–0:45 — Subscription-native Codex workflow

Show `.agents/skills/proofloop-review/SKILL.md`, then a Codex window signed in with ChatGPT.

> The real review workflow is a repo-scoped Codex skill powered by GPT‑5.6 through my ChatGPT subscription. There is no extracted OAuth token and no pay-per-use API key. From the repository I invoke `$proofloop-review` on a diff, failure report, or implementation.

Paste the copied prompt or invoke:

```text
$proofloop-review review this change and decide whether it is ready for human acceptance
```

## 0:45–1:25 — Working judge path

Return to the live site. Choose **Payment state**, then select **Run judge demo**.

> The public demo is deliberately zero setup and clearly labeled as curated evidence. It never pretends to be a live model response. Four gates inspect domain correctness, security, product behavior, and regression coverage. Every finding stays traceable to the supplied evidence.

Point out the verdict cards and correction plan.

> ProofLoop also separates proposed regression checks from tests that were actually executed. Missing proof stays visible instead of becoming a confident claim.

## 1:25–1:50 — Human authority and export

Select **Reject / needs work**, then download the evidence report.

> GPT‑5.6 can recommend, but it cannot accept its own work. The fifth gate requires a person, and the exported JSON preserves the evidence, recommendation, provenance, and human decision.

## 1:50–2:15 — How Codex and GPT‑5.6 were used

Show the repository history, README, tests, and skill.

> I used Codex with GPT‑5.6 to extend an earlier portfolio evaluation concept into this reusable developer tool during Build Week: the subscription-native skill, redesigned interface, test suite, accessibility behavior, deployment, and submission documentation. The README includes a one-minute judge path and exact setup instructions.

## 2:15–2:20 — Close

Return to the hero.

> ProofLoop: make agent-written code earn acceptance.

## Recording checklist

- Keep the final video under three minutes and include voice audio.
- Show both the working project and how Codex/GPT‑5.6 were used.
- Show the live URL and repository briefly.
- Do not show account settings, tokens, API keys, or private customer material.
- Upload to YouTube as Public or Unlisted and paste the URL into `SUBMISSION.md` and Devpost.
