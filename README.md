# ProofLoop 5.6 + Luis Rodriguez Rivera Portfolio

ProofLoop is an evidence-driven review system for agent-written software. It uses GPT‑5.6 Sol to produce schema-bound domain, security, product, and test verdicts, then keeps proposed corrections, regression evidence, and final human acceptance visibly separate.

- Live portfolio: <https://luisrodriguezdev.netlify.app>
- ProofLoop: <https://luisrodriguezdev.netlify.app/agent-review-lab/>
- Build Week track: **Developer Tools**

## Why ProofLoop exists

Coding agents can generate a plausible implementation before anyone has proved that the business rules, tenant boundaries, failure states, or regression coverage are correct. ProofLoop adds the control loop after generation:

1. Bound the goal and supplied evidence.
2. Ask independent GPT‑5.6 review roles for structured verdicts.
3. Convert findings into a bounded correction plan.
4. Keep proposed tests distinct from executed evidence.
5. Require a human accept/reject decision.

The interface also includes a clearly labeled deterministic reference replay. It keeps the product demonstrable when an API is unavailable without presenting canned results as a live model call.

## OpenAI implementation

- OpenAI Responses API
- `gpt-5.6-sol` with explicit `medium` reasoning effort
- Structured Outputs through the official JavaScript SDK, Zod, and `zodTextFormat`
- Server-side API key handling in a Netlify Function
- Anonymous, browser-generated safety identifier
- `store: false`, bounded input length, bounded output tokens, and no automatic acceptance

## Run locally

Requirements: Node.js 20+ and an OpenAI API key with GPT‑5.6 access.

```bash
npm install
copy .env.example .env
# Add OPENAI_API_KEY to .env
npm run dev
```

Netlify Dev serves the static portfolio and the `/api/evaluate` function together.

## Validate

```bash
npm test
npm run build
```

## Deploy

Configure these environment variables in Netlify:

- `OPENAI_API_KEY` — required for live reviews
- `OPENAI_MODEL` — optional; defaults to `gpt-5.6-sol`

Then deploy the repository with `netlify.toml` at the repository root.

## Submission materials

- [Submission copy](SUBMISSION.md)
- [Under-three-minute demo script](DEMO_SCRIPT.md)
- [Architecture and safety notes](ARCHITECTURE.md)
- [License and asset exceptions](LICENSE.md)

## Other portfolio routes

- `/` — professional portfolio
- `/agent-review-lab/` — ProofLoop 5.6
- `/eval-flight/` — interactive evaluation mission
- `/desktop-1995/` — Windows XP memory desktop alternate

## Author

Luis Rodriguez Rivera — [GitHub](https://github.com/luisangelrod) · [LinkedIn](https://www.linkedin.com/in/luis-rodriguez-515858bb/) · [Email](mailto:luisangelrod17@gmail.com)
