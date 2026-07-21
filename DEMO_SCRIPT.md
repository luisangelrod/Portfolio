# ProofLoop 5.6 Demo Script — 2:35 target

## 0:00–0:20 — Problem

> Coding agents can write a plausible implementation quickly. ProofLoop answers the production question that follows: what evidence should that code earn before a human accepts it?

Show the hero and the four-part system contract: GPT‑5.6, Structured Outputs, evidence gates, and human decision.

## 0:20–0:45 — Supplied evidence

> I can choose a sanitized failure or paste my own code, diff, or incident report. This example shows a payment callback that treats HTTP success as business approval.

Select **Payment state** and briefly point to the editable review input and acceptance criterion.

## 0:45–1:25 — Live GPT‑5.6 review

> The primary action calls GPT‑5.6 Sol through the Responses API. The prompt requires four distinct review roles and Structured Outputs enforce the result contract. ProofLoop tells the model not to claim tests ran unless the supplied evidence proves it.

Click **Run GPT‑5.6 review**. Show the pipeline and scroll to the four reviewer cards. Mention one domain finding and one evidence gap.

## 1:25–1:55 — Correction and evidence

> Findings become a bounded correction plan, regression cases, and human verification checks. These are proposed checks—not fake green test badges.

Show the correction, regression plan, and human checks.

## 1:55–2:15 — Human authority

> The model can recommend BLOCK, REVISE, or PASS, but it cannot complete gate five. A human must accept or reject the disposition.

Click **Reject / needs work** or **Accept with evidence**, then show the stamp and completed pipeline.

## 2:15–2:35 — Codex and fallback honesty

> I used Codex to turn my earlier deterministic work sample into this working GPT‑5.6 developer tool, implement the server-side API and validation, test the flow, and prepare this submission. If the API is unavailable, a visibly labeled reference replay keeps the workflow demonstrable without pretending it was a live model run.

End on the export button and project tagline.

## Recording checklist

- Use a fresh browser window with no private tabs or notifications visible.
- Confirm the live run displays a GPT‑5.6 model name and response ID.
- Keep the final public YouTube video below three minutes.
- Include spoken explanation of how both Codex and GPT‑5.6 were used.
- Do not show API keys, environment settings, or private customer material.
