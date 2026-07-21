(function () {
  const scenarios = {
    payment: {
      severity: "CRITICAL",
      category: "DOMAIN CORRECTNESS",
      name: "Payment response misclassification",
      summary: "A gateway returns HTTP 200 for a declined payment. The first implementation treats transport success as payment success and advances the transaction state.",
      acceptance: "Only a confirmed provider approval may transition a payment to completed.",
      gap: "No mapping between provider result codes and the domain state machine.",
      input: `Context: Payment callback handler
Acceptance criterion: Only a confirmed provider approval may transition a payment to completed.

Observed first pass:
async function handlePayment(response) {
  if (response.ok) {
    await payments.update(response.paymentId, { status: "completed" });
    return { success: true };
  }
  return { success: false };
}

Failure evidence: The provider returns HTTP 200 with resultCode="DECLINED" for a business decline. The handler checks only transport success and records the payment as completed. No tests cover decline, timeout, malformed payload, or repeated callbacks.`,
      reference: {
        summary: "Transport success is incorrectly treated as provider approval, so a declined payment can be persisted and displayed as completed.",
        overallSeverity: "CRITICAL",
        decision: "BLOCK",
        reviewers: {
          domain: { status: "FINDING", severity: "CRITICAL", finding: "The state transition ignores the provider business result.", evidence: "The handler branches only on response.ok while the supplied failure shows resultCode=DECLINED can accompany HTTP 200.", recommendation: "Map provider result codes to explicit domain states before persistence." },
          security: { status: "INSUFFICIENT_EVIDENCE", severity: "MAJOR", finding: "Callback authenticity and replay protection are not shown.", evidence: "The supplied handler contains no signature validation or idempotency evidence.", recommendation: "Verify signed callbacks and enforce an idempotency key before accepting retries." },
          product: { status: "FINDING", severity: "MAJOR", finding: "The success response can tell a customer that a declined payment completed.", evidence: "The function returns success immediately after the incorrect completed transition.", recommendation: "Render approved, declined, pending, and unknown states distinctly." },
          tests: { status: "FINDING", severity: "MAJOR", finding: "Critical negative paths have no regression coverage.", evidence: "The supplied report explicitly lists decline, timeout, malformed payload, and repeated callback as uncovered.", recommendation: "Add table-driven state mapping tests and an idempotent callback integration test." }
        },
        proposedFix: {
          title: "Map provider results before changing payment state",
          rationale: "Transport status only proves that a response arrived; the provider business code must control the domain transition.",
          changes: ["Introduce a typed provider-result mapper", "Persist completed only for an explicit approved code", "Route decline and unknown results to distinct recoverable states", "Require callback verification and idempotent processing"],
          regressionTests: ["Declined HTTP 200 never reaches completed", "Timeout remains pending and safe to retry", "Malformed provider payload fails closed", "Repeated callback produces one state transition"],
          humanChecks: ["Run an approved and declined transaction in the provider sandbox", "Confirm UI, receipt, and stored state agree", "Inspect retry behavior after a simulated timeout"]
        },
        evidenceGates: { acceptanceCriterionAddressed: true, findingsTraceableToInput: true, regressionPlanPresent: true, humanDecisionRequired: true }
      }
    },
    tenant: {
      severity: "MAJOR",
      category: "PRODUCT SAFETY",
      name: "Tenant branding overwrite",
      summary: "A template-import path applies default branding over an organization’s saved identity without an explicit confirmation step.",
      acceptance: "Importing content must preserve tenant-owned branding unless the user explicitly chooses to replace it.",
      gap: "The merge routine cannot distinguish template defaults from user-owned configuration.",
      input: `Context: Multi-tenant template importer
Acceptance criterion: Importing content must preserve tenant-owned branding unless the user explicitly chooses to replace it.

Observed first pass:
const mergedSettings = {
  ...organization.settings,
  ...template.defaults,
  pages: importedPages
};
await organizations.update(organization.id, { settings: mergedSettings });

Failure evidence: template.defaults contains logoUrl, primaryColor, and publicName. Importing ordinary page content silently replaces a tenant's saved public identity.`,
      reference: {
        summary: "Template defaults have higher merge precedence than tenant-owned identity, allowing a routine content import to overwrite public branding.",
        overallSeverity: "MAJOR",
        decision: "REVISE",
        reviewers: {
          domain: { status: "FINDING", severity: "MAJOR", finding: "Tenant-owned branding is not modeled separately from template content.", evidence: "template.defaults is spread after organization.settings and therefore wins on overlapping keys.", recommendation: "Separate content import from identity replacement contracts." },
          security: { status: "INSUFFICIENT_EVIDENCE", severity: "MAJOR", finding: "The tenant authorization boundary is not demonstrated.", evidence: "The snippet updates organization.id but supplies no authenticated tenant predicate.", recommendation: "Require the authenticated tenant ID in the update predicate and add a negative cross-tenant test." },
          product: { status: "FINDING", severity: "MAJOR", finding: "A normal import can silently change the customer's public identity.", evidence: "The supplied template keys include logoUrl, primaryColor, and publicName with no confirmation step.", recommendation: "Preserve branding by default and preview any explicit replacement." },
          tests: { status: "FINDING", severity: "MAJOR", finding: "No preservation or cancel-path evidence is supplied.", evidence: "The report describes the overwrite but includes no regression test.", recommendation: "Test branded tenant import, new-tenant defaults, explicit replacement, and cancel." }
        },
        proposedFix: {
          title: "Preserve tenant-owned identity by default",
          rationale: "Content and tenant identity have different ownership and confirmation rules.",
          changes: ["Split content fields from branding fields", "Keep existing tenant identity during ordinary imports", "Add a previewable explicit branding-replacement action"],
          regressionTests: ["Existing logo and colors survive content import", "New tenant may receive defaults", "Explicit replacement displays a preview", "Cancel leaves configuration unchanged"],
          humanChecks: ["Import into a branded test tenant", "Compare public pages before and after import", "Verify replacement requires an explicit decision"]
        },
        evidenceGates: { acceptanceCriterionAddressed: true, findingsTraceableToInput: true, regressionPlanPresent: true, humanDecisionRequired: true }
      }
    },
    isolation: {
      severity: "CRITICAL",
      category: "SECURITY / TENANCY",
      name: "Cross-tenant update boundary",
      summary: "An update endpoint loads a record by public identifier but omits the authenticated tenant from the database predicate.",
      acceptance: "Every tenant-owned read and write must be scoped by resource identity and authenticated tenant identity.",
      gap: "Authorization is assumed at the route layer but not enforced at the data boundary.",
      input: `Context: Multi-tenant record update
Acceptance criterion: Every tenant-owned read and write must be scoped by both resource identity and authenticated tenant identity.

Observed first pass:
export async function updateRecord(req) {
  const user = await requireUser(req);
  const record = await db.records.findUnique({ where: { id: req.params.id } });
  return db.records.update({ where: { id: record.id }, data: req.body });
}

Failure evidence: Two tenants use the same route. A user who learns another public record ID can reach the update path because neither database predicate includes user.tenantId.`,
      reference: {
        summary: "The update boundary relies on record ID alone, allowing authenticated users to target records outside their tenant.",
        overallSeverity: "CRITICAL",
        decision: "BLOCK",
        reviewers: {
          domain: { status: "FINDING", severity: "MAJOR", finding: "The repository contract does not require tenant identity.", evidence: "Both findUnique and update accept only the public record ID.", recommendation: "Make tenant ID a required repository argument for all tenant-owned operations." },
          security: { status: "FINDING", severity: "CRITICAL", finding: "A guessed identifier can cross the tenant authorization boundary.", evidence: "The supplied evidence states another tenant's ID reaches a predicate with no tenant filter.", recommendation: "Use a composite id-and-tenant predicate and a nondisclosing not-found response." },
          product: { status: "PASS", severity: "PASS", finding: "No separate user-experience defect is established beyond the security boundary.", evidence: "The supplied flow describes the intended same-tenant update and the cross-tenant authorization failure.", recommendation: "Keep the same same-tenant interaction while normalizing unauthorized and missing responses." },
          tests: { status: "FINDING", severity: "CRITICAL", finding: "A negative cross-tenant update case is required.", evidence: "No test evidence accompanies the vulnerable predicates.", recommendation: "Create two tenant fixtures and prove each cannot read or write the other's record." }
        },
        proposedFix: {
          title: "Put tenant identity in every data predicate",
          rationale: "Authorization must be enforced where tenant-owned data is selected and mutated, not assumed from route authentication.",
          changes: ["Require tenantId in the repository method", "Apply a composite ID and tenant predicate", "Return the same not-found result for absent and unauthorized records", "Record an audit event for accepted updates"],
          regressionTests: ["Owner tenant can update its record", "Different tenant receives not found", "Missing tenant context is rejected", "Audit event records only the accepted update"],
          humanChecks: ["Test with two isolated tenant sessions", "Inspect generated query parameters", "Confirm responses disclose no foreign-record details"]
        },
        evidenceGates: { acceptanceCriterionAddressed: true, findingsTraceableToInput: true, regressionPlanPresent: true, humanDecisionRequired: true }
      }
    },
    upstream: {
      severity: "CRITICAL",
      category: "RELIABILITY / SAFETY",
      name: "Unknown source rendered as safe",
      summary: "When an upstream alert source times out, the interface falls back to “No active alerts,” converting missing evidence into reassurance.",
      acceptance: "Unavailable safety data must remain visibly unknown and never be represented as verified no-alert status.",
      gap: "The data model has alert and no-alert states, but no explicit source-unavailable state.",
      input: `Context: Public-safety alert summary
Acceptance criterion: Unavailable safety data must remain visibly unknown and must never be represented as verified no-alert status.

Observed first pass:
try {
  const alerts = await fetchAlerts();
  return alerts.length ? { status: "alert", alerts } : { status: "clear" };
} catch (error) {
  return { status: "clear", alerts: [] };
}

Failure evidence: When the upstream NWS request times out, the UI renders "No active alerts". The product has no source-unavailable state and the catch path is cached as a successful response.`,
      reference: {
        summary: "The failure path converts missing safety evidence into a verified-clear state, creating false confidence during an upstream outage.",
        overallSeverity: "CRITICAL",
        decision: "BLOCK",
        reviewers: {
          domain: { status: "FINDING", severity: "CRITICAL", finding: "Unknown and verified-clear are modeled as the same state.", evidence: "Both an empty successful response and the catch block return status=clear.", recommendation: "Add an explicit source-unavailable state with provenance and freshness." },
          security: { status: "PASS", severity: "PASS", finding: "No separate confidentiality or authorization issue is established.", evidence: "The supplied boundary concerns availability and misleading safety state.", recommendation: "Retain ordinary input validation and safe upstream error handling." },
          product: { status: "FINDING", severity: "CRITICAL", finding: "The fallback can reassure users when live safety data is unknown.", evidence: "The report states the UI renders No active alerts after timeout.", recommendation: "Display Live data unavailable and direct users to official sources." },
          tests: { status: "FINDING", severity: "MAJOR", finding: "Timeout, malformed source, and recovery evidence are missing.", evidence: "The catch path is described as cached success with no failure-state tests.", recommendation: "Test failure, cache headers, stale data, and source recovery." }
        },
        proposedFix: {
          title: "Model source availability as first-class state",
          rationale: "A safety product must distinguish verified-clear evidence from an unavailable source.",
          changes: ["Add an unavailable result with source and timestamp", "Fail closed with a visible warning", "Return a non-success API status for live-source failure", "Prevent dynamic outage responses from being cached as clear"],
          regressionTests: ["Timeout displays Live data unavailable", "Malformed payload fails closed", "API returns a non-success status", "No cached clear response masks the outage"],
          humanChecks: ["Block the upstream request in the browser", "Confirm every affected view shows unknown state", "Restore the source and verify recovery"]
        },
        evidenceGates: { acceptanceCriterionAddressed: true, findingsTraceableToInput: true, regressionPlanPresent: true, humanDecisionRequired: true }
      }
    }
  };

  const tabs = Array.from(document.querySelectorAll("[data-scenario]"));
  const stageItems = Array.from(document.querySelectorAll(".pipeline li"));
  const liveButton = document.getElementById("run-live-review");
  const replayButton = document.getElementById("run-reference-review");
  const resetButton = document.getElementById("reset-review");
  const reviewInput = document.getElementById("review-input");
  const terminal = document.getElementById("terminal-output");
  const acceptButton = document.getElementById("human-accept");
  const rejectButton = document.getElementById("human-reject");
  const downloadButton = document.getElementById("download-report");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let selected = "payment";
  let running = false;
  let currentRun = null;
  let humanDecision = null;

  function setText(id, value) {
    document.getElementById(id).textContent = value;
  }

  function replaceList(id, entries) {
    const list = document.getElementById(id);
    list.replaceChildren(...entries.map((entry) => {
      const item = document.createElement("li");
      item.textContent = entry;
      return item;
    }));
  }

  function updateCount() {
    setText("input-count", reviewInput.value.length.toLocaleString());
  }

  function getSafetyIdentifier() {
    try {
      const key = "proofloop-anonymous-id";
      let value = localStorage.getItem(key);
      if (!value) {
        const id = window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
        value = `proofloop_${id}`;
        localStorage.setItem(key, value);
      }
      return value;
    } catch {
      return `proofloop_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    }
  }

  function appendLog(className, label, message) {
    const line = document.createElement("p");
    if (className) line.className = className;
    const marker = document.createElement("b");
    marker.textContent = label;
    line.append(marker, document.createTextNode(` ${message}`));
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function setStage(activeIndex, completedThrough = activeIndex - 1) {
    stageItems.forEach((stage, index) => {
      stage.classList.toggle("active", index === activeIndex);
      stage.classList.toggle("done", index <= completedThrough);
    });
  }

  function setBusy(value) {
    running = value;
    liveButton.disabled = value;
    replayButton.disabled = value;
    reviewInput.disabled = value;
    if (value) {
      acceptButton.disabled = true;
      rejectButton.disabled = true;
      downloadButton.disabled = true;
    }
  }

  function resetCards() {
    document.querySelectorAll("#reviewer-grid article").forEach((card) => {
      card.className = "";
      card.querySelector("header b").textContent = "PENDING";
      card.querySelector(".review-finding").textContent = "Waiting for an evaluation run.";
      card.querySelector(".review-evidence").textContent = "—";
      card.querySelector(".review-action").textContent = "—";
    });
  }

  function resetRun(options = {}) {
    setBusy(false);
    currentRun = null;
    humanDecision = null;
    setText("run-state", "WAITING");
    setText("run-progress", "0 / 5 gates complete");
    setText("run-provenance", "MODE / NOT STARTED");
    terminal.replaceChildren();
    appendLog("", "READY", options.reason || "Evidence loaded. Run GPT‑5.6 or replay the reference evaluation.");
    appendLog("muted", "PRIVACY", "A live run sends only the review-input text to the server-side OpenAI API.");
    stageItems.forEach((stage) => stage.classList.remove("active", "done"));
    resetCards();
    setText("fix-title", "Run a review to reveal the correction plan.");
    setText("fix-copy", "ProofLoop will separate the proposed change from evidence that still requires verification.");
    replaceList("change-list", ["No changes proposed yet."]);
    replaceList("test-list", ["Evidence is generated after review."]);
    replaceList("human-list", ["The final gate remains a human decision."]);
    document.querySelector(".evidence-layout").classList.remove("complete");
    acceptButton.disabled = true;
    rejectButton.disabled = true;
    downloadButton.disabled = true;
    setText("decision-title", "No automated acceptance.");
    setText("decision-summary", "After reviewing the findings and evidence plan, a human must accept or reject the proposed disposition.");
    const stamp = document.getElementById("decision-stamp");
    stamp.className = "decision-stamp";
    stamp.querySelector("span").textContent = "PENDING";
    stamp.querySelector("small").textContent = "Human decision required";
  }

  function renderScenario(key) {
    selected = key;
    const item = scenarios[key];
    tabs.forEach((tab) => {
      const active = tab.dataset.scenario === key;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    document.getElementById("scenario-panel").setAttribute("aria-labelledby", `scenario-tab-${key}`);
    setText("scenario-severity", item.severity);
    setText("scenario-category", item.category);
    setText("scenario-name", item.name);
    setText("scenario-summary", item.summary);
    setText("scenario-acceptance", item.acceptance);
    setText("scenario-gap", item.gap);
    reviewInput.value = item.input;
    updateCount();
    resetRun();
  }

  function renderVerdicts(evaluation) {
    Object.entries(evaluation.reviewers).forEach(([name, verdict]) => {
      const card = document.querySelector(`[data-reviewer="${name}"]`);
      card.className = verdict.status === "PASS" ? "pass" : verdict.status === "FINDING" ? "finding" : "insufficient";
      card.querySelector("header b").textContent = verdict.severity;
      card.querySelector(".review-finding").textContent = verdict.finding;
      card.querySelector(".review-evidence").textContent = verdict.evidence;
      card.querySelector(".review-action").textContent = verdict.recommendation;
    });
  }

  function renderEvidence(evaluation) {
    setText("fix-title", evaluation.proposedFix.title);
    setText("fix-copy", evaluation.proposedFix.rationale);
    replaceList("change-list", evaluation.proposedFix.changes);
    replaceList("test-list", evaluation.proposedFix.regressionTests);
    replaceList("human-list", evaluation.proposedFix.humanChecks);
    document.querySelector(".evidence-layout").classList.add("complete");
    setText("decision-title", `MODEL RECOMMENDATION / ${evaluation.decision}`);
    setText("decision-summary", evaluation.summary);
  }

  async function briefPause() {
    if (!reducedMotion) await new Promise((resolve) => window.setTimeout(resolve, 240));
  }

  async function finishEvaluation(evaluation, meta) {
    setStage(1, 0);
    appendLog("info", "[REVIEW]", `Four schema-bound verdicts returned. Overall severity: ${evaluation.overallSeverity}.`);
    renderVerdicts(evaluation);
    setText("run-progress", "2 / 5 gates complete");
    await briefPause();

    setStage(2, 1);
    appendLog("warn", "[CORRECT]", evaluation.proposedFix.title);
    renderEvidence(evaluation);
    setText("run-progress", "3 / 5 gates complete");
    await briefPause();

    setStage(3, 2);
    const gates = evaluation.evidenceGates;
    const gateCount = [gates.acceptanceCriterionAddressed, gates.findingsTraceableToInput, gates.regressionPlanPresent, gates.humanDecisionRequired].filter(Boolean).length;
    appendLog("info", "[GATE]", `${gateCount} / 4 evidence contracts present; proposed checks are not represented as executed tests.`);
    setText("run-progress", "4 / 5 gates complete");
    await briefPause();

    currentRun = { evaluation, meta, scenario: scenarios[selected].name, reviewInput: reviewInput.value };
    setStage(4, 3);
    setText("run-state", "HUMAN REQUIRED");
    appendLog("", "[HUMAN]", "Model recommendation recorded. Acceptance remains locked until a person decides.");
    acceptButton.disabled = false;
    rejectButton.disabled = false;
    downloadButton.disabled = false;
    setBusy(false);
    acceptButton.disabled = false;
    rejectButton.disabled = false;
    downloadButton.disabled = false;

    const modelLabel = meta.mode === "live" ? `${meta.model} / ${meta.responseId}` : "REFERENCE REPLAY / NO MODEL CALL";
    setText("run-provenance", modelLabel);
  }

  async function runLiveReview() {
    const input = reviewInput.value.trim();
    if (input.length < 40) {
      reviewInput.focus();
      setText("run-state", "INPUT REQUIRED");
      return;
    }

    resetRun();
    setBusy(true);
    terminal.replaceChildren();
    setText("run-state", "RUNNING GPT‑5.6");
    setText("run-provenance", "MODE / LIVE RESPONSES API");
    setStage(0, -1);
    appendLog("info", "[BOUND]", `${input.length.toLocaleString()} characters loaded with explicit acceptance evidence.`);
    setText("run-progress", "1 / 5 gates complete");

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scenario: scenarios[selected].name,
          reviewInput: input,
          safetyIdentifier: getSafetyIdentifier()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error?.message || `Evaluation failed with status ${response.status}.`);
      await finishEvaluation(payload.evaluation, { mode: "live", ...payload.meta });
    } catch (error) {
      setBusy(false);
      stageItems.forEach((stage) => stage.classList.remove("active"));
      setText("run-state", "LIVE RUN FAILED");
      setText("run-provenance", "MODE / LIVE ERROR");
      appendLog("fail", "[STOP]", error.message || "The live review could not complete.");
      appendLog("muted", "[SAFE]", "No acceptance decision was recorded. The reference replay remains available.");
    }
  }

  async function runReferenceReview() {
    const input = reviewInput.value.trim();
    if (input.length < 40) {
      reviewInput.focus();
      setText("run-state", "INPUT REQUIRED");
      return;
    }

    resetRun();
    setBusy(true);
    terminal.replaceChildren();
    setText("run-state", "REFERENCE REPLAY");
    setText("run-provenance", "MODE / REFERENCE · NO MODEL CALL");
    setStage(0, -1);
    appendLog("info", "[BOUND]", "Curated scenario loaded for a deterministic workflow replay.");
    appendLog("muted", "[DISCLOSE]", "This run does not call GPT‑5.6 and is labeled separately from live output.");
    setText("run-progress", "1 / 5 gates complete");
    await briefPause();
    await finishEvaluation(scenarios[selected].reference, {
      mode: "reference",
      model: null,
      responseId: null,
      createdAt: new Date().toISOString(),
      usage: null
    });
  }

  function recordHumanDecision(decision) {
    if (!currentRun) return;
    humanDecision = {
      decision,
      decidedAt: new Date().toISOString()
    };
    stageItems.forEach((stage) => { stage.classList.remove("active"); stage.classList.add("done"); });
    setText("run-state", decision === "ACCEPTED" ? "ACCEPTED BY HUMAN" : "REJECTED BY HUMAN");
    setText("run-progress", "5 / 5 gates complete");
    appendLog(decision === "ACCEPTED" ? "" : "fail", "[DECISION]", `${decision} by human review. Model recommendation was ${currentRun.evaluation.decision}.`);
    const stamp = document.getElementById("decision-stamp");
    stamp.className = `decision-stamp ${decision === "ACCEPTED" ? "accepted" : "rejected"}`;
    stamp.querySelector("span").textContent = decision;
    stamp.querySelector("small").textContent = `Human decision · ${new Date(humanDecision.decidedAt).toLocaleString()}`;
    acceptButton.disabled = true;
    rejectButton.disabled = true;
  }

  function downloadEvidenceReport() {
    if (!currentRun) return;
    const report = {
      proofLoopVersion: "5.6",
      exportedAt: new Date().toISOString(),
      run: {
        mode: currentRun.meta.mode,
        model: currentRun.meta.model,
        responseId: currentRun.meta.responseId,
        createdAt: currentRun.meta.createdAt,
        usage: currentRun.meta.usage
      },
      scenario: currentRun.scenario,
      suppliedEvidence: currentRun.reviewInput,
      evaluation: currentRun.evaluation,
      humanDecision
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `proofloop-evidence-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => renderScenario(tab.dataset.scenario));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      tabs[next].focus();
      renderScenario(tabs[next].dataset.scenario);
    });
  });

  reviewInput.addEventListener("input", () => {
    updateCount();
    if (currentRun) resetRun({ reason: "Input changed. Previous findings were invalidated." });
  });
  liveButton.addEventListener("click", runLiveReview);
  replayButton.addEventListener("click", runReferenceReview);
  resetButton.addEventListener("click", () => resetRun());
  acceptButton.addEventListener("click", () => recordHumanDecision("ACCEPTED"));
  rejectButton.addEventListener("click", () => recordHumanDecision("REJECTED"));
  downloadButton.addEventListener("click", downloadEvidenceReport);

  renderScenario(selected);
})();
