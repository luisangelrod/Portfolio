export function evaluationLanguage(mode) {
  if (mode === "live") {
    return {
      recommendationLabel: "MODEL RECOMMENDATION",
      reviewLog: "Four schema-bound model verdicts returned",
      humanLog: "Model recommendation recorded",
      decisionSource: "Model recommendation"
    };
  }

  return {
    recommendationLabel: "CURATED RECOMMENDATION",
    reviewLog: "Four curated reference verdicts loaded",
    humanLog: "Curated recommendation recorded",
    decisionSource: "Curated recommendation"
  };
}

export const CODEX_HANDOFF_PROVENANCE = "HANDOFF / CODEX PROMPT COPIED · NO MODEL CALL";
