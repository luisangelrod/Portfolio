# ProofLoop 5.6 Architecture

## Request flow

```text
Editable code/diff/failure report
             |
             v
Browser validation (40–12,000 characters)
             |
             v
POST /api/evaluate
             |
             v
Netlify Function ── server-side OPENAI_API_KEY
             |
             v
OpenAI Responses API / gpt-5.6-sol
             |
             v
Zod Structured Output contract
             |
             v
Four verdicts + correction + evidence plan
             |
             v
Human accept/reject gate + JSON export
```

## Trust boundaries

- The OpenAI API key exists only in the server environment.
- Only the editable review-input text, scenario label, and anonymous browser identifier are sent to the function.
- Input is bounded to 12,000 characters and output to 3,500 tokens.
- API responses use `store: false`.
- The model cannot mark the browser's human decision gate complete.
- A failed or refused response records no acceptance decision.
- Proposed regression tests are labeled as plans, never as executed evidence.
- The reference replay is deterministic and visibly labeled as no model call.

## Structured result

The server requires:

- Overall severity and recommended disposition
- Domain, security, product, and test reviewer objects
- Finding, supplied evidence, and next action for every reviewer
- Bounded correction, regression tests, and human checks
- Explicit evidence-gate booleans, including a required human decision

The same Zod schema creates the OpenAI Structured Output format and validates the parsed response, avoiding a separate hand-maintained JSON schema.

## Failure handling

- Invalid input returns a specific 400 response.
- Missing API configuration returns a transparent 503 response.
- Provider or parsing failure returns a generic 502 response without leaking sensitive error details.
- The browser leaves all acceptance controls locked after failure and offers the reference replay as a separately disclosed mode.

## Current limitations

- ProofLoop reviews supplied text; it does not clone repositories or execute tests.
- The in-memory browser report is not a signed audit artifact.
- There is no account or team policy store.
- A human must independently run and inspect every verification item before treating it as evidence.
