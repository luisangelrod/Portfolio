import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "agent-review-lab/index.html",
  "agent-review-lab/app.js",
  "agent-review-lab/styles.css",
  "netlify/functions/evaluate.mjs",
  "SUBMISSION.md",
  "DEMO_SCRIPT.md"
];

await Promise.all(requiredFiles.map((file) => access(file)));

const [page, client] = await Promise.all([
  readFile("agent-review-lab/index.html", "utf8"),
  readFile("agent-review-lab/app.js", "utf8")
]);

const assertions = [
  [page.includes('id="run-live-review"'), "Live review control is missing"],
  [page.includes('id="human-accept"'), "Human decision gate is missing"],
  [client.includes("/api/evaluate"), "Evaluation API route is missing"],
  [client.includes("downloadEvidenceReport"), "Evidence export is missing"]
];

for (const [passes, message] of assertions) {
  if (!passes) throw new Error(message);
}

console.log("ProofLoop build checks passed.");
