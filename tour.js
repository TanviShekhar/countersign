/* Countersign welcome screen, one-click sign-in and the guided tour. */
(() => {
  'use strict';
  const CS = window.CS;
  const { D, $, esc, S, save, contracts, ROLE1, toast } = CS;

  /* ---------- welcome and sign-in ---------- */
  let gate = 'intro', gateUser = 'admin', gateErr = '';
  { const h = (location.hash || '').slice(1); if (!S.user && h.startsWith('login-') && CS.USERS[h.slice(6)]) { gate = 'signin'; gateUser = h.slice(6); } }
  if (S.user && !CS.USERS[S.user]) S.user = null;
  if (S.user) S.role = CS.USERS[S.user].role;
  const whoLabel = k => CS.USERS[k].name === CS.USERS[k].label ? CS.USERS[k].name : `${CS.USERS[k].name} (${CS.USERS[k].label})`;
  function renderGate() {
    const el = $('#gate'), app = $('#app');
    if (S.user && gate !== 'start') { el.hidden = true; el.innerHTML = ''; app.hidden = false; return; }
    app.hidden = true; el.hidden = false;
    const docs = contracts().reduce((s, c) => s + c.docs.length, 0), U = CS.USERS;
    if (gate === 'intro') el.innerHTML = `<div class="gate-in wide">
      <div class="gate-main">
        <div class="brand"><b>Countersign</b></div>
        <h1>A contract is signed, filed and forgotten. Countersign reads it back to the person who needs to act.</h1>
        <p class="muted">The idea in one example.</p>
        <div class="gate-cols">
          <div><div class="k">What happened</div><ul><li>A staffing supplier billed ₹1,030 a day.</li><li>A signed amendment says ₹1,005 since 1 October.</li><li>The Excel tracker still said ₹980, so nobody noticed.</li></ul></div>
          <div><div class="k">What should have happened</div><ul><li>Finance checks the invoice against the latest amendment.</li><li>The overcharge is held before payment.</li><li>It comes back as a credit note, and the tracker is corrected.</li></ul></div>
          <div><div class="k">How Countersign points it out</div><ul><li>Reads every contract and amendment, scans included.</li><li>Checks each invoice line against the price in force.</li><li>Shows the clause as proof.</li><li>Puts one next step in front of the person who owns it.</li></ul></div>
        </div>
        <div class="btns"><button class="btn primary" data-act="gate-go" data-to="signin">Continue</button></div>
      </div>
      <aside class="gate-note"><h2>Before you explore</h2>
        <p><strong>A prototype for a case study.</strong> ${esc(D.company)} and its ${contracts().length} suppliers, ${docs} documents, people and figures are all invented. Nothing is sent and no money moves.</p>
        <p><strong>The sign-in is simulated.</strong> It shows what each team would see. It is not security.</p>
        <p>Dashed yellow tags like ${CS.asm('A7')} mark an <strong>assumption</strong>. All ten are on the Case analysis tab.</p>
        <p>Labels like ${CS.src('calc')} or ${CS.src('sample')} say where a figure came from.</p></aside></div>`;
    else if (gate === 'signin') el.innerHTML = `<div class="gate-in wide">
      <div class="gate-main narrowcol">
        <div class="brand"><b>Countersign</b></div>
        <h1>Sign in</h1>
        <p class="muted">A simulated sign-in, to show where it would sit. In a real rollout people sign in with their company account and see only their own work. The details are filled in for you.</p>
        <form id="gateform" class="gate-form" autocomplete="off">
          <label for="g-who">Sign in as</label><select id="g-who">${Object.keys(U).map(k => `<option value="${k}"${k === gateUser ? ' selected' : ''}>${esc(whoLabel(k))}</option>`).join('')}</select>
          <label for="g-user">Username</label><input id="g-user" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" value="${gateUser}">
          <label for="g-pass">Password</label><input id="g-pass" type="password" autocomplete="off" value="test">
          ${gateErr ? `<p class="err">${esc(gateErr)}</p>` : ''}
          <div class="btns"><button class="btn primary" type="submit">Sign in</button><button class="btn ghost" type="button" data-act="gate-go" data-to="intro">Back</button></div>
        </form>
      </div>
      <aside class="gate-note warm"><h2>One issue, several people</h2>
        <p>A single contract problem passes through several people. Each sees only their own tasks and queues. Admin sees everything and can act as anyone.</p>
        ${Object.keys(U).map(k => `<p><strong>${esc(whoLabel(k))}</strong><br>${esc(U[k].blurb)}</p>`).join('')}</aside></div>`;
    else el.innerHTML = `<div class="gate-in">
      <div class="brand"><b>Countersign</b></div>
      <h1>How do you want to start?</h1>
      <div class="gate-cols">
        <button class="choice rec" data-act="gate-start" data-how="tour"><span class="k">Recommended</span><strong>Walk me through it</strong><span>A guided tour that follows one case through every person and points at what to look at.</span></button>
        <button class="choice" data-act="gate-start" data-how="explore"><strong>Explore on my own</strong><span>Go straight to the to-do page. The tour stays available from the top bar.</span></button>
        <button class="choice" data-act="gate-start" data-how="case"><strong>Read the case analysis first</strong><span>Why this stage, who it is for, the problem and how success is measured.</span></button>
      </div></div>`;
  }
  function enter() { gate = 'intro'; renderGate(); if (location.hash !== '#overview') location.hash = '#overview'; CS.render(); window.scrollTo(0, 0); }
  function signOut() { endTour(); S.user = null; S.role = 'all'; gate = 'signin'; gateErr = ''; save(); renderGate(); if (location.hash !== '#overview') location.hash = '#overview'; window.scrollTo(0, 0); }

  /* ---------- the tour: each chapter follows one case, switching who you are as it goes ---------- */
  const CH = [
    { title: 'Invoice', blurb: 'Find an overcharge, prove it, recover it, and stop it repeating. About 3 minutes.',
      story: { happened: ['Sahyadri Staffing billed ₹1,030 a day.', 'Amendment No. 2 set the rate at ₹1,005 from 1 October.', 'The invoice did not follow it.'], should: ['Finance pays ₹1,005.', 'The difference is held before payment.', 'The tracker is corrected so it does not repeat.'], how: ['Reads the contract and both amendments.', 'Works out which rate applies.', 'Checks every invoice line against it.', 'Sends each step to the person who can act.'] },
      steps: [
        { go: '#overview', role: 'legal', sel: '[data-case="A"]', text: 'Every case is one card with one next step. This one is with Legal, because the rate was read from a scanned amendment and nobody has checked it yet.' },
        { go: '#item-a', role: 'legal', sel: '#happened', text: 'A case page reads in three parts: what happened, the proof, and what to do.' },
        { go: '#item-a', role: 'legal', sel: '#proof', text: 'The proof: the clauses, each invoice line against the contract price, and a recorded AI check of the timesheets.' },
        { go: '#item-a', role: 'legal', sel: '[data-step="A1"]', text: 'Legal confirms the rate once, for everyone. Until then every later step is locked.', doIt: { label: 'Confirm the rate for me', fn: 'confirmTerm', arg: 'C-002|Bill rates' } },
        { go: '#item-a', role: 'finance', sel: '[data-step="A2"]', text: 'The case moves to Finance. The AI found 22 days billed at the wrong role.', doIt: { label: 'Accept the role check for me', fn: 'step', arg: 'A2' } },
        { go: '#item-a', role: 'finance', sel: '[data-step="A3"]', text: 'Finance holds only the disputed amount, pays the rest on time, and sends the dispute.', doIt: { label: 'Send the dispute for me', fn: 'dispute', arg: 'SSS/26-27/0412' } },
        { go: '#item-a', role: 'owner', sel: '[data-step="A4"]', text: 'The business owner gets a side task: confirm that nobody approved the travel charge.', doIt: { label: 'Confirm it for me', fn: 'step', arg: 'A4' } },
        { go: '#item-a', role: 'supplier', sel: '[data-step="A5"]', text: 'The supplier\'s billing contact agrees and issues a credit note.', doIt: { label: 'Issue the credit note for me', fn: 'step', arg: 'A5' } },
        { go: '#item-a', role: 'finance', sel: '[data-step="A6"]', text: 'Finance confirms the credit note arrived. Only now does the money count as confirmed.', doIt: { label: 'Confirm it for me', fn: 'confirm', arg: 'A' } },
        { go: '#item-a', role: 'procurement', sel: '[data-step="A7"]', text: 'Procurement corrects the tracker, so the wrong rate is fixed at its source.', doIt: { label: 'Correct the tracker for me', fn: 'fixRow', arg: 'C-002' } },
        { go: '#item-a', role: 'finance', sel: '[data-step="A8"]', text: 'The case closes only when the next invoice comes in at the right rate.', doIt: { label: 'Mark November as correct for me', fn: 'step', arg: 'A8' } },
        { go: '#value', role: 'all', sel: '#value-tiles', text: 'The confirmed amount now shows on the Value page. One-off and yearly amounts sit side by side and are never added together.' }
      ] },
    { title: 'Renewal', blurb: 'A renewal with a notice deadline, worked back into a date for each person.',
      story: { happened: ['Brightlane renews itself for 12 months.', 'Notice must arrive in Austin by 30 Nov.', '149 of the 520 seats are unused.'], should: ['The owner decides before the window closes.', 'Unused seats are cut.', 'The tracker shows the new terms.'], how: ['Works the deadline back through courier and approval time.', 'Shows usage beside the quote.', 'Counts value only if terms are renegotiated.'] },
      steps: [
        { go: '#item-b', role: 'owner', sel: '#leadtime', text: 'The notice has to arrive by 30 Nov. Working back through courier time and Legal\'s approval gives each person a date.' },
        { go: '#item-b', role: 'owner', sel: '[data-step="B1"]', text: 'The business owner chooses. Renewing as quoted or not renewing counts no saving. Only a renegotiation counts as value.', doIt: { label: 'Choose "Renegotiate" for me', fn: 'decide', arg: 'C-001|renegotiate' } },
        { go: '#item-b', role: 'procurement', sel: '[data-step="B2"]', text: 'Procurement records what was agreed. The yearly saving is measured against the supplier\'s quote.', doIt: { label: 'Record 380 seats at US$54 for me', fn: 'outcome', arg: 'B' } },
        { go: '#item-b', role: 'owner', sel: '[data-step="B3"]', text: 'The owner confirms the new order form is signed.', doIt: { label: 'Confirm it for me', fn: 'confirm', arg: 'B' } },
        { go: '#item-b', role: 'procurement', sel: '[data-step="B9"]', text: 'The tracker still shows the old seats, price and notice period. Procurement corrects it.', doIt: { label: 'Correct the tracker for me', fn: 'fixRow', arg: 'C-001' } },
        { go: '#value', role: 'all', sel: '#value-tiles', text: 'The yearly saving now shows as confirmed.' }
      ] },
    { title: 'Service credit', blurb: 'A late-delivery month and the credit the contract promises.',
      story: { happened: ['Deccan delivered 93.4% on time in September.', 'The target is 96%.', 'Deccan blames flooding but sent no evidence.'], should: ['The credit is claimed within 60 days.', 'Force majeure counts only with evidence in 5 days.'], how: ['Works out the credit from the clause.', 'Shows both positions and what each is worth.', 'Tracks the claim deadline.'] },
      steps: [
        { go: '#item-c', role: 'owner', sel: '#proof', text: 'The contract leaves out delays beyond the carrier\'s control only if written evidence arrives within 5 days. None did.' },
        { go: '#item-c', role: 'owner', sel: '[data-step="C1"]', text: 'So the default is to claim the full credit. Accepting force majeure is still the owner\'s call, and it lowers the credit.', doIt: { label: 'Claim the full credit for me', fn: 'fm', arg: '0' } },
        { go: '#item-c', role: 'owner', sel: '[data-step="C2"]', text: 'The claim has to go before the 60-day window closes.', doIt: { label: 'Send the claim for me', fn: 'claim', arg: 'C-003|On-time delivery|2026-09' } },
        { go: '#item-c', role: 'owner', sel: '[data-step="C3"]', text: 'The credit shows on the next invoice and is confirmed.', doIt: { label: 'Confirm it for me', fn: 'confirm', arg: 'C' } },
        { go: '#item-c', role: 'procurement', sel: '[data-step="C4"]', text: 'Procurement agrees with Deccan how evidence will be sent next time, so the same argument does not come back.', doIt: { label: 'Mark it agreed for me', fn: 'step', arg: 'C4' } }
      ] },
    { title: 'One source of truth', blurb: 'The tracker, scanned contracts, the agent and the assumptions.',
      steps: [
        { go: '#contracts', role: 'all', sel: '#tracker', text: 'The old Excel tracker is checked against the contracts. Wrong cells are marked, and one click corrects the rows that are ready.', doIt: { label: 'Update the tracker for me', fn: 'tracker', arg: '' } },
        { go: '#add', role: 'all', sel: '#view .panel', text: 'New contracts come in as text, a PDF or a scan. Scans are read by AI, the terms are extracted with quotes, and Legal confirms them.' },
        { go: '#agent', role: 'all', sel: '#sweep', text: 'The agent works through the open items. It can decide with built-in rules or with Claude, and shows what it will do before it runs.' },
        { go: '#agent', role: 'all', sel: '.pol', text: 'These rules set what the agent may do alone, what needs approval, and what it must never do.' },
        { go: '#case', role: 'all', sel: '#assumptions', text: 'Every assumption is listed here with its tag. The rest of this tab holds the reasoning behind the prototype.' }
      ] }
  ];
  const T = { on: false, ch: 0, i: 0, note: '', scroll: false };
  const step = () => CH[T.ch].steps[T.i];
  const list = (title, items) => `<div class="story"><div class="k">${title}</div><ul>${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
  function paintDock() {
    const dock = $('#tourdock'); document.body.classList.toggle('touring', T.on);
    if (!T.on) { dock.hidden = true; return; }
    const st = step(), ch = CH[T.ch], n = ch.steps.length, last = T.i === n - 1, lastCh = T.ch === CH.length - 1;
    dock.hidden = false;
    dock.innerHTML = `<div class="td-top"><span class="k">Guided tour: ${esc(ch.title)}</span><span class="btns"><button class="btn xs" data-act="tour-chapters">Chapters</button><button class="btn xs" data-act="tour-end">End tour</button></span></div>
      <div class="td-prog" aria-hidden="true">${ch.steps.map((s, i) => `<i class="${i <= T.i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="muted sm">Step ${T.i + 1} of ${n}${st.role && st.role !== 'all' ? ` · you are now ${esc(D.people[st.role])}, ${ROLE1[st.role]}` : ''}</div>
      ${T.i === 0 && ch.story ? `<strong>The story</strong>${list('What happened', ch.story.happened)}${list('What should have happened', ch.story.should)}${list('How Countersign points it out', ch.story.how)}` : ''}
      <p class="td-text">${esc(st.text)}</p>${T.note ? `<p class="td-note">${esc(T.note)}</p>` : ''}
      <div class="btns td-btns">${T.ch || T.i ? '<button class="btn sm" data-act="tour-back">Back</button>' : ''}${st.doIt ? `<button class="btn sm" data-act="tour-do">${esc(st.doIt.label)}</button>` : ''}<button class="btn sm primary" data-act="tour-next">${last ? (lastCh ? 'Finish' : 'Next chapter') : 'Next'}</button></div>`;
  }
  function ring() {
    document.querySelectorAll('.ring').forEach(e => e.classList.remove('ring'));
    if (!T.on) return;
    const el = document.querySelector(step().sel); if (!el) return;
    el.classList.add('ring'); if (T.scroll) { T.scroll = false; el.scrollIntoView({ block: 'center', behavior: 'auto' }); }
  }
  function show() {
    const st = step(); if (st.role) S.role = st.role; T.scroll = true; paintDock();
    if (location.hash !== st.go) location.hash = st.go; else CS.render();
  }
  function startTour(ch) { T.on = true; T.ch = ch || 0; T.i = 0; T.note = ''; closePick(); show(); }
  function endTour() { const was = T.on; T.on = false; T.note = ''; paintDock(); ring(); closePick(); $('#tourleave').hidden = true; if (was && CS.isAdmin()) { S.role = 'all'; CS.render(); } }
  function openPick() { const p = $('#tourpick'); p.hidden = false;
    p.innerHTML = `<div class="pick" role="dialog" aria-label="Tour chapters"><div class="panel-head"><h2>Take the tour</h2><button class="btn sm" data-act="tour-pick-close">Not now</button></div><p class="muted">Pick a chapter. Each one follows a real case step by step, switches who you are as it goes, and points at what to look at.</p>
      <div class="pickgrid">${CH.map((c, i) => `<button class="choice" data-act="tour-pick" data-i="${i}"><strong>${i + 1}. ${esc(c.title)}</strong><span>${esc(c.blurb)}</span></button>`).join('')}</div></div>`; }
  function closePick() { const p = $('#tourpick'); p.hidden = true; p.innerHTML = ''; }
  let leaveTo = null;

  document.addEventListener('click', e => {
    /* A top-bar tab chosen mid-tour asks first. */
    const tab = e.target.closest('#tabs a');
    if (tab && T.on) { e.preventDefault(); leaveTo = tab.getAttribute('href'); $('#tourleave').hidden = false; return; }
    const el = e.target.closest('[data-act]'); if (!el) return; const act = el.dataset.act;
    switch (act) {
      case 'gate-go': gate = el.dataset.to; gateErr = ''; renderGate(); break;
      case 'gate-start': { const how = el.dataset.how; gate = 'intro'; renderGate(); const to = how === 'case' ? '#case' : '#overview'; if (location.hash !== to) location.hash = to; CS.render(); window.scrollTo(0, 0); if (how === 'tour') openPick(); break; }
      case 'signout': signOut(); break;
      case 'tour-open': case 'tour-chapters': if (CS.isAdmin()) openPick(); break;
      case 'tour-pick-close': closePick(); break;
      case 'tour-pick': startTour(Number(el.dataset.i)); break;
      case 'tour-end': endTour(); break;
      case 'tour-back': T.note = ''; if (T.i > 0) T.i--; else if (T.ch > 0) { T.ch--; T.i = CH[T.ch].steps.length - 1; } show(); break;
      case 'tour-next': T.note = '';
        if (T.i < CH[T.ch].steps.length - 1) { T.i++; show(); } else if (T.ch < CH.length - 1) { T.ch++; T.i = 0; show(); } else { endTour(); toast('That is the end of the tour.'); } break;
      case 'tour-do': { const dd = step().doIt, tgt = document.querySelector(step().sel);
        if (tgt && (tgt.classList.contains('locked') || tgt.classList.contains('later'))) { T.note = 'Do the step before this one first. Go back and use its "for me" button.'; paintDock(); break; }
        const r = CS.store[dd.fn](dd.arg); T.note = r === false ? 'Already done.' : r ? 'Done. Look at how the page changed.' : ''; save(); T.scroll = true; paintDock(); CS.render(); break; }
      case 'tour-stay': $('#tourleave').hidden = true; leaveTo = null; break;
      case 'tour-leave': { const to = leaveTo; leaveTo = null; endTour(); if (to) location.hash = to; break; }
    }
  });
  document.addEventListener('change', e => {
    if (e.target.id !== 'g-who') return;
    gateUser = e.target.value; gateErr = ''; $('#g-user').value = gateUser; $('#g-pass').value = 'test';
    try { history.replaceState(null, '', '#login-' + gateUser); } catch (x) { /* the address is a convenience only */ }
  });
  document.addEventListener('submit', e => {
    if (e.target.id !== 'gateform') return; e.preventDefault();
    const u = $('#g-user').value.trim().toLowerCase(), p = $('#g-pass').value;
    if (u === gateUser && p === 'test') {
      S.user = gateUser; S.role = CS.USERS[gateUser].role; gateErr = ''; save();
      if (gateUser === 'admin') { gate = 'start'; renderGate(); } else enter();
      return;
    }
    gateErr = `That did not match. For ${whoLabel(gateUser)} the username is ${gateUser} and the password is test.`;
    renderGate();
  });

  Object.assign(CS, { renderGate, tourRing: ring, tourOn: () => T.on, tourEnd: endTour });
})();
