import test from "node:test";
import assert from "node:assert/strict";
import {
  InputError,
  buildReviewInput,
  parsePayload,
  publicUsage
} from "../netlify/functions/lib/evaluation.mjs";

const validPayload = {
  scenario: "Payment state",
  reviewInput: "A provider returns HTTP 200 with result code DECLINED, but the handler persists the transaction as completed.",
  safetyIdentifier: "proofloop_12345678-abcd"
};

test("parsePayload accepts a bounded review", () => {
  assert.deepEqual(parsePayload(validPayload), validPayload);
});

test("parsePayload rejects short evidence", () => {
  assert.throws(() => parsePayload({ ...validPayload, reviewInput: "too short" }), InputError);
});

test("buildReviewInput preserves the supplied evidence and honesty boundary", () => {
  const prompt = buildReviewInput(validPayload);
  assert.match(prompt, /SUPPLIED EVIDENCE/);
  assert.match(prompt, /DECLINED/);
  assert.match(prompt, /Do not claim code was executed/);
});

test("publicUsage exposes only display-safe token counts", () => {
  assert.deepEqual(publicUsage({
    input_tokens: 100,
    output_tokens: 40,
    total_tokens: 140,
    output_tokens_details: { reasoning_tokens: 10 }
  }), {
    inputTokens: 100,
    outputTokens: 40,
    reasoningTokens: 10,
    totalTokens: 140
  });
});
