/* Countersign welcome screen, simulated sign-in and the guided tour. */
(() => {
  'use strict';
  const CS = window.CS;
  const { D, $, esc, S, save, contracts, asm, toast } = CS;

  /* ---------- welcome, choosing who to sign in as, and one sign-in page per person ---------- */
  let gate = 'intro', gateUser = null, gateErr = '';
  { const h = (location.hash || '').slice(1); if (!S.user && h.startsWith('login-') && CS.USERS[h.slice(6)]) { gate = 'login'; gateUser = h.slice(6); } }
  if (S.user && !CS.USERS[S.user]) S.user = null;
  if (S.user) S.role = CS.USERS[S.user].role;
  function renderGate() {
    const el = $('#gate'), app = $('#app');
    if (S.user && gate !== 'start') { el.hidden = true; el.innerHTML = ''; app.hidden = false; return; }
    app.hidden = true; el.hidden = false;
    const docs = contracts().reduce((s, c) => s + c.docs.length, 0), U = CS.USERS;
    if (gate === 'intro') el.innerHTML = `<div class="gate-in">
      <div class="brand"><b>Countersign</b></div>
      <h1>A contract is signed, filed and forgotten. Countersign reads it back to the person who needs to act.</h1>
      <div class="gate-cols">
        <div><div class="k">What happened</div><p>In October, Sahyadri Staffing billed ₹1,030 a day for warehouse associates. A scanned amendment says ₹1,005. The Excel tracker still said ₹980. The same invoice charged for travel the contract does not allow. Nobody noticed, and it was about to be paid.</p></div>
        <div><div class="k">What should have happened</div><p>The invoice should have been checked against the latest signed amendment before payment. The tracker should have changed the day the amendment was signed. Legal should have confirmed the rate once, for everyone.</p></div>
        <div><div class="k">How Countersign points it out</div><p>It reads every contract and amendment, including scans. It compares each invoice line with the price in force, shows the clause as proof, and puts one next step in front of the person who owns it.</p></div>
      </div>
      <p class="muted">A working prototype for ${esc(D.company)}, an invented Indian company. The sample holds ${contracts().length} suppliers and ${docs} documents. Every company, person and figure is made up.</p>
      <div class="btns"><button class="btn primary" data-act="gate-go" data-to="accounts">Choose who to sign in as</button></div></div>`;
    else if (gate === 'accounts') el.innerHTML = `<div class="gate-in">
      <div class="brand"><b>Countersign</b></div>
      <h1>Who are you signing in as?</h1>
      <p class="muted">Each team has its own sign-in and sees only its own tasks and queues. Admin sees everything.</p>
      <div class="accounts">${Object.keys(U).map(k => `<button class="choice" data-act="gate-pick" data-user="${k}"><span class="k">${U[k].label}</span><strong>${esc(U[k].name)}</strong><span>${esc(U[k].blurb)}</span></button>`).join('')}</div>
      <div class="btns"><button class="btn ghost" data-act="gate-go" data-to="intro">Back</button></div></div>`;
    else if (gate === 'login') { const u = U[gateUser]; el.innerHTML = `<div class="gate-in narrow">
      <div class="brand"><b>Countersign</b></div>
      <div><div class="k">${u.label} sign-in</div><h1>${esc(u.name)}</h1></div>
      <p class="muted">${esc(u.blurb)}</p>
      <p class="simnote">Simulated sign-in for the prototype. The username is <strong>${gateUser}</strong> and the password is <strong>test</strong>. This is not real security, and nothing you type is sent anywhere.</p>
      <form id="gateform" class="gate-form" autocomplete="off">
        <label for="g-user">Username</label><input id="g-user" type="text" autocomplete="off" autocapitalize="none" spellcheck="false">
        <label for="g-pass">Password</label><input id="g-pass" type="password" autocomplete="off">
        ${gateErr ? `<p class="err">${esc(gateErr)}</p>` : ''}
        <div class="btns"><button class="btn primary" type="submit">Sign in as ${u.label}</button><button class="btn ghost" type="button" data-act="gate-go" data-to="accounts">Choose someone else</button></div>
      </form></div>`; }
    else el.innerHTML = `<div class="gate-in narrow">
      <div class="brand"><b>Countersign</b></div>
      <h1>How would you like to start?</h1>
      <p class="muted">You are signed in as Admin. You see every queue and can act as any of the five role holders.</p>
      <div class="gate-choice">
        <button class="choice" data-act="gate-start" data-how="tour"><strong>Take the guided tour</strong><span>Four short chapters. Each step points at one part of the page and can do the action for you.</span></button>
        <button class="choice" data-act="gate-start" data-how="explore"><strong>Explore on my own</strong><span>Go straight to the to-do list. The tour stays available from the top bar.</span></button>
      </div></div>`;
    const first = el.querySelector('#g-user'); if (first) first.focus();
  }
  function signOut() { endTour(); S.user = null; S.role = 'all'; gate = 'accounts'; gateErr = ''; save(); renderGate(); if (location.hash !== '#overview') location.hash = '#overview'; window.scrollTo(0, 0); }

  /* ---------- the tour ---------- */
  const CH = [
    { title: 'A wrong rate, caught before it is paid', steps: [
      { go: '#overview', role: 'legal', sel: '[data-case="A"]', text: 'Each case gets one card, and the card shows only the step that is due now. This one belongs to Legal: a rate in a scanned amendment needs checking before anyone acts on it.' },
      { go: '#item-a', role: 'legal', sel: '#proof', text: 'Open a case and the proof sits beside the task: the clauses, the invoice lines and the working. The role check further down was done by AI and is kept as a record.' },
      { go: '#item-a', role: 'legal', sel: '[data-step="A1"]', text: 'Legal confirms the rate. Until then every later step reads "Locked: waiting for Legal to check the rate".', doIt: { label: 'Confirm the rate for me', fn: 'confirmTerm', arg: 'C-002|Bill rates' } },
      { go: '#item-a', role: 'finance', sel: '[data-step="A2"]', text: 'The case now moves to Finance. The AI found 22 days billed at the wrong role.', doIt: { label: 'Accept the role check for me', fn: 'step', arg: 'A2' } },
      { go: '#item-a', role: 'finance', sel: '[data-step="A3"]', text: 'Finance holds only the disputed amount and sends the dispute. The business owner is told, and a side task about the travel charge is waiting for him.', doIt: { label: 'Send the dispute for me', fn: 'dispute', arg: 'SSS/26-27/0412' } }
    ] },
    { title: 'A renewal decided in time', steps: [
      { go: '#item-b', role: 'owner', sel: '#leadtime', text: 'The notice has to arrive by 30 Nov. Working back through the courier time and Legal\'s approval gives each person a date.' },
      { go: '#item-b', role: 'owner', sel: '[data-step="B1"]', text: 'The business owner chooses. Renewing as quoted or not renewing closes or shortens the case with no saving. Only a renegotiation counts as value.', doIt: { label: 'Choose "Renegotiate" for me', fn: 'decide', arg: 'C-001|renegotiate' } },
      { go: '#item-b', role: 'procurement', sel: '[data-step="B2"]', text: 'Procurement records what was agreed. The yearly saving is measured against the supplier\'s quote.', doIt: { label: 'Record 380 seats at US$54 for me', fn: 'outcome', arg: 'B' } }
    ] },
    { title: 'A late-delivery credit, claimed before it lapses', steps: [
      { go: '#item-c', role: 'owner', sel: '#proof', text: 'Deccan missed its on-time target and blames flooding. The contract only leaves such delays out if written evidence arrives within 5 days. None did.' },
      { go: '#item-c', role: 'owner', sel: '[data-step="C1"]', text: 'So the default is to claim the full credit. Accepting force majeure is still the owner\'s call, and it lowers the credit.', doIt: { label: 'Claim the full credit for me', fn: 'fm', arg: '0' } },
      { go: '#item-c', role: 'owner', sel: '[data-step="C2"]', text: 'The claim has to go before the 60-day window closes.', doIt: { label: 'Send the claim for me', fn: 'claim', arg: 'C-003|On-time delivery|2026-09' } }
    ] },
    { title: 'Where the value shows up', steps: [
      { go: '#value', sel: '#value-tiles', text: 'One-off and yearly amounts are different kinds of money. They sit side by side and are never added together. "Confirmed" means the case reached its last stage.' },
      { go: '#value', sel: '#value-apart', text: 'Repeat overcharges prevented and GST are real, but they are not money recovered, so they are kept apart.' },
      { go: '#contracts', sel: '#tracker', text: 'The old Excel tracker is checked against the contracts. The Sahyadri row waits until Legal has checked Amendment No. 2.', doIt: { label: 'Update the tracker for me', fn: 'tracker', arg: '' } },
      { go: '#agent', sel: '.pol', text: 'Last, the agent can take the routine steps itself within these rules. It asks before anything binding and never decides a renewal.' }
    ] }
  ];
  const T = { on: false, ch: 0, i: 0, note: '', scroll: false };
  const step = () => CH[T.ch].steps[T.i];
  function paintDock() {
    const dock = $('#tourdock'); document.body.classList.toggle('touring', T.on);
    if (!T.on) { dock.hidden = true; return; }
    const st = step(), ch = CH[T.ch], last = T.i === ch.steps.length - 1, lastCh = T.ch === CH.length - 1;
    dock.hidden = false;
    dock.innerHTML = `<div class="td-top"><span class="k">Chapter ${T.ch + 1} of ${CH.length} · step ${T.i + 1} of ${ch.steps.length}</span><span class="btns"><button class="btn xs" data-act="tour-chapters">Chapters</button><button class="btn xs" data-act="tour-end">End tour</button></span></div>
      <strong>${esc(ch.title)}</strong><p>${esc(st.text)}</p>${T.note ? `<p class="td-note">${esc(T.note)}</p>` : ''}
      <div class="btns">${T.ch || T.i ? '<button class="btn sm" data-act="tour-back">Back</button>' : ''}${st.doIt ? `<button class="btn sm" data-act="tour-do">${esc(st.doIt.label)}</button>` : ''}<button class="btn sm primary" data-act="tour-next">${last ? (lastCh ? 'Finish' : 'Next chapter') : 'Next'}</button></div>`;
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
  function endTour() { T.on = false; T.note = ''; paintDock(); ring(); closePick(); $('#tourleave').hidden = true; }
  function openPick() { const p = $('#tourpick'); p.hidden = false;
    p.innerHTML = `<div class="pick" role="dialog" aria-label="Tour chapters"><div class="panel-head"><h2>Guided tour</h2><button class="btn sm" data-act="tour-pick-close">Close</button></div><p class="muted">Pick a chapter. Each takes about a minute.</p>
      ${CH.map((c, i) => `<button class="choice" data-act="tour-pick" data-i="${i}"><strong>${i + 1}. ${esc(c.title)}</strong><span>${c.steps.length} steps</span></button>`).join('')}</div>`; }
  function closePick() { const p = $('#tourpick'); p.hidden = true; p.innerHTML = ''; }
  let leaveTo = null;

  document.addEventListener('click', e => {
    /* A top-bar tab chosen mid-tour asks first. */
    const tab = e.target.closest('#tabs a');
    if (tab && T.on) { e.preventDefault(); leaveTo = tab.getAttribute('href'); $('#tourleave').hidden = false; return; }
    const el = e.target.closest('[data-act]'); if (!el) return; const act = el.dataset.act;
    switch (act) {
      case 'gate-go': gate = el.dataset.to; gateErr = ''; renderGate(); break;
      case 'gate-pick': gateUser = el.dataset.user; gate = 'login'; gateErr = ''; location.hash = '#login-' + gateUser; renderGate(); break;
      case 'gate-start': gate = 'intro'; renderGate(); if (location.hash !== '#overview') location.hash = '#overview'; CS.render(); window.scrollTo(0, 0); if (el.dataset.how === 'tour') openPick(); break;
      case 'signout': signOut(); break;
      case 'tour-open': case 'tour-chapters': if (CS.isAdmin()) openPick(); break;
      case 'tour-pick-close': closePick(); break;
      case 'tour-pick': startTour(Number(el.dataset.i)); break;
      case 'tour-end': endTour(); break;
      case 'tour-back': T.note = ''; if (T.i > 0) T.i--; else if (T.ch > 0) { T.ch--; T.i = CH[T.ch].steps.length - 1; } show(); break;
      case 'tour-next': T.note = '';
        if (T.i < CH[T.ch].steps.length - 1) { T.i++; show(); } else if (T.ch < CH.length - 1) { T.ch++; T.i = 0; show(); } else { endTour(); toast('That is the end of the tour.'); CS.render(); } break;
      case 'tour-do': { const dd = step().doIt, r = CS.store[dd.fn](dd.arg); T.note = r === false ? 'Already done.' : r ? 'Done. Look at how the page changed.' : ''; save(); T.scroll = true; paintDock(); CS.render(); break; }
      case 'tour-stay': $('#tourleave').hidden = true; leaveTo = null; break;
      case 'tour-leave': { const to = leaveTo; leaveTo = null; endTour(); if (to) location.hash = to; break; }
    }
  });
  document.addEventListener('submit', e => {
    if (e.target.id !== 'gateform') return; e.preventDefault();
    const u = $('#g-user').value.trim().toLowerCase(), p = $('#g-pass').value;
    if (u === gateUser && p === 'test') {
      S.user = gateUser; S.role = CS.USERS[gateUser].role; gateErr = ''; save();
      if (gateUser === 'admin') gate = 'start'; else { gate = 'intro'; renderGate(); location.hash = '#overview'; CS.render(); window.scrollTo(0, 0); return; }
    } else gateErr = `That did not match. The username is ${gateUser} and the password is test.`;
    renderGate();
  });

  Object.assign(CS, { renderGate, tourRing: ring, tourOn: () => T.on });
})();
