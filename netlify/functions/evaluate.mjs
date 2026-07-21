import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  DEFAULT_MODEL,
  EvaluationSchema,
  InputError,
  REVIEW_INSTRUCTIONS,
  buildReviewInput,
  parsePayload,
  publicUsage
} from "./lib/evaluation.mjs";

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  }
});

export default async function handler(request) {
  if (request.method !== "POST") {
    return json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use POST for evaluations." } }, 405);
  }

  if (!process.env.OPENAI_API_KEY) {
    return json({
      error: {
        code: "MODEL_NOT_CONFIGURED",
        message: "Live GPT-5.6 review is not configured on this deployment. Use the reference replay or add OPENAI_API_KEY."
      }
    }, 503);
  }

  try {
    const body = await request.json();
    const payload = parsePayload(body);
    const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.responses.parse({
      model,
      store: false,
      safety_identifier: payload.safetyIdentifier,
      reasoning: { effort: "medium" },
      max_output_tokens: 3_500,
      instructions: REVIEW_INSTRUCTIONS,
      input: buildReviewInput(payload),
      text: {
        verbosity: "low",
        format: zodTextFormat(EvaluationSchema, "proofloop_evaluation")
      }
    });

    if (!response.output_parsed) {
      return json({
        error: {
          code: "NO_STRUCTURED_RESULT",
          message: "GPT-5.6 did not return a usable structured review. Try a more specific input."
        }
      }, 502);
    }

    return json({
      evaluation: response.output_parsed,
      meta: {
        responseId: response.id,
        model: response.model,
        createdAt: new Date().toISOString(),
        usage: publicUsage(response.usage)
      }
    });
  } catch (error) {
    if (error instanceof InputError || error instanceof SyntaxError) {
      return json({
        error: {
          code: "INVALID_INPUT",
          message: error instanceof SyntaxError ? "Send valid JSON." : error.message
        }
      }, 400);
    }

    console.error("ProofLoop evaluation failed", {
      name: error?.name,
      status: error?.status,
      requestId: error?.request_id
    });
    return json({
      error: {
        code: "EVALUATION_FAILED",
        message: "The live review could not complete. No acceptance decision was recorded; try again or use the reference replay."
      }
    }, 502);
  }
}
