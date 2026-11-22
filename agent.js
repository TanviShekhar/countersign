/* Countersign agent: the rules, the actions it may take, approvals, the activity log, and the case tab. */
(() => {
  'use strict';
  const CS = window.CS;
  const { D, $, esc, isIso, diff, fmtD, plural, cm, toInr, inr, inrC, S, save, uid, contracts, byId, ownerOf, ROLES, ROLE1, who, addLog, addTask,
    ai, aiCopy, aiGone, needAi, renewal, invoiceChecks, paymentRows, cLink, isVerified, clauseConfirmed, findClause, attention, northStar, pill, dueChip, aiTag, toast } = CS;

  /* What the agent can do. "def" is the starting rule; "askOnly" actions can never be automatic. */
  const ACT = {
    hold_invoice: { label: 'Hold the disputed part of an invoice', done: 'Payment held', approver: 'finance', money: true, def: 'auto', limit: 500000, undo: true, why: 'Can be released at any time, and it protects money while the question is open.' },
    claim_credit: { label: 'File a service credit claim', done: 'Claim filed', approver: 'finance', money: true, def: 'auto', limit: 500000, sends: true, why: 'The contract fixes the amount, and the right is lost when the claim window closes.' },
    chase_document: { label: 'Chase a supplier for a missing compliance document', done: 'Supplier chased', approver: 'procurement', def: 'auto', sends: true, why: 'A routine request with no commercial effect.' },
    remind_owner: { label: 'Remind a contract owner about a deadline', done: 'Owner reminded', approver: 'procurement', def: 'auto', undo: true, why: 'Internal only.' },
    chase_rebate: { label: 'Ask a supplier for an overdue rebate', done: 'Rebate chased', approver: 'finance', money: true, def: 'ask', limit: 500000, sends: true, why: 'A demand for money should be seen by Finance first.' },
    dispute_invoice: { label: 'Send an invoice dispute to the supplier', done: 'Dispute sent', approver: 'finance', money: true, def: 'ask', limit: 500000, sends: true, why: 'It affects the supplier relationship, so Finance approves the wording.' },
    assign_owner: { label: 'Assign an interim contract owner', done: 'Interim owner assigned', approver: 'procurement', def: 'ask', undo: true, why: 'Decisions about people stay with people.' },
    send_notice: { label: 'Send a non-renewal notice', done: 'Notice sent', approver: 'legal', def: 'ask', askOnly: true, sends: true, why: 'Binding and hard to reverse. Always needs Legal, and only after the owner has decided.' },
    escalate: { label: 'Hand the item to a person', done: 'Escalated', internal: true }
  };
  const policy = k => Object.assign({ mode: ACT[k].def, limit: ACT[k].limit || 0 }, S.policy[k] || {});
  const pendingFor = (itemId, action) => S.approvals.some(a => a.status === 'pending' && a.itemId === itemId && a.action === action);
  const refuse = text => ({ status: 'refused', text });
  const snapshot = (item, action, p) => ({ itemId: item.id, action, cid: item.c ? item.c.id : null, supplier: item.c ? item.c.supplier : '', inv: item.inv, claimKey: item.claimKey, proposed: item.proposed || null,
    itemRole: item.role, title: item.title, amount: item.amount || 0, due: item.left != null ? CS.addDays(S.asOf, item.left) : null, subject: p.subject || '', message: p.message || '', reason: p.reason || '' });

  /* Carries out one action. Everything it changes is written to the activity log. */
  function execute(p, by, note) {
    const A = ACT[p.action], amt = p.amount ? inrC(p.amount) : ''; let undo = null, msg = null, text = '';
    if (A.sends) { msg = { id: uid('msg'), on: S.asOf, to: `${p.supplier} (supplier)`, subject: p.subject || A.label, body: p.message, cid: p.cid }; S.outbox.unshift(msg); }
    switch (p.action) {
      case 'hold_invoice': S.held[p.inv] = S.asOf; undo = { k: 'held', inv: p.inv }; text = `put ${amt} of invoice ${p.inv} from ${p.supplier} on hold`;
        addTask({ role: 'owner', cid: p.cid, from: by, title: `Payment to ${p.supplier} is partly on hold`, detail: `Invoice ${p.inv} is above contract prices. Finance is disputing the difference. Tell your supplier contact if they ask.` }); break;
      case 'dispute_invoice': S.disputed[p.inv] = S.asOf; if (!S.held[p.inv]) S.held[p.inv] = S.asOf; text = `sent a dispute for invoice ${p.inv} to ${p.supplier}`; break;
      case 'claim_credit': S.claims[p.claimKey] = S.asOf; text = `filed a service credit claim of ${amt} with ${p.supplier}`; break;
      case 'chase_document': text = `asked ${p.supplier} for the missing document`; break;
      case 'chase_rebate': text = `asked ${p.supplier} for the overdue rebate of ${amt}`; break;
      case 'remind_owner': { const c = p.cid ? byId(p.cid) : null, ow = c ? ownerOf(c) : {}, gone = !ow.name || ow.left;
        const t = addTask({ role: gone ? 'procurement' : (p.itemRole === 'procurement' ? 'procurement' : 'owner'), cid: p.cid, from: by, due: p.due, title: p.title, detail: p.message || p.reason });
        undo = { k: 'task', id: t.id }; text = gone ? `sent a reminder to Procurement, because the ${p.supplier} contract has no owner` : `reminded ${ow.name} about the ${p.supplier} contract`; break; }
      case 'assign_owner': S.owners[p.cid] = { name: p.proposed.name, team: p.proposed.team, interim: true }; undo = { k: 'owner', cid: p.cid }; text = `made ${p.proposed.name} interim owner of the ${p.supplier} contract`; break;
      case 'send_notice': S.noticeSent[p.cid] = S.asOf; text = `sent the non-renewal notice to ${p.supplier}`; break;
    }
    (S.done[p.itemId] = S.done[p.itemId] || {})[p.action] = { on: S.asOf, by };
    if (undo) { undo.itemId = p.itemId; undo.action = p.action; }
    addLog({ who: by, cid: p.cid, role: p.itemRole, text: text + (note ? ` (${note})` : '') + '.', reason: p.reason, undo: A.undo ? undo : null, msg: msg ? msg.id : null, auto: by === 'Agent' });
    save();
  }
  function queue(p, from, note) { S.approvals.unshift(Object.assign({ id: uid('ap'), role: ACT[p.action].approver, from, on: S.asOf, status: 'pending', note: note || '' }, p)); save(); }

  /* The single gate every action passes through, whether the agent or a person asks for it. */
  function applyAction(item, action, p, by) {
    const A = ACT[action]; p = p || {};
    if (!A || A.internal) return refuse(`"${action}" is not an action you can take.`);
    if (!(item.acts || []).includes(action)) return refuse(`${action} does not apply to this item. Allowed here: ${(item.acts || []).join(', ') || 'escalate only'}.`);
    if (S.done[item.id] && S.done[item.id][action]) return refuse('That has already been done for this item.');
    if (pendingFor(item.id, action)) return refuse('That is already waiting for approval.');
    if (action === 'assign_owner' && !item.proposed) return refuse('There is nobody on record to propose. Escalate to procurement.');
    if (A.sends && !String(p.message || '').trim()) return refuse('This action sends a message. Call it again with the full message text.');
    const snap = snapshot(item, action, p);
    if (by === 'agent') {
      const pol = policy(action);
      if (pol.mode === 'off') return refuse('The company rules have this action switched off. Leave the item for a person.');
      if (item.clause && item.c && !clauseConfirmed(item.c, item.clause)) return refuse(`The contract term this relies on (§${item.clause}) was read by AI and has not been confirmed by a person. Do not act on it. Escalate the item to legal so the term can be confirmed.`);
      const over = A.money && snap.amount > pol.limit;
      if (pol.mode === 'auto' && !A.askOnly && !over) { execute(snap, 'Agent'); return { status: 'done', text: `Done: ${A.done.toLowerCase()}.` }; }
      queue(snap, 'Agent', over && pol.mode === 'auto' ? `above the ${inrC(pol.limit)} limit for acting alone` : '');
      return { status: 'queued', text: `Queued for ${ROLE1[A.approver]} to approve${over && pol.mode === 'auto' ? ' because the amount is above the limit' : ''}.` };
    }
    if (S.role === A.approver) { execute(snap, who()); return { status: 'done', text: `${A.done}.` }; }
    queue(snap, who(), '');
    return { status: 'queued', text: `Sent to ${ROLE1[A.approver]} for approval.` };
  }
  function escalate(item, role, reason, by) {
    if (!CS.STAFF.includes(role)) return refuse('to_role must be one of: owner, procurement, finance, legal.');
    if (S.done[item.id] && S.done[item.id].escalate) return refuse(`Already escalated on ${fmtD(S.done[item.id].escalate.on)}. Nothing more to do until a person acts.`);
    addTask({ role, cid: item.c ? item.c.id : null, from: by, due: item.left != null ? CS.addDays(S.asOf, item.left) : null, title: item.title, detail: reason || item.detail });
    (S.done[item.id] = S.done[item.id] || {}).escalate = { on: S.asOf, by };
    addLog({ who: by, cid: item.c ? item.c.id : null, role, text: `escalated to ${ROLE1[role]}: ${item.title}.`, reason, auto: by === 'Agent' }); save();
    return { status: 'done', text: `Escalated to ${ROLE1[role]}.` };
  }
  function decideApproval(id, ok) {
    const a = S.approvals.find(x => x.id === id); if (!a || a.status !== 'pending') return;
    if (!CS.isAdmin() && S.role !== a.role) { toast(`Only ${ROLE1[a.role]} or Admin can decide this.`); return; }
    a.status = ok ? 'approved' : 'rejected'; a.by = who(); a.decidedOn = S.asOf;
    if (ok) execute(a, who(), `proposed by ${a.from === 'Agent' ? 'the agent' : a.from}`);
    else addLog({ who: who(), cid: a.cid, text: `rejected the proposal to ${ACT[a.action].label.toLowerCase()} for ${a.supplier}.` });
    save(); CS.render(); toast(ok ? `${ACT[a.action].done}.` : 'Proposal rejected.');
  }
  function undoLog(id) {
    const l = S.log.find(x => x.id === id); if (!l || !l.undo || l.undone) return; const u = l.undo;
    if (u.k === 'held') delete S.held[u.inv];
    if (u.k === 'task') S.tasks = S.tasks.filter(t => t.id !== u.id);
    if (u.k === 'owner') delete S.owners[u.cid];
    if (S.done[u.itemId]) delete S.done[u.itemId][u.action];
    l.undone = true; addLog({ who: who(), cid: l.cid, text: `undid an action: ${l.text}` }); save(); CS.render(); toast('Undone.');
  }
  /* A person sends a draft from the drawer: it goes through the same gate as the agent's actions. */
  function submitDraft() {
    const dr = S.draft; if (!dr || !dr.action || !dr.text) return;
    const item = attention().find(a => a.id === dr.item);
    if (!item) { toast('There is no open item for this any more.'); return; }
    if (dr.action === 'send_notice' && !(item.acts || []).includes('send_notice')) { toast('Record the decision to stop the renewal first.'); return; }
    const first = dr.text.split('\n').find(l => /^subject:/i.test(l.trim()));
    const res = applyAction(item, dr.action, { message: dr.text, subject: first ? first.replace(/^\s*subject:\s*/i, '') : dr.title, reason: `Drafted with AI and submitted by ${who()}.` }, 'user');
    dr.submitted = res.status !== 'refused'; dr.note = res.text; CS.paintDraft(); toast(res.text); CS.render();
  }

  /* ---------- agent screen ---------- */
  function agentStats() {
    const auto = S.log.filter(l => l.auto && !/^escalated/.test(l.text)).length, undone = S.log.filter(l => l.auto && l.undone).length;
    const appr = S.approvals.filter(a => a.status === 'approved').length, rej = S.approvals.filter(a => a.status === 'rejected').length;
    const base = auto + appr + rej;
    return { auto, undone, appr, rej, overturn: base ? Math.round((undone + rej) / base * 100) : null };
  }
  /* ---------- the case ---------- */
  function vCase() {
    const A = attention(), ns = northStar(), st = agentStats();
    const recover = A.filter(a => a.recover).reduce((s, a) => s + a.amount, 0);
    const pays = paymentRows(), tot = pays.reduce((s, p) => s + p.spend12, 0), gap = pays.filter(p => !p.c), gapSum = gap.reduce((s, p) => s + p.spend12, 0);
    const due = A.filter(a => a.type === 'Renewal' && a.left != null && a.left >= 0 && a.left <= 30).length;
    let terms = 0, ok = 0; contracts().forEach(c => (c.terms || []).forEach(t => { terms++; if (isVerified(c, t)) ok++; }));
    const got = Object.keys(S.claims).length + Object.keys(S.disputed).length;
    const row = (a, b, c2, d2) => `<tr><td><strong>${a}</strong></td><td>${b}</td><td>${c2}</td><td>${d2}</td></tr>`;
    return `
    <div class="head"><h1>The case for this prototype</h1><p class="sub">What was built, for whom, on which assumptions, and how to tell whether it works. Figures marked live are worked out from the sample data on the other tabs.</p></div>
    <div class="case">

    <section class="panel"><div class="eyebrow">1 · Why this stage</div><h2>The intelligent repository, because the losses sit in contracts already signed</h2>
      <p>The brief names three harms: renewals nobody reviewed, service levels nobody enforced, and invoices that do not match agreed prices. All three happen after signature. Better intake and faster negotiation improve the next contract. They do nothing for the thousands already signed.</p>
      <ul>
        <li><strong>It is where the loss is.</strong> In this sample of ${contracts().length} contracts: <span class="live">${inrC(recover)}</span> recoverable today, <span class="live">${inrC(gapSum)}</span> paid to ${plural(gap.length, 'supplier')} with no contract on file, and <span class="live">${due}</span> ${due === 1 ? 'decision' : 'decisions'} due within 30 days.</li>
        <li><strong>It asks nobody to change how they work.</strong> It runs on contracts that already exist. A small team loads them while 3,000 employees carry on as before.</li>
        <li><strong>The other two stages depend on it.</strong> Intake needs to know which suppliers already have a contract. Negotiation needs to know what was agreed last time.</li>
        <li><strong>It suits AI, and the AI can be checked.</strong> Reading documents, pulling out terms and answering with a clause reference are things a person can verify in seconds.</li>
      </ul></section>

    <section class="panel"><div class="eyebrow">2 · Stakeholder map</div><h2>Who has a stake, what each wants, and where they pull against each other</h2>
      <div class="scroll"><table class="t wraprows"><thead><tr><th>Stakeholder</th><th>What they want</th><th>What they do in the product</th><th>Served here?</th></tr></thead><tbody>
        ${row('Business owner', 'The supplier keeps working, with as little admin as possible', 'Decides each renewal, claims service credits, hears when a payment is held', 'Yes, own queue')}
        ${row('Procurement', 'Lower prices, fewer suppliers, leverage at renewal', 'Finds suppliers with no contract, takes on renegotiations, assigns owners, chases compliance papers', 'Yes, own queue')}
        ${row('Finance', 'Pay the right amount on time; no surprises on commitments, currency or statutory deadlines', 'Checks invoices against contract prices, holds overbilled amounts, chases rebates, watches the 45-day limit for small enterprises', 'Yes, own queue')}
        ${row('Legal', 'An accurate, defensible record and controlled risk', 'Confirms what the AI read, approves binding notices, handles data protection and stamp duty gaps', 'Yes, own queue')}
        ${row('Supplier', 'To be paid on time and renewed by default, with few disputes', 'Receives every claim, dispute and notice. One supplier contact can issue a credit note in case A', 'One step only')}
        ${row('Leadership (CFO)', 'Less leakage, clean audits, a view of commitments', 'Reads the north-star figure and the money recovered', 'Through the metrics')}
        ${row('IT and data protection', 'Control over who sees contracts and where the text is sent', 'Sets access and the policy for AI use', 'An assumption, not built')}
      </tbody></table></div>
      <h3>Where interests conflict, and what the product does about it</h3>
      <ul>
        <li><strong>Owner against Procurement.</strong> The owner wants continuity; Procurement wants savings. The owner keeps the decision, but Procurement sees every renewal 90 days ahead with usage and price evidence, and "renegotiate" hands the work to them.</li>
        <li><strong>Finance against the owner and the supplier.</strong> Holding a payment protects cash and strains the relationship, and for a registered small enterprise the law requires payment within 45 days. The product holds only the disputed difference, shows the 45-day clock, and tells the owner straight away.</li>
        <li><strong>Legal against everyone's wish for speed.</strong> Checking every term would make Legal the bottleneck. The AI reads everything; Legal confirms only what is flagged, and the agent is blocked only on terms nobody has confirmed.</li>
        <li><strong>The supplier against the company.</strong> Suppliers gain from inertia: automatic renewals, unclaimed credits, unnoticed price drift. The product removes the inertia, so disputes need a person's approval and every message is courteous and cites the clause.</li>
        <li><strong>Data protection against wide access.</strong> Contracts hold prices and personal data. This prototype has no logins; a real one needs access by role and a decision on sending contract text to an AI model.</li>
      </ul></section>

    <section class="panel"><div class="eyebrow">3 · The problem</div><h2>Signed contracts are documents nobody can ask questions of</h2>
      <p>A renewal date, a price or a service level sits inside a PDF, often a scan, in a shared drive. Nothing reminds anyone, and the person paying the invoice cannot see the price that was agreed.</p>
      <h3>Who it affects</h3>
      <ul>
        <li><strong>Contract owners</strong> learn about a renewal after the notice window has closed.</li>
        <li><strong>Finance</strong> pays invoices without the contract price in front of them, and carries commitments it cannot see.</li>
        <li><strong>Procurement</strong> negotiates without knowing usage, performance or what other teams pay the same supplier.</li>
        <li><strong>Legal</strong> cannot answer "which contracts contain this clause?" without reading them all.</li>
      </ul>
      <h3>Why it matters</h3>
      <ul>
        <li><strong>Money:</strong> renewals at a higher price, overbilling, credits and rebates never claimed, minimum commitments missed.</li>
        <li><strong>Risk:</strong> work continuing after a contract has ended, personal data handled without the required agreement, agency workers whose PF and ESI may not have been paid.</li>
        <li><strong>Statutory cost:</strong> interest on late payment to small enterprises, and agreements that are not duly stamped.</li>
      </ul>
      <h3>How we know it is real</h3>
      <p>The brief reports these outcomes directly. The figures in this prototype are invented, so they prove the method, not the size of the problem. Four checks would size it with the company's own data in the first two weeks:</p>
      <ul>
        <li>Compare 12 months of payments with the contracts on file. Here that check finds <span class="live">${Math.round(tot ? gapSum / tot * 100 : 0)}%</span> of spend with no contract.</li>
        <li>Take the last 50 renewals and count how many had a decision recorded before the notice deadline.</li>
        <li>Re-price one quarter of invoices for the top 20 suppliers against their contracts.</li>
        <li>Count service-level misses against credits actually received.</li>
      </ul>
      <p class="muted">Industry bodies such as World Commerce &amp; Contracting have long put the cost of weak contract management at around 9% of contract value. Treat that as a reason to measure, not as a fact about this company.</p></section>

    <section class="panel"><div class="eyebrow">4 · Core flows</div><h2>Four flows, each crossing more than one team</h2>
      <div class="flows">
        <div class="flow"><h3>A renewal is decided on time</h3><ol><li>The system works out the notice deadline from the contract and its amendments.</li><li>The <strong>owner</strong> gets it in their queue, with a brief on cost, usage and performance.</li><li>They choose: renew, renegotiate (a task goes to <strong>Procurement</strong>) or stop.</li><li>On "stop", the notice is drafted and goes to <strong>Legal</strong> to approve and send.</li></ol><a class="btn sm" href="#item-b">Open case B</a></div>
        <div class="flow"><h3>An overbilled invoice is caught before payment</h3><ol><li>Each invoice line is compared with the contract price, in the contract's currency.</li><li><strong>Finance</strong> or the agent holds only the difference.</li><li>A dispute citing the clause is drafted; <strong>Finance</strong> approves it.</li><li>The <strong>owner</strong> is told, so the supplier call is not a surprise.</li></ol><a class="btn sm" href="#item-a">Open case A</a></div>
        <div class="flow"><h3>A scanned contract becomes a usable record</h3><ol><li><strong>Procurement</strong> uploads the scan of a contract found through the payments ledger.</li><li>AI reads the page images into text (OCR), then pulls out the terms with quotes.</li><li><strong>Legal</strong> confirms each term against its clause.</li><li>Only then may the agent act on those terms.</li></ol><a class="btn sm" href="#add">Add a scanned contract</a></div>
        <div class="flow"><h3>A service credit is claimed before the window closes</h3><ol><li>Performance data shows a missed service level.</li><li>The system works out the credit and the last date to claim it.</li><li>The agent files the claim itself if the rules allow, and logs it.</li><li><strong>Finance</strong> expects the credit on the next invoice.</li></ol><a class="btn sm" href="#item-c">Open case C</a></div>
      </div></section>

    <section class="panel"><div class="eyebrow">How much work the product takes on</div><h2>It informs, drafts, and acts within limits people set</h2>
      <p>The line between telling someone and doing it for them is drawn per action, by two tests: can it be undone, and what does a mistake cost?</p>
      <div class="ladder">
        <div><strong>Informs</strong><span>Finds every deadline, overcharge and gap, and shows the clause.</span></div>
        <div><strong>Drafts</strong><span>Writes notices, disputes, claims and renewal briefs for a person to send.</span></div>
        <div><strong>Acts, then tells</strong><span>Holds a disputed amount, files a credit claim, chases a missing certificate, reminds an owner.</span></div>
        <div><strong>Acts after approval</strong><span>Sends a dispute or a non-renewal notice, asks for a rebate, assigns an interim owner.</span></div>
        <div class="never"><strong>Never</strong><span>Decides a renewal, ends a contract, or acts on a term nobody has confirmed.</span></div>
      </div>
      <p class="muted">Each rule can be changed on the <a href="#agent">Agent tab</a>. So far the agent has taken <span class="live">${st.auto}</span> ${st.auto === 1 ? 'action' : 'actions'} alone, with <span class="live">${st.appr}</span> approved and <span class="live">${st.rej}</span> rejected.</p></section>

    <section class="panel" id="assumptions"><div class="eyebrow">Assumptions</div><h2>What this prototype takes for granted</h2>
      <p class="muted">Each assumption has a tag. Wherever a screen depends on one, the same tag appears beside it. The tags are used for nothing else.</p>
      <div class="asmlist">${Object.entries(CS.assumptions()).map(([k, v]) => `<div id="asm-${k}"><span class="asm">${k}</span><span>${esc(v)}</span></div>`).join('')}</div>
      <h3>What is not built</h3>
      <ul><li>Real email and finance-system connections. Sending is simulated.</li><li>Real logins. Each team has its own sign-in page and sees only its own queues, but the sign-in is simulated and is not security.</li><li>A scheduler. The agent runs when asked. The Agent tab and the README describe how it would run on a schedule from a server.</li><li>Shared storage. Changes are kept in your browser only.</li></ul></section>

    <section class="panel" id="notes"><div class="eyebrow">Notes</div><h2>Choices made where the brief was silent</h2>${CS.notesHtml()}</section>

    <section class="panel"><div class="eyebrow">5 · Success metrics</div><h2>One number to steer by, and what would change our minds</h2>
      <div class="north"><div><div class="k">North star · live</div><div class="v">${ns.total ? ns.pct + '%' : '—'}</div></div><div><strong>Renewals and expiries decided before their deadline.</strong> ${ns.decided} of ${ns.total} in the 90 days either side of today${ns.lapsed ? `; ${ns.lapsed} lapsed with no decision` : ''}${ns.pending ? `; ${ns.pending} still open` : ''}. It is the one outcome every stakeholder shares, it is hard to game, and the other benefits follow from the same discipline. Target: 90% within two quarters.</div></div>
      <h3>How we will know it works</h3>
      <div class="scroll"><table class="t compact wraprows"><thead><tr><th>Measure</th><th>Now, in this sample</th><th>Target</th></tr></thead><tbody>
        <tr><td>Money recovered: credits claimed, disputes raised, rebates received</td><td class="live">${got} raised so far; ${inrC(recover)} still to recover</td><td>80% of identified amounts recovered</td></tr>
        <tr><td>Share of spend covered by a contract on file</td><td class="live">${Math.round(tot ? (tot - gapSum) / tot * 100 : 0)}%</td><td>95%</td></tr>
        <tr><td>Terms confirmed by a person</td><td class="live">${ok} of ${terms} (${Math.round(terms ? ok / terms * 100 : 0)}%)</td><td>100% of dates, notice periods and prices</td></tr>
        <tr><td>Time from flag to action</td><td>Not measurable in a prototype</td><td>Under 3 working days</td></tr>
        <tr><td>Agent actions overturned (undone or rejected)</td><td class="live">${st.overturn == null ? 'No actions yet' : st.overturn + '%'}</td><td>Under 5%</td></tr>
      </tbody></table></div>
      <h3>What would make us rethink the approach</h3>
      <ul>
        <li><strong>Reading errors on the terms that matter.</strong> If more than 1 in 20 dates, notice periods or prices is wrong after OCR and extraction, people will stop trusting the record. Response: narrow to digital contracts first, or add a second reader.</li>
        <li><strong>Owners ignore the prompts.</strong> If fewer than half of renewal prompts get a decision within a week, the problem is ownership, not information. Response: route decisions through Procurement instead.</li>
        <li><strong>The agent is overturned often.</strong> Above 10%, move actions from "do it and tell me" back to "ask first".</li>
        <li><strong>Recovered money does not cover the running cost</strong> after two quarters.</li>
        <li><strong>The company will not allow contracts to be sent to an AI model.</strong> Then the design needs a model run inside the company's own systems.</li>
      </ul></section>
    </div>`;
  }

  Object.assign(CS, { ACT, policy, pendingFor, applyAction, escalate, decideApproval, undoLog, submitDraft, agentStats, vCase });
})();
