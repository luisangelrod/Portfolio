import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "agent-review-lab/index.html",
  "agent-review-lab/app.js",
  "agent-review-lab/provenance.mjs",
  "agent-review-lab/styles.css",
  ".agents/skills/proofloop-review/SKILL.md",
  "SUBMISSION.md",
  "DEMO_SCRIPT.md"
];

await Promise.all(requiredFiles.map((file) => access(file)));

const [page, client, skill] = await Promise.all([
  readFile("agent-review-lab/index.html", "utf8"),
  readFile("agent-review-lab/app.js", "utf8"),
  readFile(".agents/skills/proofloop-review/SKILL.md", "utf8")
]);

const assertions = [
  [page.includes('id="run-live-review"'), "Codex prompt control is missing"],
  [page.includes('id="human-accept"'), "Human decision gate is missing"],
  [client.includes("$proofloop-review"), "Codex subscription workflow is missing"],
  [client.includes("downloadEvidenceReport"), "Evidence export is missing"],
  [skill.includes("name: proofloop-review"), "ProofLoop skill metadata is missing"],
  [skill.includes("EXECUTED"), "Evidence integrity labels are missing"]
];

for (const [passes, message] of assertions) {
  if (!passes) throw new Error(message);
}

console.log("ProofLoop build checks passed.");
