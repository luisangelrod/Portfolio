import { z } from "zod";

export const MAX_REVIEW_INPUT = 12_000;
export const DEFAULT_MODEL = "gpt-5.6-sol";

const ReviewerSchema = z.object({
  status: z.enum(["PASS", "FINDING", "INSUFFICIENT_EVIDENCE"]),
  severity: z.enum(["PASS", "MINOR", "MAJOR", "CRITICAL"]),
  finding: z.string(),
  evidence: z.string(),
  recommendation: z.string()
});

export const EvaluationSchema = z.object({
  summary: z.string(),
  overallSeverity: z.enum(["PASS", "MINOR", "MAJOR", "CRITICAL"]),
  decision: z.enum(["PASS", "REVISE", "BLOCK"]),
  reviewers: z.object({
    domain: ReviewerSchema,
    security: ReviewerSchema,
    product: ReviewerSchema,
    tests: ReviewerSchema
  }),
  proposedFix: z.object({
    title: z.string(),
    rationale: z.string(),
    changes: z.array(z.string()).min(1).max(6),
    regressionTests: z.array(z.string()).min(2).max(8),
    humanChecks: z.array(z.string()).min(2).max(8)
  }),
  evidenceGates: z.object({
    acceptanceCriterionAddressed: z.boolean(),
    findingsTraceableToInput: z.boolean(),
    regressionPlanPresent: z.boolean(),
    humanDecisionRequired: z.literal(true)
  })
});

export class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = "InputError";
  }
}

export function parsePayload(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InputError("Send a JSON object containing reviewInput.");
  }

  const reviewInput = typeof value.reviewInput === "string" ? value.reviewInput.trim() : "";
  if (reviewInput.length < 40) {
    throw new InputError("Provide at least 40 characters of code, a diff, or a failure report.");
  }
  if (reviewInput.length > MAX_REVIEW_INPUT) {
    throw new InputError(`Review input must be ${MAX_REVIEW_INPUT.toLocaleString()} characters or fewer.`);
  }

  const scenario = typeof value.scenario === "string" ? value.scenario.trim().slice(0, 80) : "Custom review";
  const safetyIdentifier = typeof value.safetyIdentifier === "string" ? value.safetyIdentifier.trim() : "";
  if (!/^proofloop_[a-zA-Z0-9-]{8,80}$/.test(safetyIdentifier)) {
    throw new InputError("The anonymous browser identifier is missing or invalid.");
  }

  return { reviewInput, scenario, safetyIdentifier };
}

export function buildReviewInput({ scenario, reviewInput }) {
  return [
    `REVIEW LABEL: ${scenario}`,
    "",
    "SUPPLIED EVIDENCE:",
    reviewInput,
    "",
    "Return the review panel verdict. Do not claim code was executed or tests passed unless the supplied evidence explicitly proves it."
  ].join("\n");
}

export const REVIEW_INSTRUCTIONS = `You are ProofLoop, an independent software acceptance panel reviewing agent-written work.

Review only the supplied evidence. Separate facts from inference. Never claim that code ran, a test passed, or a vulnerability is exploitable unless the input establishes that evidence. When evidence is missing, use INSUFFICIENT_EVIDENCE and name the smallest verification step.

Evaluate four distinct concerns:
- domain: business rules, state transitions, invariants, and data correctness;
- security: authorization, tenancy, secrets, injection, trust boundaries, and unsafe defaults;
- product: user-visible behavior, accessibility, failure states, and misleading claims;
- tests: regression coverage, negative cases, observability, and reproducible verification.

Decision policy:
- BLOCK for any supported critical finding;
- REVISE for supported minor/major findings or insufficient evidence that prevents acceptance;
- PASS only when the supplied evidence supports acceptance and no reviewer has a finding.

Propose a bounded correction and regression plan. The final gate must always remain a human decision. Keep every field concise, concrete, and traceable to the supplied input.`;

export function publicUsage(usage) {
  if (!usage) return null;
  return {
    inputTokens: usage.input_tokens ?? null,
    outputTokens: usage.output_tokens ?? null,
    reasoningTokens: usage.output_tokens_details?.reasoning_tokens ?? null,
    totalTokens: usage.total_tokens ?? null
  };
}
