(() => {
  const stages = [
    {
      code:'GATE_01', status:'REQUIRED', risk:'UNKNOWN', title:'Define the target before asking for code.',
      summary:'The mission starts with a real problem, constraints, and acceptance criteria. The agent is not allowed to redefine success after seeing its own output.',
      evidence:[['GOAL','Classify a payment response without treating a declined transaction as success.'],['CONSTRAINTS','Preserve tenant isolation, existing API shape, audit logging, and rollback behavior.'],['ACCEPTANCE','Known decline codes remain declined; unknown codes fail explicitly; regression tests cover both.']]
    },
    {
      code:'GATE_02', status:'UNTRUSTED', risk:'ELEVATED', title:'Generate inside a bounded assignment.',
      summary:'A coding agent receives the issue, relevant files, constraints, and completion checks. Its output is a contribution to inspect—not a finished product to celebrate.',
      evidence:[['CONTEXT','Only the response classifier, contract, related tests, and domain rules are supplied.'],['MODEL ROUTE','Choose the model for the task; protect context and token budget instead of sending the entire repository.'],['OUTPUT','Patch, explanation, assumptions, and proposed tests. First-pass status: untrusted.']]
    },
    {
      code:'GATE_03', status:'CHALLENGED', risk:'HIGH', title:'Independent judges attack different failure modes.',
      summary:'Role-specific AI reviewers receive the goal and output separately. They must cite evidence and cannot approve their own implementation. Their findings are leads—not facts until reproduced.',
      evidence:[['RUBRIC','Domain correctness, security boundaries, regression quality, evidence, and severity definitions.'],['SEPARATION','Implementation agent does not grade itself. Reviewers use distinct roles and scoped instructions.'],['LIMIT','AI judges are probabilistic. Their agreement with deterministic checks and humans must be monitored.']], judges:true
    },
    {
      code:'GATE_04', status:'CORRECTING', risk:'MEDIUM', title:'Convert findings into fixes, not discussion.',
      summary:'A judge identifies that one response path still maps an ambiguous provider code to success. The finding is reproduced, corrected, and converted into a regression test.',
      evidence:[['FINDING','Unknown provider status inherited the previous success state. Reproduced with a sanitized fixture.','fail'],['FIX','Replace permissive fallback with explicit unknown-state handling and structured audit context.'],['REGRESSION','Add a test that fails on the old behavior and passes only after the correction.']]
    },
    {
      code:'GATE_05', status:'EVIDENCE', risk:'LOW', title:'Deterministic checks establish what actually happened.',
      summary:'The corrected change must compile, pass targeted and broader tests, and survive browser or hardware verification where applicable. A confident judge verdict cannot replace this evidence.',
      evidence:[['BUILD','Application compiles with no new warnings.','pass'],['TESTS','Known decline, unknown status, success, retry, and tenant-boundary cases pass.','pass'],['RUNTIME','Observed behavior matches the acceptance criteria in a production-like path.','pass']]
    },
    {
      code:'GATE_06', status:'HUMAN', risk:'ACCEPTED', title:'A human closes the loop and owns the release.',
      summary:'The engineer reviews the diff, evidence, remaining uncertainty, and reviewer disagreements. Acceptance is explicit, traceable, and reversible—not inferred because an agent stopped responding.',
      evidence:[['TRACE','Goal → output → findings → fixes → regression evidence remains inspectable.','pass'],['JUDGMENT','Residual risk is understood; unsupported claims are removed.','pass'],['DECISION','Human accepts, rejects, or sends the change through another loop.','pass']], human:true
    }
  ];
  const judgeFindings = {
    domain:'Rubric: payment-state invariants and fail-explicit behavior. Finding: an unrecognized provider code can inherit a prior success state. Severity: critical until reproduced.',
    security:'Rubric: tenant boundary, sensitive logging, and authorization. Finding: no cross-tenant path observed, but the new audit field must remain redacted. Severity: review required.',
    tests:'Rubric: tests must fail before the fix and cover negative paths. Finding: the first test only confirms the happy path; it cannot detect the reported defect. Severity: major.'
  };
  const stageNames = ['Define','Generate','Judge','Correct','Verify','Accept'];
  let current = 0;
  let launched = false;
  let audio = null;
  const stageButtons = [...document.querySelectorAll('[data-stage]')];
  const ship = document.getElementById('player-ship');
  const course = document.getElementById('course');
  const lineCanvas = document.getElementById('course-lines');
  const starCanvas = document.getElementById('starfield');
  const next = document.getElementById('next-stage');
  const previous = document.getElementById('previous-stage');

  function drawStars(){const dpr=Math.min(devicePixelRatio||1,2),ctx=starCanvas.getContext('2d');starCanvas.width=innerWidth*dpr;starCanvas.height=innerHeight*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,innerWidth,innerHeight);let seed=1995;for(let i=0;i<150;i+=1){seed=(seed*9301+49297)%233280;const x=seed/233280*innerWidth;seed=(seed*9301+49297)%233280;const y=seed/233280*innerHeight;const r=i%13===0?1.5:.65;ctx.fillStyle=i%17===0?'#5eeaff':'#9aacc0';ctx.globalAlpha=.25+(i%5)*.11;ctx.fillRect(x,y,r,r)}ctx.globalAlpha=1}
  function nodeCenters(){const rect=course.getBoundingClientRect();return stageButtons.map(button=>{const b=button.getBoundingClientRect();return{x:b.left-rect.left+b.width/2,y:b.top-rect.top+b.height/2}})}
  function drawCourse(){const dpr=Math.min(devicePixelRatio||1,2),rect=course.getBoundingClientRect(),ctx=lineCanvas.getContext('2d'),points=nodeCenters();lineCanvas.width=rect.width*dpr;lineCanvas.height=rect.height*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,rect.width,rect.height);ctx.strokeStyle='rgba(66,222,255,.38)';ctx.lineWidth=1.5;ctx.setLineDash([6,8]);ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();points.forEach((p,i)=>{ctx.beginPath();ctx.arc(p.x,p.y,10+i*1.3,0,Math.PI*2);ctx.strokeStyle=i<=current?'rgba(93,255,155,.45)':'rgba(66,222,255,.16)';ctx.stroke()})}
  function moveShip(index,instant=false){const point=nodeCenters()[index];if(!point)return;if(instant)ship.style.transition='none';ship.style.transform=`translate(${point.x-21}px,${point.y-58}px)`;if(instant)requestAnimationFrame(()=>ship.style.transition='');const laser=document.getElementById('laser');laser.style.left=`${point.x-1}px`;laser.style.top=`${point.y-65}px`;laser.classList.remove('fire');void laser.offsetWidth;laser.classList.add('fire');tone(260+index*75,.08)}
  function render(index,instant=false){current=Math.max(0,Math.min(stages.length-1,index));const stage=stages[current];document.getElementById('stage-code').textContent=stage.code;document.getElementById('stage-status').textContent=stage.status;document.getElementById('stage-title').textContent=stage.title;document.getElementById('stage-summary').textContent=stage.summary;document.getElementById('risk-meter').textContent=stage.risk;document.getElementById('gate-meter').textContent=`${current+1} / 6`;const evidence=document.getElementById('stage-evidence');evidence.innerHTML=stage.evidence.map(([label,text,state])=>`<div class="evidence-row ${state||''}"><span>${label}</span><p>${text}</p></div>`).join('');document.getElementById('judge-panel').hidden=!stage.judges;document.getElementById('human-stamp').hidden=!stage.human;stageButtons.forEach((button,i)=>{button.toggleAttribute('aria-current',i===current);if(i===current)button.setAttribute('aria-current','step');button.classList.toggle('complete',i<current)});previous.disabled=current===0;next.textContent=current===stages.length-1?'Mission complete ✓':`Fly to ${stageNames[current+1]} ▶`;next.disabled=current===stages.length-1;moveShip(current,instant);drawCourse()}
  function tone(frequency,duration){if(!document.getElementById('sound-toggle').matches('[aria-pressed="true"]'))return;audio=audio||new (window.AudioContext||window.webkitAudioContext)();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='square';osc.frequency.value=frequency;gain.gain.setValueAtTime(.035,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain).connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration)}
  document.getElementById('launch-mission').addEventListener('click',()=>{launched=true;document.getElementById('console').scrollIntoView({behavior:'smooth',block:'center'});render(0);tone(180,.15)});stageButtons.forEach(button=>button.addEventListener('click',()=>{launched=true;render(Number(button.dataset.stage))}));next.addEventListener('click',()=>render(current+1));previous.addEventListener('click',()=>render(current-1));document.getElementById('replay-mission').addEventListener('click',()=>render(0));document.querySelectorAll('[data-judge]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-judge]').forEach(item=>item.classList.toggle('active',item===button));document.getElementById('judge-finding').textContent=judgeFindings[button.dataset.judge];tone(520,.06)}));document.getElementById('sound-toggle').addEventListener('click',event=>{const on=event.currentTarget.getAttribute('aria-pressed')!=='true';event.currentTarget.setAttribute('aria-pressed',String(on));event.currentTarget.innerHTML=`<span>◖</span> SOUND ${on?'ON':'OFF'}`;if(on)tone(440,.08)});
  document.getElementById('year').textContent=new Date().getFullYear();
  window.addEventListener('resize',()=>{drawStars();drawCourse();moveShip(current,true)});
  drawStars();requestAnimationFrame(()=>render(0,true));
})();
