/* Countersign cases: one card per case, steps that wait for Legal, item pages, the value page and the Excel tracker. */
(() => {
  'use strict';
  const CS = window.CS;
  const { D, $, esc, isIso, d, diff, fmtD, plural, CUR, curOf, fxRate, cm, cm2, toInr, inr, inrC, both, S, save, uid, contracts, byId, ownerOf, ROLE1, who, addLog, addTask,
    workdaysBefore, legalPriority, asm, toCsv, download, renewal, statusOf, slaRows, invoiceChecks, cLink, verifiedKey, isVerified, findClause, attention, pill, dueChip, toast } = CS;

  const STAGES = ['Found', 'Checked by Legal', 'In progress', 'Sent to supplier', 'Confirmed by Finance', 'Fixed at source'];
  const GST = 18;
  const INV_A = 'SSS/26-27/0412', INV_D = 'STR-55102', SLA_C = 'C-003|On-time delivery|2026-09';
  const CASE_OF = { ['inv|' + INV_A]: 'A', 'renew|C-001': 'B', 'notice|C-001': 'B', ['credit|' + SLA_C]: 'C', ['inv|' + INV_D]: 'D' };
  const caseOf = id => CASE_OF[id] || null;
  const term = (c, label) => (c.terms || []).find(t => t.label === label);
  const check = id => invoiceChecks().find(k => k.inv.id === id);
  const monthsAhead = until => { const a = new Date(d(S.asOf)), b = new Date(d(until)); return Math.max(0, (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth() + 1); };
  const person = role => `${ROLE1[role]} · ${D.people[role]}`;
  const clauseBox = (c, n) => { const f = findClause(c, n); return f ? `<blockquote class="cl"><a class="cite" href="${cLink(c)}" data-act="cite" data-id="${c.id}" data-clause="${esc(n)}">§${esc(n)}</a> ${f.cl.h ? `<strong>${esc(f.cl.h)}.</strong> ` : ''}${esc(f.cl.t)}</blockquote>` : ''; };
  const table = (head, rows, cls) => `<div class="scroll"><table class="t compact ${cls || ''}"><thead><tr>${head.map((h, i) => `<th${i && /^[\d₹£U+−-]/.test(String((rows[0] || [])[i] || '')) ? ' class="num"' : ''}>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((v, i) => `<td${i && /^[\d₹£U+−-]/.test(String(v)) ? ' class="num"' : ''}>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

  /* ---------- the four cases ---------- */
  function caseA() {
    const c = byId('C-002'), k = check(INV_A); if (!c || !k) return null;
    const t = term(c, 'Bill rates'), legal = isVerified(c, t), r = renewal(c), n = monthsAhead(r.end), pr = legalPriority(r.end);
    const rateOver = k.lines[0].variance, lock = legal ? '' : 'Locked: waiting for Legal to check the rate';
    const steps = [
      { id: 'A1', role: 'legal', title: 'Check the Warehouse Associate rate in Amendment No. 2', detail: `The AI read ₹1,005 a day from a scanned amendment. The invoice bills ₹1,030 and the Excel tracker still says ₹980. Confirm which rate is in force.`, done: legal, btns: [{ label: 'Confirm the rate is ₹1,005', fn: 'confirmTerm', arg: 'C-002|Bill rates' }] },
      { id: 'A2', role: 'finance', title: 'Check the billed roles against the timesheets', detail: 'The AI compared the Forklift Operator days billed with the October timesheets and found 22 days worked by a Warehouse Associate.', done: !!S.steps.A2, lock, btns: [{ label: 'Accept the role check', fn: 'step', arg: 'A2' }] },
      { id: 'A3', role: 'finance', title: 'Hold the difference and send the dispute', detail: `Hold ${cm(c, k.over)} of the invoice, pay the rest on time, and ask Sahyadri for a credit note.`, done: k.disputed, lock, btns: [{ label: 'Hold and send the dispute', fn: 'dispute', arg: INV_A }] },
      { id: 'A5', role: 'supplier', title: 'Issue the credit note', detail: `Sahyadri's billing lead issues a credit note for ${cm(c, k.over)} plus GST.`, done: !!S.steps.A5, lock, btns: [{ label: 'Issue the credit note', fn: 'step', arg: 'A5' }] },
      { id: 'A6', role: 'finance', title: 'Confirm the credit note has arrived', detail: 'This counts the amount as confirmed.', done: !!S.confirmed.A, lock, btns: [{ label: 'Confirm the credit note', fn: 'confirm', arg: 'A' }] },
      { id: 'A7', role: 'procurement', title: 'Correct the rate in the Excel tracker', detail: 'The tracker still says ₹980. Fixing it at the source stops the next person relying on the wrong rate.', done: !!S.trackerFixed['C-002'], lock, btns: [{ label: 'Correct the tracker row', fn: 'fixRow', arg: 'C-002' }] },
      { id: 'A8', role: 'finance', title: "Check that November's invoice uses ₹1,005", detail: 'The case closes only when the next invoice comes in at the right rate, so the overcharge does not repeat.', done: !!S.steps.A8, lock, btns: [{ label: 'November is billed correctly', fn: 'step', arg: 'A8' }] }
    ];
    const a4 = { id: 'A4', role: 'owner', side: true, title: 'Travel charge of ₹38,500: confirm nobody approved it', detail: 'The rates are all-inclusive, so travel cannot be billed. Confirm no one agreed otherwise in writing.', done: !!S.steps.A4, lock, btns: [{ label: 'Nobody approved it', fn: 'step', arg: 'A4' }] };
    return { id: 'A', c, happened: 'Sahyadri\'s October invoice bills warehouse associates at ₹1,030 a day. Amendment No. 2 says ₹1,005 from 1 October, and the Excel tracker still says ₹980. The same invoice bills 22 forklift days that the timesheets show were warehouse work, and a ₹38,500 travel charge the contract does not allow.', title: 'Sahyadri Staffing billed the wrong rate, the wrong role and a travel charge', short: 'Staffing invoice for October', steps, side: [a4],
      stage: S.confirmed.A && S.trackerFixed['C-002'] ? 5 : S.confirmed.A ? 4 : k.disputed ? 3 : S.steps.A2 ? 2 : legal ? 1 : 0, closed: !!S.confirmed.A && !!S.steps.A8, priority: legal ? null : pr,
      oneOff: { c, amt: k.over, note: legal ? '' : 'if the rate is ₹1,005' }, yearly: null,
      repeat: { c, amt: rateOver * n, note: `${plural(n, 'more monthly invoice')} at the wrong rate, to the end of the term` }, gst: k.over * GST / 100,
      proof: () => `<h3>What the contract says</h3>${clauseBox(c, '3')}${clauseBox(c, 'A2-1')}
        <h3>The invoice against the contract ${asm('A3')}</h3>${table(['Line', 'Billed', 'Per contract', 'Difference'], k.lines.map(l => [l.desc, cm2(c, l.billedAmt), l.expected == null ? '—' : cm2(c, l.expected), l.variance > 0.005 ? '+' + cm2(c, l.variance) : 'None']).concat([['Total to dispute, before GST', '', '', cm2(c, k.over)]]))}
        <div class="recorded"><div class="k">Role check ${CS.src('rec')} ${asm('A9')} ${asm('A4')}</div><p>I compared the 620 Forklift Operator person-days on invoice ${INV_A} with the October timesheets signed by Anuj Shinde. One worker, S. Gaikwad, appears on the timesheets as a Warehouse Associate for all 22 of his shifts, but is billed at the Forklift Operator rate. At ₹1,250 against ₹1,005 a day, that is ₹245 × 22 = ₹5,390 overbilled. The other 598 person-days match. I am confident about the mismatch. The amount depends on the ₹1,005 rate in Amendment No. 2, which a person should confirm.</p></div>
        <p class="muted sm">Legal priority ${pr} of 20: the rate affects ${plural(n, 'more monthly invoice')}, at 5 points a month, capped at 20.</p>`,
      csv: () => [['Line', 'Billed', 'Per contract', 'Difference', 'Clause']].concat(k.lines.map(l => [l.desc, l.billedAmt, l.expected == null ? '' : l.expected, l.variance, l.clause || ''])) };
  }
  function caseB() {
    const c = byId('C-001'); if (!c) return null;
    const r = renewal(c), dec = S.decisions[c.id], choice = dec && dec.choice, out = S.outcome.B, sent = !!S.noticeSent[c.id];
    const deadline = r.deadline, dispatchBy = workdaysBefore(deadline, 3), approveBy = workdaysBefore(dispatchBy, 1), decideBy = workdaysBefore(approveBy, 1);
    const quote = c.rates.seat.price * (1 + c.uplift.pct / 100), quoteYear = quote * c.usage.paid * 12;
    const steps = [{ id: 'B1', role: 'owner', title: 'Decide what to do with the Brightlane renewal', detail: `Decide by ${fmtD(decideBy)} so a notice can still be approved, dispatched and received by ${fmtD(deadline)}. ${c.usage.active} of ${c.usage.paid} seats are in use.`, done: !!dec, due: decideBy,
      btns: [{ label: 'Renew as quoted', fn: 'decide', arg: 'C-001|renew' }, { label: 'Renegotiate', fn: 'decide', arg: 'C-001|renegotiate' }, { label: "Don't renew", fn: 'decide', arg: 'C-001|terminate' }] }];
    if (choice === 'terminate') steps.push(
      { id: 'B2', role: 'legal', title: 'Approve the wording of the non-renewal notice', detail: `Approve by ${fmtD(approveBy)}. The contract needs email and tracked courier.`, done: !!S.steps.B2 || sent, due: approveBy, btns: [{ label: 'Approve the notice', fn: 'step', arg: 'B2' }] },
      { id: 'B3', role: 'procurement', title: `Dispatch the notice by courier by ${fmtD(dispatchBy)}`, detail: `It must be received in Austin by ${fmtD(deadline)}, and the courier takes 3 working days.`, done: sent, due: dispatchBy, btns: [{ label: 'Mark as dispatched', fn: 'dispatch', arg: 'C-001' }] },
      { id: 'B4', role: 'procurement', title: "Confirm the courier's proof of delivery", detail: 'Keep the proof with the contract. This closes the case.', done: !!S.confirmed.B, btns: [{ label: 'Confirm and close', fn: 'confirm', arg: 'B' }] });
    if (choice === 'renegotiate') steps.push(
      { id: 'B2', role: 'procurement', title: 'Record the renegotiated terms', detail: `Brightlane quoted ${cm2(c, quote)} a seat for ${c.usage.paid} seats. Enter what was agreed.`, done: !!out, due: dispatchBy,
        extra: `<span class="rn"><label for="rn-seats">Seats</label><input id="rn-seats" type="number" min="1" value="380"><label for="rn-price">US$ per seat a month</label><input id="rn-price" type="number" min="0" step="0.01" value="54.00"></span>`, btns: [{ label: 'Record the outcome', fn: 'outcome', arg: 'B' }] },
      { id: 'B3', role: 'owner', title: 'Confirm the new order form is signed', detail: 'This closes the case and counts the yearly saving as confirmed.', done: !!S.confirmed.B, btns: [{ label: 'Confirm and close', fn: 'confirm', arg: 'B' }] });
    if (choice === 'terminate' || choice === 'renegotiate') steps.push({ id: 'B9', role: 'procurement', title: 'Correct the Brightlane row in the Excel tracker', detail: 'The tracker shows the old seats and price and a 60-day notice period. Fixing it closes the case.', done: !!S.trackerFixed['C-001'], btns: [{ label: 'Correct the tracker row', fn: 'fixRow', arg: 'C-001' }] });
    const saving = out ? quoteYear - out.seats * out.price * 12 : 0;
    const fixed = !!S.trackerFixed['C-001'], closed = choice === 'renew' || (!!S.confirmed.B && fixed);
    return { id: 'B', c, happened: `The Brightlane subscription renews itself for 12 months unless a notice reaches Austin by ${fmtD(deadline)}. Brightlane has quoted a ${c.uplift.pct}% rise, and ${c.usage.paid - c.usage.active} of the ${c.usage.paid} seats are not being used.`, title: 'Brightlane renews itself unless notice arrives in time', short: 'CRM renewal', steps, side: [],
      stage: S.confirmed.B && fixed ? 5 : S.confirmed.B ? 4 : choice === 'renew' ? 5 : choice === 'terminate' ? (sent ? 3 : S.steps.B2 ? 1 : 0) : choice === 'renegotiate' ? (out ? 3 : 2) : 0, closed,
      closedNote: choice === 'renew' ? 'Renewed as quoted. No saving is counted.' : choice === 'terminate' && closed ? 'Not renewed. No saving is counted.' : '',
      oneOff: null, yearly: choice === 'renegotiate' && out ? { c, amt: saving } : null, yearlyNote: choice === 'renegotiate' ? '' : 'Counts only if renegotiated',
      proof: () => `<h3>What the contract says</h3>${clauseBox(c, '2')}${clauseBox(c, '3')}${clauseBox(c, 'OF-4')}
        <h3 id="leadtime">Working back from the deadline ${asm('A7')}</h3>${table(['Step', 'Who', 'By'], [['Notice received in Austin', 'Brightlane', fmtD(deadline)], ['Courier in transit: 3 working days', 'Courier', ''], ['Dispatch by courier, and email a copy', person('procurement'), fmtD(dispatchBy)], ['Approve the wording', person('legal'), fmtD(approveBy)], ['Decide', person('owner'), fmtD(decideBy)]])}
        <h3>What each choice costs a year</h3>${table(['Choice', 'Seats', 'Per seat a month', 'A year'], [['Renew as quoted', c.usage.paid, cm2(c, quote), cm(c, quoteYear)], ['Seats in use today', c.usage.active, cm2(c, c.rates.seat.price), cm(c, c.usage.active * c.rates.seat.price * 12)]].concat(out ? [['As renegotiated', out.seats, cm2(c, out.price), cm(c, out.seats * out.price * 12)]] : []))}
        <p class="muted sm">Only a renegotiation counts as value. Renewing as quoted or not renewing closes the case with no saving, because nothing was won from the supplier.</p>`,
      csv: () => [['Step', 'Who', 'By'], ['Notice received in Austin', 'Brightlane', deadline], ['Courier in transit', '3 working days', ''], ['Dispatch by courier', D.people.procurement, dispatchBy], ['Approve the wording', D.people.legal, approveBy], ['Decide', D.people.owner, decideBy]] };
  }
  function caseC() {
    const c = byId('C-003'); if (!c) return null; const s = slaRows(c).find(x => x.key === SLA_C); if (!s) return null;
    const decided = !!S.steps.C1 || s.claimed;
    const steps = [
      { id: 'C1', role: 'owner', title: "Decide whether to accept Deccan's force majeure claim", detail: `The default is not to accept it: clause 5.1 needs written evidence within 5 days and none was sent. Accepting it lowers the credit from ${cm(c, s.creditFull)} to ${cm(c, s.creditFm)}.`, done: decided,
        btns: [{ label: 'Claim the full credit', fn: 'fm', arg: '0' }, { label: 'Accept force majeure', fn: 'fm', arg: '1' }] },
      { id: 'C2', role: 'owner', title: `Send the claim by ${fmtD(s.claimBy)}`, detail: `Claim ${cm(c, s.credit)} for September. After ${fmtD(s.claimBy)} the credit is lost.`, done: s.claimed, due: s.claimBy, btns: [{ label: 'Send the claim', fn: 'claim', arg: SLA_C }] },
      { id: 'C3', role: 'owner', title: 'Confirm the credit shows on the next invoice', detail: 'This counts the credit as confirmed.', done: !!S.confirmed.C, btns: [{ label: 'Confirm the credit', fn: 'confirm', arg: 'C' }] },
      { id: 'C4', role: 'procurement', title: 'Agree with Deccan how evidence of delays is sent', detail: 'Put the 5-day evidence rule into the monthly review, so the next claim is not argued after the fact. This closes the case.', done: !!S.steps.C4, btns: [{ label: 'Agreed and noted', fn: 'step', arg: 'C4' }] }
    ];
    return { id: 'C', c, happened: `Deccan delivered ${s.h.actual}% of consignments on time in September against a target of ${s.sla.target}%. The contract gives a credit for that. Deccan says flooding caused part of it, but sent no evidence.`, title: 'Deccan Freightways missed its on-time target in September', short: 'Late-delivery credit', steps, side: [],
      stage: S.confirmed.C && S.steps.C4 ? 5 : S.confirmed.C ? 4 : s.claimed ? 3 : decided ? 2 : 0, closed: !!S.confirmed.C && !!S.steps.C4, oneOff: { c, amt: s.credit, note: s.fmOn ? 'force majeure accepted' : '' }, yearly: null,
      proof: () => `<h3>What the contract says</h3>${clauseBox(c, '5')}${clauseBox(c, '5.1')}
        <h3>What Deccan says</h3><p>${esc(s.h.fm)}</p>
        <h3>The working ${asm('A5')}</h3>${table(['Position', 'On-time', 'Full points below 96%', 'Credit'], [[`Force majeure not accepted${s.fmOn ? '' : ' (chosen)'}`, s.h.actual + '%', Math.floor(96 - s.h.actual + 1e-6), cm(c, s.creditFull)], [`Force majeure accepted${s.fmOn ? ' (chosen)' : ''}`, s.h.fmActual + '%', Math.floor(96 - s.h.fmActual + 1e-6), cm(c, s.creditFm)]])}
        <p class="muted sm">The credit is 2% of September's freight charges of ${cm(c, s.h.fee)} for each full point below the target.</p>`,
      csv: () => [['Position', 'On-time %', 'Full points below target', 'Credit'], ['Force majeure not accepted', s.h.actual, Math.floor(96 - s.h.actual + 1e-6), s.creditFull], ['Force majeure accepted', s.h.fmActual, Math.floor(96 - s.h.fmActual + 1e-6), s.creditFm]] };
  }
  function caseD() {
    const c = byId('C-007'), k = check(INV_D); if (!c || !k) return null;
    const t = term(c, 'Q4 extra discount'), legal = isVerified(c, t), q = c.rates.q4, n = monthsAhead(q.to), pr = legalPriority(q.to);
    const lock = legal ? '' : 'Locked: waiting for Legal to check the discount';
    const steps = [
      { id: 'D1', role: 'legal', title: 'Check the Q4 discount clause', detail: 'The AI read a further 5% discount for October to December 2026. The October invoice did not apply it.', done: legal, btns: [{ label: 'Confirm the 5% discount', fn: 'confirmTerm', arg: 'C-007|Q4 extra discount' }] },
      { id: 'D2', role: 'finance', title: 'Ask Stratus to credit October and apply the discount from now on', detail: `Dispute ${cm(c, k.over)} on invoice ${INV_D} and ask for the discount on the November and December invoices.`, done: k.disputed, lock, btns: [{ label: 'Hold and send the dispute', fn: 'dispute', arg: INV_D }] },
      { id: 'D3', role: 'finance', title: 'Confirm the credit has arrived', detail: 'This counts the amount as confirmed.', done: !!S.confirmed.D, lock, btns: [{ label: 'Confirm the credit', fn: 'confirm', arg: 'D' }] },
      { id: 'D4', role: 'finance', title: "Check that November's invoice shows the 5% discount", detail: 'The case closes when the discount appears without being asked for.', done: !!S.steps.D4, lock, btns: [{ label: 'November shows the discount', fn: 'step', arg: 'D4' }] }
    ];
    return { id: 'D', c, happened: 'The contract gives a further 5% off charges from October to December 2026. Stratus did not take it off the October invoice, and nobody had the clause in front of them when the invoice was approved.', title: 'Stratus Cloud left the Q4 discount off the October invoice', short: 'Q4 discount', steps, side: [],
      stage: S.confirmed.D && S.steps.D4 ? 5 : S.confirmed.D ? 4 : k.disputed ? 3 : legal ? 1 : 0, closed: !!S.confirmed.D && !!S.steps.D4, priority: legal ? null : pr,
      oneOff: { c, amt: k.over, note: legal ? '' : 'if the clause is confirmed' }, yearly: null, repeat: { c, amt: k.over * n, note: `the same miss on the ${plural(n, 'invoice')} still to come this quarter, at October's usage` },
      proof: () => `<h3>What the contract says</h3>${clauseBox(c, '4')}${clauseBox(c, '4.1')}
        <h3>The invoice against the contract</h3>${table(['Line', 'Billed', 'Per contract', 'Difference'], k.lines.map(l => [l.desc, cm2(c, l.billedAmt), cm2(c, l.expected), '+' + cm2(c, l.variance)]))}
        <p class="muted sm">Legal priority ${pr} of 20: ${plural(n, 'month')} of the discount ${n === 1 ? 'is' : 'are'} still ahead (November and December), at 5 points a month.</p>`,
      csv: () => [['Line', 'Billed', 'Per contract', 'Difference', 'Clause']].concat(k.lines.map(l => [l.desc, l.billedAmt, l.expected, l.variance, l.clause || ''])) };
  }
  const cases = () => [caseA(), caseB(), caseC(), caseD()].filter(Boolean);
  const current = k => k.steps.find(s => !s.done) || null;

  /* ---------- actions: the buttons and the tour's "Do it for me" both call these ---------- */
  const STEP_LOG = { A2: ['C-002', 'accepted the role check on the Sahyadri invoice.'], A4: ['C-002', 'confirmed nobody approved the Sahyadri travel charge.'], A5: ['C-002', 'issued a credit note for the October invoice.'], B2: ['C-001', 'approved the wording of the Brightlane non-renewal notice.'], A8: ['C-002', 'confirmed that the November invoice uses the right rate.'], C4: ['C-003', 'agreed with Deccan how evidence of delays will be sent.'], D4: ['C-007', 'confirmed that the November invoice shows the discount.'] };
  const store = {
    confirmTerm(arg) { const [cid, label] = arg.split('|'), c = byId(cid), t = c && term(c, label); if (!t || isVerified(c, t)) return false;
      S.verified[verifiedKey(c, t)] = true; addLog({ who: who(), cid, text: `confirmed the term "${label}" against §${t.clause}.` }); return true; },
    step(id) { if (S.steps[id]) return false; S.steps[id] = S.asOf; const l = STEP_LOG[id]; if (l) addLog({ who: who(), cid: l[0], text: l[1] }); return true; },
    dispute(invId) { const k = check(invId); if (!k || !k.c || k.disputed) return false; const c = k.c;
      if (!S.held[invId]) S.held[invId] = S.asOf; S.disputed[invId] = S.asOf;
      const m = { id: uid('msg'), on: S.asOf, cid: c.id, to: `${c.supplier} (supplier)`, subject: `Invoice ${invId}: ${cm2(c, k.over)} disputed`,
        body: `Dear ${c.billing || 'accounts team'},\n\nInvoice ${invId} for ${k.inv.period} is ${cm2(c, k.over)} above the contract, before GST:\n\n${k.lines.filter(l => l.variance > 0.005).map(l => `- ${l.desc}: ${cm2(c, l.variance)}. ${l.note} (clause ${l.clause})`).join('\n')}\n\nWe are holding that amount and paying the rest on time. Please send a credit note or a corrected invoice.\n\nRegards,\n${D.people.finance}\nFinance, ${D.company}` };
      S.outbox.unshift(m); addLog({ who: who(), cid: c.id, text: `held ${cm(c, k.over)} of invoice ${invId} and sent the dispute to ${c.supplier}.`, msg: m.id });
      addTask({ role: 'owner', cid: c.id, from: who(), title: `Payment to ${c.supplier} is partly on hold`, detail: `Invoice ${invId} is disputed. Tell your supplier contact if they ask.` }); return true; },
    decide(arg) { const [cid, choice] = arg.split('|'), c = byId(cid); if (!c || S.decisions[cid]) return false; const r = renewal(c);
      S.decisions[cid] = { choice, on: S.asOf };
      addLog({ who: who(), cid, text: `recorded the decision to ${{ renew: r.auto ? 'renew as quoted' : 'extend', renegotiate: 'renegotiate', terminate: r.auto ? 'not renew' : 'let it end' }[choice]} for ${c.supplier}.` });
      if (choice === 'renegotiate' && cid !== 'C-001') addTask({ role: 'procurement', cid, from: who(), due: r.auto ? r.deadline : r.end, title: `Prepare the renegotiation with ${c.supplier}`, detail: 'The owner wants better terms before this renews.' });
      if (choice === 'terminate' && r.auto && cid !== 'C-001') addTask({ role: 'legal', cid, from: who(), due: r.deadline, title: `Approve and send the non-renewal notice to ${c.supplier}`, detail: `The notice must reach the supplier by ${fmtD(r.deadline)}.` });
      return true; },
    outcome() { if (S.outcome.B) return false; const c = byId('C-001'), se = $('#rn-seats'), pe = $('#rn-price'), seats = Math.round(Number(se ? se.value : 380)), price = Number(pe ? pe.value : 54);
      if (!(seats > 0) || !(price > 0)) { toast('Enter the seats and the price that were agreed.'); return null; }
      S.outcome.B = { seats, price, on: S.asOf }; addLog({ who: who(), cid: 'C-001', text: `recorded the renegotiated Brightlane terms: ${seats} seats at ${cm2(c, price)} a month.` }); return true; },
    dispatch(cid) { if (S.noticeSent[cid]) return false; S.noticeSent[cid] = S.asOf; addLog({ who: who(), cid, text: 'dispatched the non-renewal notice by courier and emailed a copy.' }); return true; },
    fm(flag) { if (S.steps.C1) return false; if (flag === '1') S.fm[SLA_C] = true; S.steps.C1 = S.asOf; addLog({ who: who(), cid: 'C-003', text: flag === '1' ? "accepted Deccan's force majeure claim, which lowers the September credit." : "did not accept Deccan's force majeure claim: no evidence was sent within 5 days." }); return true; },
    claim(key) { if (S.claims[key]) return false; const c = byId(key.split('|')[0]), s = c && slaRows(c).find(x => x.key === key); if (!s) return false;
      S.claims[key] = S.asOf; if (key === SLA_C && !S.steps.C1) S.steps.C1 = S.asOf;
      const m = { id: uid('msg'), on: S.asOf, cid: c.id, to: `${c.supplier} (supplier)`, subject: `Service credit claim: ${s.sla.name}`, body: `Dear team,\n\n${s.sla.name} was ${s.actual}% against a target of ${s.sla.target}%. Under clause ${s.sla.clause} we claim a credit of ${s.pct}% of charges of ${cm(c, s.h.fee)}, which is ${cm(c, s.credit)}.${s.h.fm && !s.fmOn ? ' We have not left out the consignments you attribute to flooding, because no written evidence was received within 5 days as clause 5.1 requires.' : ''}\n\nPlease show the credit on the next invoice.\n\nRegards,\n${D.people.owner}\n${D.company}` };
      S.outbox.unshift(m); addLog({ who: who(), cid: c.id, text: `sent a service credit claim of ${cm(c, s.credit)} to ${c.supplier}.`, msg: m.id }); return true; },
    confirm(id) { if (S.confirmed[id]) return false; const k = cases().find(x => x.id === id); S.confirmed[id] = { on: S.asOf, by: who() }; addLog({ who: who(), cid: k ? k.c.id : null, text: `confirmed and closed case ${id}.` }); return true; },
    fixRow(cid) { if (S.trackerFixed[cid]) return false; const r = trackerRows().find(x => x.cid === cid); if (!r) return false;
      if (r.waits) { toast('This row waits until Legal has checked the amendment.'); return null; }
      S.trackerFixed[cid] = S.asOf; addLog({ who: who(), cid, text: 'corrected this contract\'s row in the Excel tracker.' }); return true; },
    tracker() { const rows = trackerRows().filter(r => r.ready); if (!rows.length) return false; rows.forEach(r => { S.trackerFixed[r.cid] = S.asOf; }); addLog({ who: who(), text: `updated ${plural(rows.length, 'row')} of the Excel tracker from Countersign.` }); return true; }
  };

  /* ---------- to-do cards ---------- */
  function stepBtns(st) {
    if (st.done) return '';
    if (st.lock) return `<button class="btn sm lockbtn" disabled>${esc(st.lock)}</button>`;
    if (S.role !== st.role) return CS.isAdmin() ? `<button class="btn sm" data-act="role" data-role="${st.role}">This step is for ${ROLE1[st.role]}. Switch to ${ROLE1[st.role]}</button>` : `<span class="locked">Waiting for ${ROLE1[st.role]} · ${esc(D.people[st.role])}</span>`;
    return (st.extra || '') + st.btns.map((b, i) => `<button class="btn sm${i === 0 ? ' primary' : ''}" data-act="store" data-fn="${b.fn}" data-arg="${esc(b.arg)}">${esc(b.label)}</button>`).join('');
  }
  const amountOf = k => k.oneOff ? `${cm(k.oneOff.c, k.oneOff.amt)}${curOf(k.oneOff.c) === 'INR' ? '' : ` <span class="muted sm">${inrC(toInr(k.oneOff.c, k.oneOff.amt))}</span>`}` : k.yearly ? `${cm(k.yearly.c, k.yearly.amt)} <span class="muted sm">a year</span>` : '';
  function todoCard(k, st, side) {
    return `<div class="tcard${side ? ' side' : ''}" data-case="${k.id}">
      <div class="tc-top"><span class="tc-letter">${st.side ? st.id : k.id}</span><div class="tc-title"><a class="rowlink" href="#item-${k.id.toLowerCase()}">${esc(side ? st.title : k.title)}</a><div class="muted sm">${esc(k.c.supplier)} · ${side ? 'side task of case ' + k.id : STAGES[k.stage]}</div></div><div class="tc-amt">${side ? '' : amountOf(k)}</div></div>
      ${side ? `<p class="muted">${esc(st.detail)}</p>` : `<div class="tc-step"><span class="k">Now · ${esc(person(st.role))}${k.priority ? ` · Legal priority ${k.priority}` : ''}</span><strong>${esc(st.title)}</strong><span class="muted">${esc(st.detail)}</span></div>`}
      <div class="tc-foot"><span class="btns">${stepBtns(st)}</span><span class="btns">${isIso(st.due) ? dueChip(diff(st.due, S.asOf)) : ''}<a class="btn sm ghost" href="#item-${k.id.toLowerCase()}">Open the case</a></span></div></div>`;
  }
  const mineOf = (k, role) => { const st = current(k); return !!st && (role === 'all' || st.role === role); };
  const stakeOf = k => k.oneOff ? `${cm(k.oneOff.c, k.oneOff.amt)} at stake` : k.yearly ? `${cm(k.yearly.c, k.yearly.amt)} a year` : k.c.annualValue ? `${cm(k.c, k.c.annualValue)} a year at stake` : '';
  function todoHtml() {
    const all = cases(), role = S.role, cards = []; let closed = 0;
    all.forEach(k => { if (k.closed) { closed++; return; }
      if (mineOf(k, role)) cards.push(todoCard(k, current(k), false));
      k.side.forEach(s => { if (!s.done && !s.lock && (role === 'all' || s.role === role)) cards.push(todoCard(k, s, true)); }); });
    const open = all.filter(k => !k.closed).length;
    return `<section class="panel" id="todo"><div class="panel-head"><div><h2>${role === 'all' ? 'Every open case' : 'Your to-do'}</h2><p class="muted sm">${role === 'all' ? 'One card per case, showing the step that is due now and who has it.' : `${esc(D.people[role])}, ${ROLE1[role]}. One card per case, showing only the step that is yours now.`}</p></div>${pill('info', `${plural(open, 'open case')}${closed ? ', ' + closed + ' closed' : ''}`)}</div>
      <div class="tcards">${cards.join('') || `<p class="empty">${open ? 'Nothing needs you right now. The cases you are part of are listed under "Waiting on others".' : 'Every case is closed.'}</p>`}</div></section>`;
  }
  /* Cases that are with someone else. A department sees only the cases it has a later step in. */
  function waitingHtml() {
    const role = S.role; if (role === 'all') return '';
    const rows = cases().filter(k => !k.closed && !mineOf(k, role) && (CS.isAdmin() || k.steps.concat(k.side).some(s => !s.done && s.role === role)));
    if (!rows.length) return '';
    return `<section class="panel" id="waiting"><div><h2>Waiting on others (${rows.length})</h2><p class="muted sm">Cases you are part of that are with someone else. Nothing to do yet.</p></div>
      <div class="wrows">${rows.map(k => { const st = current(k); return `<a class="wrow" href="#item-${k.id.toLowerCase()}"><strong>${esc(k.title)}</strong><span class="muted sm">${[stakeOf(k), isIso(st.due) ? 'due ' + fmtD(st.due) : ''].filter(Boolean).join(' · ')}</span><span class="wwho">Waiting on ${esc(person(st.role))}. View</span></a>`; }).join('')}</div></section>`;
  }
  const caseBanner = cid => cases().filter(k => k.c.id === cid && !k.closed).map(k => { const st = current(k); return `<a class="casebanner" href="#item-${k.id.toLowerCase()}"><span class="tc-letter">${k.id}</span><span><strong>Open case: ${esc(k.title)}</strong><span class="muted"> · ${STAGES[k.stage]}${st ? ` · now with ${esc(person(st.role))}` : ''}</span></span></a>`; }).join('');

  /* ---------- item page: what to do on the left, the proof on the right ---------- */
  function vItem(letter) {
    const k = cases().find(x => x.id === letter);
    if (!k) return '<div class="panel"><p class="empty">That case does not exist.</p><a class="btn" href="#overview">Back to the to-do list</a></div>';
    const cur = current(k), list = k.steps.concat(k.side);
    return `
    <a class="back" href="#overview">← To-do list</a>
    <div class="chead"><div><div class="eyebrow">Case ${k.id} · ${esc(k.short)} · <a href="${cLink(k.c)}">${esc(k.c.supplier)} ${esc(k.c.id)}</a></div><h1>${esc(k.title)}</h1></div>
      <div class="cmeta two">${k.oneOff ? `<div><span class="k">One-off</span><span class="numv">${cm(k.oneOff.c, k.oneOff.amt)}</span>${k.oneOff.note ? `<span class="muted sm">${esc(k.oneOff.note)}</span>` : ''}</div>` : ''}<div><span class="k">Yearly</span><span class="numv">${k.yearly ? cm(k.yearly.c, k.yearly.amt) : '—'}</span>${k.yearlyNote ? `<span class="muted sm">${esc(k.yearlyNote)}</span>` : ''}</div></div></div>
    <ol class="stages" aria-label="Stage">${STAGES.map((s, i) => `<li class="${i < k.stage || (k.closed && i <= k.stage) ? 'done' : i === k.stage ? 'on' : ''}">${s}</li>`).join('')}</ol>
    ${k.closedNote ? `<p class="okline">${pill('ok', 'Closed')} ${esc(k.closedNote)}</p>` : ''}
    <div class="item">
      <section class="panel" id="happened"><h2>What happened</h2><p>${esc(k.happened)}</p></section>
      <section class="panel" id="steps"><div class="panel-head"><h2>What to do</h2><button class="btn sm ghost" data-act="csv" data-what="item" data-id="${k.id}">Download the working (CSV)</button></div>
        <div class="steps">${list.map(st => { const state = st.done ? 'done' : st.lock ? 'locked' : st === cur || st.side ? 'now' : 'later';
          return `<div class="stp ${state}" data-step="${st.id}"><span class="stp-dot">${st.done ? '✓' : st.id}</span><div class="stp-main"><span class="k">${esc(person(st.role))}${st.side ? ' · side task' : ''}</span><strong>${esc(st.title)}</strong><span class="muted">${esc(st.detail)}</span>
            ${state === 'done' ? '<span class="check">Done</span>' : state === 'locked' ? `<span class="locked">${esc(st.lock)}</span>` : state === 'now' ? `<span class="btns">${stepBtns(st)} ${isIso(st.due) ? dueChip(diff(st.due, S.asOf)) : ''}</span>` : '<span class="muted sm">Opens when the step before it is done.</span>'}</div></div>`; }).join('')}</div>
      </section>
      <section class="panel" id="proof"><div class="panel-head"><h2>The proof</h2>${CS.src('calc')}</div>${k.proof()}</section>
    </div>`;
  }

  /* ---------- value page ---------- */
  function vValue() {
    const ks = cases(), A = attention().filter(a => a.recover && !caseOf(a.id));
    const sum = (f, conf) => ks.reduce((s, k) => { const v = k[f]; return s + (v && (!conf || S.confirmed[k.id]) ? toInr(v.c, v.amt) : 0); }, 0);
    const rep = ks.filter(k => k.repeat), gst = ks.filter(k => k.gst);
    return `
    <div class="head"><h1>Value</h1><p class="sub">What the cases are worth. One-off amounts and yearly amounts are different kinds of money, so they are shown side by side and never added together. ${CS.src('calc')}</p></div>
    <div class="kpis" id="value-tiles">
      <div class="tile"><div class="k">One-off · found</div><div class="v">${inrC(sum('oneOff'))}</div><div class="s">Credits and overbilling in open and closed cases</div></div>
      <div class="tile"><div class="k">One-off · confirmed</div><div class="v">${inrC(sum('oneOff', true))}</div><div class="s">Confirmed by Finance</div></div>
      <div class="tile"><div class="k">Yearly · found</div><div class="v">${inrC(sum('yearly'))}</div><div class="s">Only a renegotiation counts</div></div>
      <div class="tile"><div class="k">Yearly · confirmed</div><div class="v">${inrC(sum('yearly', true))}</div><div class="s">Confirmed by Finance</div></div>
    </div>
    <section class="panel flush"><div class="pad panel-head"><h2>By case</h2><button class="btn sm ghost" data-act="csv" data-what="value">Download as CSV</button></div>
      <div class="scroll"><table class="t"><thead><tr><th>Case</th><th>Stage</th><th class="num">One-off</th><th class="num">Yearly</th><th>Counted as</th></tr></thead><tbody>
      ${ks.map(k => `<tr><td><a class="rowlink" href="#item-${k.id.toLowerCase()}">${k.id} · ${esc(k.title)}</a><div class="muted sm">${esc(k.c.supplier)}</div></td><td class="nowrap">${k.closed && !S.confirmed[k.id] ? 'Closed' : STAGES[k.stage]}</td>
        <td class="num">${k.oneOff ? cm(k.oneOff.c, k.oneOff.amt) + (curOf(k.oneOff.c) === 'INR' ? '' : `<div class="muted sm">${inrC(toInr(k.oneOff.c, k.oneOff.amt))}</div>`) : '—'}</td>
        <td class="num">${k.yearly ? cm(k.yearly.c, k.yearly.amt) + `<div class="muted sm">${inrC(toInr(k.yearly.c, k.yearly.amt))}</div>` : '—'}${k.yearlyNote && !k.yearly ? `<div class="muted sm">${esc(k.closedNote || k.yearlyNote)}</div>` : ''}</td>
        <td>${S.confirmed[k.id] && (k.oneOff || k.yearly) ? pill('ok', 'Confirmed') : k.oneOff || k.yearly ? pill('info', 'Found') : pill('mute', 'No value')}</td></tr>`).join('')}
      </tbody></table></div></section>
    <div class="split">
      <section class="panel" id="value-apart"><h2>Shown apart from confirmed value</h2><p class="muted sm">These are real, but they are not money recovered, so they stay out of the totals above.</p>
        <h3>Repeat overcharges prevented</h3>${rep.length ? `<ul class="plain">${rep.map(k => `<li><strong>${both(k.repeat.c, k.repeat.amt)}</strong> · case ${k.id}: ${esc(k.repeat.note)}.</li>`).join('')}</ul>` : '<p class="muted">None.</p>'}
        <h3>GST on the disputed amounts ${asm('A10')}</h3>${gst.length ? `<ul class="plain">${gst.map(k => `<li><strong>${inr(k.gst)}</strong> · case ${k.id}: ${GST}% on ${cm(k.oneOff.c, k.oneOff.amt)}. It comes back through the credit note, not as a saving.</li>`).join('')}</ul>` : ''}
      </section>
      <section class="panel"><h2>Other amounts found, not yet a case</h2><p class="muted sm">From the action list. They count as found only once someone opens a case.</p>
        ${A.length ? `<ul class="plain">${A.map(a => `<li><strong>${inrC(a.amount)}</strong> · ${esc(a.title)}</li>`).join('')}</ul>` : '<p class="muted">None.</p>'}</section>
    </div>`;
  }

  /* ---------- the Excel tracker ---------- */
  function trackerRows() {
    return D.tracker.map(t => { const c = byId(t.cid); if (!c) return null; const r = renewal(c), ow = ownerOf(c);
      const truth = { end: fmtD(c.end), notice: c.autoRenew ? `${c.noticeDays} days` : 'No auto-renewal', price: c.price || '', owner: ow.left || !ow.name ? 'Unassigned' : ow.name };
      const wrong = ['end', 'notice', 'price', 'owner'].filter(f => t[f] !== truth[f]);
      const waits = t.cid === 'C-002' && !isVerified(c, term(c, 'Bill rates'));
      const fixed = !!S.trackerFixed[t.cid];
      return { cid: t.cid, c, t, truth, wrong, waits, fixed, ready: wrong.length > 0 && !fixed && !waits, status: statusOf(c).text, r };
    }).filter(Boolean);
  }
  const trackerCsv = () => [['Contract', 'Supplier', 'Term ends', 'Notice', 'Price', 'Owner']].concat(trackerRows().filter(r => !r.waits).map(r => [r.cid, r.c.supplier, r.truth.end, r.truth.notice, r.truth.price, r.truth.owner]));
  function trackerHtml() {
    const rows = trackerRows(), ready = rows.filter(r => r.ready).length, missing = contracts().filter(c => !D.tracker.some(t => t.cid === c.id));
    const cell = (r, f) => { const bad = r.wrong.includes(f); if (!bad) return esc(r.t[f]); if (r.fixed) return `${esc(r.truth[f])}<div class="muted sm">was ${esc(r.t[f])}</div>`; return `<span class="badcell">${esc(r.t[f])}</span><div class="muted sm">contract says ${esc(r.truth[f])}</div>`; };
    return `<section class="panel flush" id="tracker"><div class="pad panel-head"><div><h2>The Excel tracker, checked against the contracts</h2><p class="muted sm">The company's spreadsheet as it stands today. Cells that disagree with the contract are marked. ${CS.src('sample')} ${CS.src('calc')}</p></div>
      <span class="btns"><button class="btn sm primary" data-act="store" data-fn="tracker" data-arg="" ${ready && CS.can('tracker') ? '' : 'disabled'}>Update the tracker from Countersign${ready ? ` (${plural(ready, 'row')})` : ''}</button><button class="btn sm" data-act="copy-tracker">Copy corrected rows</button><button class="btn sm ghost" data-act="csv" data-what="tracker">Download CSV</button></span></div>
      <div class="scroll"><table class="t"><thead><tr><th>Supplier</th><th>Term ends</th><th>Notice</th><th>Price</th><th>Owner</th><th>Tracker row</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td><a class="rowlink" href="${cLink(r.c)}">${esc(r.c.supplier)}</a><div class="muted sm">${r.cid}</div></td><td>${cell(r, 'end')}</td><td>${cell(r, 'notice')}</td><td>${cell(r, 'price')}</td><td>${cell(r, 'owner')}</td>
        <td>${r.waits ? pill('mute', 'Waiting for Legal to check Amendment No. 2') : r.fixed ? pill('ok', 'Corrected ' + fmtD(S.trackerFixed[r.cid])) : r.wrong.length ? pill('crit', plural(r.wrong.length, 'wrong cell')) : pill('ok', 'Matches')}</td></tr>`).join('')}
      ${missing.map(c => `<tr><td><a class="rowlink" href="${cLink(c)}">${esc(c.supplier)}</a><div class="muted sm">${c.id}</div></td><td colspan="4" class="muted">Not in the tracker at all</td><td>${pill('crit', 'Missing row')}</td></tr>`).join('')}
      </tbody></table></div>
      <p class="pad muted sm">"Update the tracker" records the fix here. A web page cannot edit a spreadsheet on your computer, so "Copy corrected rows" puts the right values on the clipboard to paste into Excel.</p></section>`;
  }
  const contractsCsv = () => [['Contract', 'Supplier', 'Country', 'Currency', 'Type', 'Owner', 'Term ends', 'Notice deadline', 'Yearly value', 'Yearly value in rupees', 'Status']].concat(contracts().map(c => { const r = renewal(c), ow = ownerOf(c); return [c.id, c.supplier, c.country || '', curOf(c), c.category, ow.left || !ow.name ? 'Unassigned' : ow.name, r.end || '', r.auto ? r.deadline : '', c.annualValue || '', c.annualValue ? Math.round(toInr(c, c.annualValue)) : '', statusOf(c).text]; }));
  const valueCsv = () => [['Case', 'Title', 'Supplier', 'Stage', 'One-off', 'One-off currency', 'Yearly', 'Yearly currency', 'Confirmed', 'Repeat overcharge prevented (rupees)', 'GST (rupees)']].concat(cases().map(k => [k.id, k.title, k.c.supplier, STAGES[k.stage], k.oneOff ? Math.round(k.oneOff.amt) : '', k.oneOff ? curOf(k.oneOff.c) : '', k.yearly ? Math.round(k.yearly.amt) : '', k.yearly ? curOf(k.yearly.c) : '', S.confirmed[k.id] ? 'Yes' : 'No', k.repeat ? Math.round(toInr(k.repeat.c, k.repeat.amt)) : '', k.gst ? Math.round(k.gst) : '']));
  function csv(what, id) {
    if (what === 'item') { const k = cases().find(x => x.id === id); if (k) download(`countersign-case-${id.toLowerCase()}.csv`, toCsv(k.csv())); }
    if (what === 'value') download('countersign-value.csv', toCsv(valueCsv()));
    if (what === 'contracts') download('countersign-contracts.csv', toCsv(contractsCsv()));
    if (what === 'tracker') download('countersign-tracker-corrected.csv', toCsv(trackerCsv()));
  }
  function copyTracker() { const text = trackerCsv().map(r => r.join('\t')).join('\n'); try { navigator.clipboard.writeText(text).then(() => toast('Corrected rows copied. Paste them into Excel.'), () => toast('Copying is not available in this view. Use Download CSV.')); } catch (e) { toast('Copying is not available in this view. Use Download CSV.'); } }

  /* ---------- assumptions A1 to A10 and the notes on choices made ---------- */
  function assumptions() {
    const docs = contracts().reduce((s, c) => s + c.docs.length, 0);
    return { A1: `The sample is ${contracts().length} suppliers and ${docs} documents, counted from the data. The real company has about 2,500 suppliers.`,
      A2: `An Indian company with books in rupees and a financial year from April to March. Dollar and pound amounts use fixed sample rates of ₹${D.fx.USD} and ₹${D.fx.GBP}.`,
      A3: 'Finance can export the payments ledger and invoice lines. Amounts are compared before GST and before tax deducted at source.',
      A4: 'Timesheets and sign-on data are available as data, so billed roles and licence use can be checked.',
      A5: 'Service-level results arrive as data from the supplier or an internal report.',
      A6: 'Contracts are in English. Scans are read by OCR, up to 12 pages at a time.',
      A7: 'An international courier takes 3 working days. Working days are Monday to Friday; public holidays are ignored.',
      A8: 'Every contract has one named owner, and five people hold the roles in this prototype.',
      A9: 'Company policy allows contract text and page images to be sent to an AI model. AI output shown on case pages is recorded; elsewhere it is live.',
      A10: 'The Indian law shown is simplified and is not legal advice. GST is worked out at 18% for the staffing case only.' };
  }
  const notesHtml = () => `<ul>
      <li><strong>One card per case.</strong> The to-do list shows only the current step of each case. Cases that are with someone else are listed under "Waiting on others". Case A also shows the travel charge (A4) as a side card once Legal has checked the rate.</li>
      <li><strong>Steps wait for Legal.</strong> Sahyadri steps from the role check onward show "Locked: waiting for Legal to check the rate". A step that belongs to someone else reads "This step is for Legal. Switch to Legal".</li>
      <li><strong>Brightlane dispatch date.</strong> The notice must be received by 30 Nov 2026. The card asks Procurement to dispatch 3 working days earlier, the courier time in the lead-time breakdown.</li>
      <li><strong>Brightlane decisions.</strong> "Renew as quoted" and "Don't renew" close or shorten the case and count no saving. Only a renegotiation counts value.</li>
      <li><strong>Deccan Freightways.</strong> The claim defaults to not accepting force majeure, because clause 5.1 needs evidence within 5 days and none was sent. Accepting it lowers the credit.</li>
      <li><strong>Stratus Cloud.</strong> Two months of the Q4 discount are still ahead (November and December), which is how its 10-point Legal priority is worked out: 5 points a month, capped at 20.</li>
      <li><strong>Excel tracker.</strong> "Update the tracker from Countersign" records the fix. A web page cannot edit a spreadsheet, so there is also "Copy corrected rows". The Sahyadri row waits until Legal has checked Amendment No. 2.</li>
      <li><strong>Value page.</strong> One-off and yearly amounts are shown side by side and never added together. Repeat overcharges prevented and GST are shown apart from confirmed value.</li>
      <li><strong>Stage names.</strong> Every case passes through "Confirmed by Finance", even when the person who confirmed was the business owner or Procurement, and closes at "Fixed at source", once the tracker is corrected or the next invoice comes in right.</li>
      <li><strong>Counts in assumption A1</strong> come from the data, not from a typed figure.</li>
      <li><strong>Dark mode.</strong> Status colours are lightened so text stays readable, and the dark blue buttons become a lighter blue.</li>
      <li><strong>Sample contracts.</strong> The documents are short clause extracts written for this prototype. Real contracts are longer and more formal, with a dated preamble, named parties and recitals. Nothing was copied from any source.</li>
      <li><strong>Tour.</strong> Four chapters. Each follows one case through every person, switching who you are as it goes. Each step rings one area of the page and a side panel explains it (a bottom sheet on phones). "Do it for me" calls the same action as the button and says "Already done" if you got there first. Choosing a tab mid-tour asks "Leave the tour?". The tour is for Admin, because it switches between roles.</li>
      <li><strong>Welcome and sign-in.</strong> A first screen explains the idea, then one sign-in page with the details already filled in and a drop-down of who to sign in as. Finance, Legal, Procurement and the business owner see only their own tasks and queues. Admin sees everything and can act as any role. The sign-in is simulated and is not real security.</li>
      <li><strong>Layout.</strong> Pages use the full width on large screens. Case pages are two columns on laptops (what to do on the left, the proof on the right) and one column on phones.</li>
      <li><strong>Assumption tags.</strong> The dashed yellow tags A1 to A10 are used only for assumptions, so they never read as a status or a money gap.</li>
      <li><strong>Excel files.</strong> Case pages, Contracts and Value offer CSV files that open in Excel.</li>
      <li><strong>People.</strong> All names are invented. The five role holders are Ritika Deshmukh (Finance), Rushikesh Kulkarni (Legal), Yash Patil (Procurement), Anuj Shinde (business owner) and Udit Pawar (Sahyadri billing).</li>
    </ul>`;

  Object.assign(CS, { STAGES, cases, caseOf, store, todoHtml, waitingHtml, caseBanner, vItem, vValue, trackerHtml, csv, copyTracker, assumptions, notesHtml });
})();
