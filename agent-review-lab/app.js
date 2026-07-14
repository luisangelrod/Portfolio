(function () {
  const scenarios = {
    payment: {
      severity: 'CRITICAL', category: 'DOMAIN CORRECTNESS', name: 'Payment response misclassification',
      summary: 'A gateway returns HTTP 200 for a declined payment. The first implementation treats transport success as payment success and advances the transaction state.',
      acceptance: 'Only a confirmed provider approval may transition a payment to completed.',
      gap: 'No mapping between provider result codes and the domain state machine.',
      verdicts: {
        domain: ['finding', 'CRITICAL', 'Transport status is being used as a business verdict. A decline can be persisted as paid.'],
        security: ['pass', 'PASS', 'No credential or tenant-boundary defect appears in this isolated change.'],
        product: ['finding', 'MAJOR', 'The success UI can confirm a payment the provider declined.'],
        tests: ['finding', 'MAJOR', 'Coverage omits decline, timeout, malformed response, and retry behavior.']
      },
      fixTitle: 'Map provider results before changing payment state',
      fixCopy: 'Introduce an explicit response mapper. Persist completion only for an approved business code; route declines and unknown results to distinct, recoverable states.',
      tests: ['Declined response never reaches completed', 'Timeout remains pending and safe to retry', 'Malformed provider payload fails closed', 'Repeated callback remains idempotent'],
      humans: ['Run a declined transaction in the provider sandbox', 'Confirm UI, receipt, and stored state agree', 'Inspect retry behavior after a simulated timeout']
    },
    tenant: {
      severity: 'MAJOR', category: 'PRODUCT SAFETY', name: 'Tenant branding overwrite',
      summary: 'A template-import path applies default branding values over an organization’s saved identity without an explicit confirmation step.',
      acceptance: 'Importing content must preserve tenant-owned branding unless the user explicitly chooses to replace it.',
      gap: 'The merge routine cannot distinguish template defaults from user-owned configuration.',
      verdicts: {
        domain: ['finding', 'MAJOR', 'Tenant-owned configuration is not protected as a separate domain concern.'],
        security: ['pass', 'PASS', 'The operation remains scoped to the correct tenant.'],
        product: ['finding', 'MAJOR', 'A normal import path can silently change the customer’s public identity.'],
        tests: ['finding', 'MAJOR', 'No regression test covers existing branding during import.']
      },
      fixTitle: 'Preserve tenant-owned keys by default',
      fixCopy: 'Split content import from branding import. Existing tenant identity wins unless a dedicated, previewable replacement action is confirmed.',
      tests: ['Existing logo and colors survive content import', 'New tenant receives defaults', 'Explicit branding replacement shows a preview', 'Cancel leaves configuration unchanged'],
      humans: ['Import into a branded test tenant', 'Compare public pages before and after import', 'Verify replacement requires an explicit decision']
    },
    isolation: {
      severity: 'CRITICAL', category: 'SECURITY / TENANCY', name: 'Cross-tenant update boundary',
      summary: 'An update endpoint loads a record by its public identifier but does not include the authenticated tenant in the database predicate.',
      acceptance: 'Every tenant-owned read and write must be scoped by both resource identity and authenticated tenant identity.',
      gap: 'Authorization is assumed at the route layer but not enforced in the data access boundary.',
      verdicts: {
        domain: ['finding', 'MAJOR', 'The repository contract does not require tenant identity.'],
        security: ['finding', 'CRITICAL', 'A guessed identifier could modify another tenant’s record.'],
        product: ['pass', 'PASS', 'The intended same-tenant interaction remains coherent.'],
        tests: ['finding', 'CRITICAL', 'There is no negative cross-tenant update case.']
      },
      fixTitle: 'Make tenant identity part of every data predicate',
      fixCopy: 'Require tenant ID in the repository method, apply a composite query predicate, and return the same not-found result for absent and unauthorized records.',
      tests: ['Owner tenant can update its record', 'Different tenant receives not found', 'Missing tenant context is rejected', 'Audit event records the accepted update'],
      humans: ['Test with two isolated tenant sessions', 'Inspect generated query parameters', 'Confirm responses disclose no foreign-record details']
    },
    upstream: {
      severity: 'CRITICAL', category: 'RELIABILITY / SAFETY', name: 'Unknown source rendered as safe',
      summary: 'When an upstream alert source times out, the interface falls back to “No active alerts,” converting missing evidence into a reassuring state.',
      acceptance: 'Unavailable safety data must remain visibly unknown and must never be represented as verified no-alert status.',
      gap: 'The data model has alert and no-alert states, but no explicit source-unavailable state.',
      verdicts: {
        domain: ['finding', 'CRITICAL', 'Unknown and verified clear are modeled as the same state.'],
        security: ['pass', 'PASS', 'No trust-boundary exposure is present.'],
        product: ['finding', 'CRITICAL', 'The fallback can create false confidence in a safety context.'],
        tests: ['finding', 'MAJOR', 'Timeout and malformed-source cases are missing.']
      },
      fixTitle: 'Model source availability as first-class state',
      fixCopy: 'Add an unavailable result, fail closed with a visible warning, return a non-success API status, and prevent cached dynamic safety responses from masking the outage.',
      tests: ['Timeout displays Live Data Unavailable', 'Malformed payload fails closed', 'API returns a non-success status', 'No cached dynamic response replaces the warning'],
      humans: ['Block the upstream request in the browser', 'Confirm every affected view shows unknown state', 'Restore the source and verify recovery']
    }
  };

  const tabs = Array.from(document.querySelectorAll('[data-scenario]'));
  const stageItems = Array.from(document.querySelectorAll('.pipeline li'));
  const runButton = document.getElementById('run-review');
  const resetButton = document.getElementById('reset-review');
  const terminal = document.getElementById('terminal-output');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selected = 'payment';
  let running = false;

  function setText(id, value) { document.getElementById(id).textContent = value; }

  function renderScenario(key) {
    selected = key;
    const item = scenarios[key];
    tabs.forEach((tab) => {
      const active = tab.dataset.scenario === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    document.getElementById('scenario-panel').setAttribute('aria-labelledby', 'scenario-tab-' + key);
    setText('scenario-severity', item.severity);
    setText('scenario-category', item.category);
    setText('scenario-name', item.name);
    setText('scenario-summary', item.summary);
    setText('scenario-acceptance', item.acceptance);
    setText('scenario-gap', item.gap);
    resetRun();
  }

  function resetRun() {
    running = false;
    runButton.disabled = false;
    setText('run-state', 'WAITING');
    setText('run-progress', '0 / 5 gates complete');
    terminal.innerHTML = '<p><b>READY</b> Scenario loaded. Run the review loop.</p><p class="muted">No external model or paid API is used in this demonstration.</p>';
    stageItems.forEach((stage) => stage.classList.remove('active', 'done'));
    document.querySelectorAll('#reviewer-grid article').forEach((card) => {
      card.className = '';
      card.querySelector('header b').textContent = 'PENDING';
      card.querySelector(':scope > p').textContent = 'Waiting for an evaluation run.';
    });
    setText('fix-title', 'Run the loop to reveal the correction.');
    setText('fix-copy', 'The accepted solution will appear here with the reason it closes the reviewer finding.');
    document.getElementById('test-list').innerHTML = '<li>Evidence is generated after the correction stage.</li>';
    document.getElementById('human-list').innerHTML = '<li>The final gate remains a human decision.</li>';
    document.querySelector('.evidence-layout').classList.remove('complete');
  }

  function appendLog(className, label, message) {
    const line = document.createElement('p');
    line.className = className;
    line.innerHTML = '<b>' + label + '</b> ' + message;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function renderVerdicts(item) {
    Object.entries(item.verdicts).forEach(([name, verdict]) => {
      const card = document.querySelector('[data-reviewer="' + name + '"]');
      card.className = verdict[0];
      card.querySelector('header b').textContent = verdict[1];
      card.querySelector(':scope > p').textContent = verdict[2];
    });
  }

  function renderEvidence(item) {
    setText('fix-title', item.fixTitle);
    setText('fix-copy', item.fixCopy);
    document.getElementById('test-list').innerHTML = item.tests.map((entry) => '<li>' + entry + '</li>').join('');
    document.getElementById('human-list').innerHTML = item.humans.map((entry) => '<li>' + entry + '</li>').join('');
    document.querySelector('.evidence-layout').classList.add('complete');
  }

  async function runReview() {
    if (running) return;
    running = true;
    runButton.disabled = true;
    terminal.innerHTML = '';
    const item = scenarios[selected];
    const steps = [
      () => appendLog('info', '[BRIEF]', 'Acceptance criteria and failure boundary loaded.'),
      () => { appendLog('fail', '[REVIEW]', 'Independent panel found defects that block acceptance.'); renderVerdicts(item); },
      () => { appendLog('warn', '[FIX]', item.fixTitle + '.'); setText('fix-title', item.fixTitle); setText('fix-copy', item.fixCopy); },
      () => { appendLog('info', '[TEST]', item.tests.length + ' regression cases attached to the fix.'); renderEvidence(item); },
      () => appendLog('', '[HUMAN]', 'Live verification checklist complete. Change may be accepted.')
    ];

    setText('run-state', 'RUNNING');
    for (let index = 0; index < steps.length; index += 1) {
      stageItems.forEach((stage, stageIndex) => {
        stage.classList.toggle('active', stageIndex === index);
        if (stageIndex < index) stage.classList.add('done');
      });
      steps[index]();
      setText('run-progress', (index + 1) + ' / 5 gates complete');
      if (!reducedMotion) await new Promise((resolve) => window.setTimeout(resolve, 560));
    }
    stageItems.forEach((stage) => { stage.classList.remove('active'); stage.classList.add('done'); });
    setText('run-state', 'ACCEPTED');
    runButton.disabled = false;
    running = false;
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => renderScenario(tab.dataset.scenario));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      renderScenario(tabs[next].dataset.scenario);
    });
  });
  runButton.addEventListener('click', runReview);
  resetButton.addEventListener('click', resetRun);
  renderScenario(selected);
})();
