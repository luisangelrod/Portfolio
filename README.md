# ProofLoop 5.6 + Luis Rodriguez Rivera Portfolio

ProofLoop is an evidence-first acceptance workflow for agent-written software. It combines a repo-scoped Codex skill powered through a ChatGPT subscription with a zero-setup browser demonstration of the same domain, security, product, test, and human-decision gates.

- Live project: <https://luisrodriguezdev.netlify.app/agent-review-lab/>
- Source: <https://github.com/luisangelrod/Portfolio>
- OpenAI Build Week track: **Developer Tools**

## Why ProofLoop exists

Coding agents can produce a plausible implementation before anyone has proved that its business rules, tenant boundaries, failure states, or regression coverage are correct. ProofLoop adds the control loop after generation:

1. Bound the goal and supplied evidence.
2. Apply independent domain, security, product, and test review gates.
3. Label claims as observed, executed, proposed, or unknown.
4. Convert findings into a bounded correction and regression plan.
5. Reserve the final accept/reject decision for a human.

## Use it with a ChatGPT subscription

No OpenAI API key is required.

1. Install the current [Codex CLI](https://learn.chatgpt.com/docs/codex-cli).
2. Run `codex login` and choose **Sign in with ChatGPT**.
3. Clone this repository and start Codex from the repository root.
4. Invoke the checked-in skill:

```text
$proofloop-review review this diff and decide whether it is ready for human acceptance
```

Codex discovers the skill at `.agents/skills/proofloop-review/SKILL.md`. It inspects relevant source and tests, runs proportionate checks, cites evidence, and separates executed verification from proposed work.

## Judge test path (under one minute)

1. Open the [live ProofLoop lab](https://luisrodriguezdev.netlify.app/agent-review-lab/).
2. Choose any of the four failure boundaries.
3. Select **Run judge demo**.
4. Inspect the four verdicts, correction plan, and regression evidence.
5. Make the required human decision and download the JSON evidence report.

To test the real GPT‑5.6 workflow, select **Copy Codex review prompt** and paste it into Codex from this repository. The browser demo is explicitly labeled as curated evidence and never pretends to be a live model response.

## Technical design

- Repo-scoped Codex skill for the subscription-native GPT‑5.6 workflow
- Semantic HTML, modern CSS, and vanilla JavaScript for the hosted judge demo
- Four curated regression scenarios with deterministic evidence output
- Keyboard-accessible tabs, reduced-motion support, human decision lock, and JSON export
- Optional server-side Responses API adapter retained for teams that separately choose API billing; it is not enabled or required by the public submission

## Accessibility

`styles-a11y.css` carries additive accessibility overrides, loaded after `styles.css`:

- `body { min-width: 280px }` so the layout reflows below a 320px viewport (WCAG 1.4.10)
- A `forced-colors: active` block that restores the hero and credits headings, which are drawn with a transparent fill plus a text stroke and would otherwise render invisible in Windows High Contrast mode

## Validate locally

Requirements: Node.js 20+. No credential is needed for the public demo.

```bash
npm install
npm test
npm run build
```

For local hosting, run `npm run dev`. The static site is also deployable directly with `netlify.toml`.

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

Luis Rodriguez Rivera — [GitHub](https://github.com/luisangelrod) · [LinkedIn](https://www.linkedin.com/in/luisrodriguez515) · [Email](mailto:luisangelrod17@gmail.com)
