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

ProofLoop packages the evaluation-driven workflow I use professionally into a working developer tool.

## What it does

Users choose a sanitized failure scenario or paste their own code, diff, or failure report. ProofLoop sends only that supplied text to GPT‑5.6 Sol and renders four structured review perspectives:

- Domain correctness
- Security and tenancy
- Product behavior and accessibility
- Tests and regression evidence

The model returns traceable findings, evidence, recommendations, and a bounded correction plan. ProofLoop then exposes the regression plan and human verification checklist without falsely claiming that proposed tests were executed. The fifth gate stays locked until a person explicitly accepts or rejects the result. Users can export the full evidence record as JSON.

## How it was built

The frontend uses semantic HTML, modern CSS, and vanilla JavaScript. A Netlify Function calls the OpenAI Responses API with `gpt-5.6-sol`, explicit medium reasoning, and Structured Outputs generated from a Zod schema. The function bounds input and output, keeps the API key server-side, disables response storage, handles refusals and failures without recording acceptance, and returns token usage plus response provenance for the evidence report.

Codex was used to inspect the existing deterministic ProofLoop work sample, redesign it as a live developer tool, implement the GPT‑5.6 integration, create validation tests, preserve accessible keyboard behavior, verify the deployed interaction, and prepare the submission and demo materials.

## Challenges

The central challenge was not asking a model for “a code review.” It was creating an honest boundary between model judgment, deterministic product constraints, proposed regression checks, and evidence that a human still needs to collect. The interface must remain useful during an API failure without passing a canned result off as live output, so reference replay and live GPT‑5.6 review are visibly distinct modes.

## Accomplishments

- One structured contract across four independent review roles
- Evidence and recommendations remain traceable to supplied input
- Proposed tests are never displayed as executed tests
- Live and deterministic modes are explicitly labeled
- Human acceptance cannot be automated by the model response
- Exportable run provenance, findings, usage, evidence plan, and human decision

## What is next

- Review Git patches and pull-request URLs directly
- Attach CI results and coverage artifacts as verified evidence
- Add organization-specific review policies and acceptance criteria
- Compare reviewer consistency across a maintained evaluation set
- Write signed evidence reports back to a pull request or ticket

## Final submission checklist

- [ ] Deploy with `OPENAI_API_KEY` configured
- [ ] Run one live GPT‑5.6 review and confirm response provenance
- [ ] Record and upload the public demo video under three minutes
- [ ] Add the YouTube URL above and in Devpost
- [ ] Run `/feedback` in the primary Codex build task
- [ ] Add the returned session ID above and in Devpost
- [ ] Confirm repository visibility or share a private repository with the judging addresses
- [ ] Submit before the Devpost deadline
