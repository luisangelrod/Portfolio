import test from "node:test";
import assert from "node:assert/strict";
import {
  CODEX_HANDOFF_PROVENANCE,
  evaluationLanguage
} from "../agent-review-lab/provenance.mjs";

test("curated judge output is never labeled as model output", () => {
  const language = evaluationLanguage("reference");
  assert.equal(language.recommendationLabel, "CURATED RECOMMENDATION");
  assert.match(language.reviewLog, /curated reference/i);
  assert.doesNotMatch(Object.values(language).join(" "), /model/i);
});

test("Codex prompt copying is explicitly a no-model-call handoff", () => {
  assert.match(CODEX_HANDOFF_PROVENANCE, /HANDOFF/);
  assert.match(CODEX_HANDOFF_PROVENANCE, /NO MODEL CALL/);
});

test("the optional live adapter keeps model-specific language", () => {
  assert.equal(evaluationLanguage("live").recommendationLabel, "MODEL RECOMMENDATION");
});
