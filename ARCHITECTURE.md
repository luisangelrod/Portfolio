# ProofLoop architecture and safety notes

## Submission architecture

```text
Developer or judge
        │
        ├── Codex (Sign in with ChatGPT)
        │      │
        │      └── .agents/skills/proofloop-review/SKILL.md
        │             ├── inspect supplied/repository evidence
        │             ├── run proportionate checks
        │             ├── apply four independent gates
        │             └── return evidence-labeled recommendation
        │
        └── Hosted ProofLoop judge demo
               ├── four curated failure boundaries
               ├── deterministic control-loop replay
               ├── explicit human accept/reject gate
               └── JSON evidence export
```

The real model-assisted workflow runs inside Codex through **Sign in with ChatGPT**. The hosted site is deliberately deterministic so every judge can test the complete interaction without a key, billing setup, or hidden server state.

## Trust boundaries

- Supplied code, logs, model output, and generated code are untrusted inputs.
- The skill labels claims as `OBSERVED`, `EXECUTED`, `PROPOSED`, or `UNKNOWN`.
- Only checks actually run in the task may be labeled executed.
- Missing evidence results in `INSUFFICIENT EVIDENCE`, never inferred success.
- Critical or major unresolved findings block a ready-for-human-acceptance recommendation.
- The model can recommend; only a person can accept or reject.

## Privacy and authentication

- No OAuth token is extracted, copied, or stored by ProofLoop.
- No OpenAI API key is required for the submission workflow.
- Codex handles ChatGPT authentication through its supported login flow.
- Users are told not to paste credentials, secrets, or private customer data into the public browser demo.
- The browser demo is client-side and makes no model request.

## Optional API adapter

The repository retains an experimental Netlify Function demonstrating a separate Responses API deployment for organizations that choose usage-based Platform billing. It is not linked from the public flow, is not configured on the deployed site, and is not required to run or judge ProofLoop. If enabled independently, the adapter keeps the API key server-side, uses `store: false`, bounds input/output, and fails transparently when configuration is absent.

## Supported platforms

- Public demo: current desktop and mobile browsers with JavaScript enabled
- Real review workflow: Codex desktop app, CLI, or IDE extension with ChatGPT sign-in and repository access
- Local validation: Node.js 20+
