# OpenAI Build Week Submission — ProofLoop 5.6

## Submission fields

**Project name:** ProofLoop 5.6

**Tagline:** Make agent-written code earn acceptance.

**Track:** Developer Tools

**Live project:** <https://luisrodriguezdev.netlify.app/agent-review-lab/>

**Repository:** <https://github.com/luisangelrod/Portfolio>

**Demo video:** _Add the public YouTube URL after recording._

**Codex `/feedback` session ID:** _Add the session ID from the Codex task that produced this Build Week implementation._

## Inspiration

Coding agents are good at producing a plausible first implementation. The harder production question is what happens next: Who checks the business invariant? Who tests the tenant boundary? Who catches a reassuring failure state? What evidence is required before a human accepts the work?

ProofLoop packages the evaluation-driven workflow I use professionally into a reusable Codex developer tool.

## What it does

ProofLoop has two honest, complementary surfaces:

- A checked-in `$proofloop-review` Codex skill performs real GPT‑5.6 review through the user's ChatGPT subscription. It inspects the repository, runs proportionate checks, cites file evidence, and returns independent Domain, Security, Product, and Tests verdicts.
- A public, zero-setup browser demo lets judges explore four curated failure boundaries, trace the same review contract, make the required human decision, and export the evidence record as JSON.

Every important claim is labeled as observed, executed, proposed, or unknown. Proposed tests are never presented as executed, and the fifth gate stays locked until a person explicitly accepts or rejects the result.

## How it was built

The reusable workflow lives in `.agents/skills/proofloop-review/SKILL.md`, so Codex discovers it automatically when launched from the repository. It works with **Sign in with ChatGPT** and does not require an OpenAI API key.

The hosted judge experience uses semantic HTML, modern CSS, and vanilla JavaScript. It contains deterministic reference evidence rather than pretending that the deployment made a live model call. An optional server-side Responses API adapter remains in the repository for teams that separately choose API billing, but it is not enabled or required for this submission.

Codex with GPT‑5.6 was used meaningfully to inspect the earlier portfolio work sample, redesign ProofLoop as a reusable developer workflow, implement the interface and skill, create validation tests, preserve accessible keyboard behavior, verify the deployment, and prepare the submission materials.

## Challenges

The core challenge was not prompting a model for “a code review.” It was defining an honest boundary between model judgment, deterministic product constraints, executed verification, proposed regression checks, and evidence that a human still needs to collect. The second challenge was making the project judgeable without requiring anyone to provision an API key.

## Accomplishments

- Subscription-native GPT‑5.6 workflow with no extracted OAuth token or API key
- One reusable contract across four independent review gates
- Findings and recommendations traceable to supplied or repository evidence
- Executed checks kept visibly separate from proposed tests
- Zero-setup deterministic judge path that never impersonates a live model run
- Human acceptance cannot be automated by model output
- Exportable findings, evidence plan, provenance, and human decision

## What is next

- Review Git patches and pull-request URLs directly
- Attach CI results and coverage artifacts as verified evidence
- Add organization-specific review policies and acceptance criteria
- Compare reviewer consistency across a maintained evaluation set
- Optionally write signed evidence reports back to a pull request or ticket

## Final submission checklist

- [x] Deploy a working, zero-setup public judge demo
- [x] Publish the repo-scoped Codex skill and installation instructions
- [x] Document how Codex and GPT‑5.6 were used
- [x] Provide an easy judge test path and supported platform details
- [ ] Record and upload the public demo video under three minutes
- [ ] Add the YouTube URL above and in Devpost
- [ ] Run `/feedback` in the primary Codex build task
- [ ] Add the returned session ID above and in Devpost
- [ ] Complete the Devpost account profile fields
- [ ] Submit before July 21, 2026 at 5:00 PM PDT
