/* Countersign: routing, events and start-up. */
(() => {
  'use strict';
  const CS = window.CS;
  const { D, $, isIso, fmtD, S, save, resetState, byId, ROLE1, who, addLog, addTask, renewal, invoiceChecks, cLink, verifiedKey, findClause, toInr, inrC, toast, setAi } = CS;

  const TABS = [['overview', 'Overview'], ['contracts', 'Contracts'], ['renewals', 'Renewals'], ['invoices', 'Invoice check'], ['ask', 'Ask'], ['add', 'Add a contract'], ['agent', 'Agent'], ['value', 'Value'], ['case', 'The case']];
  function route() { const h = (location.hash || '').slice(1); if (h.startsWith('contract-')) return { name: 'contract', id: h.slice(9).toUpperCase() }; if (h.startsWith('item-')) return { name: 'item', id: h.slice(5).toUpperCase() }; return { name: TABS.some(t => t[0] === h) ? h : 'overview' }; }
  let lastRoute = '';
  function render(scrollClause) {
    if (!S.user) return; /* the welcome and sign-in screens are showing */
    const rt = route(), key = rt.name + (rt.id || '');
    if (rt.name !== 'contract' && rt.name !== 'item' && !CS.canSee(rt.name)) { location.hash = '#overview'; return; }
    const wh = $('#whoami'); if (wh && S.user) wh.textContent = CS.USERS[S.user].name === 'Admin' ? 'Admin' : `${CS.USERS[S.user].name} · ${CS.USERS[S.user].label}`;
    const tb = $('#tourbtn'); if (tb) tb.hidden = !CS.isAdmin();
    $('#tabs').innerHTML = TABS.filter(([k]) => CS.canSee(k)).map(([k, label]) => { const n = k === 'agent' ? S.approvals.filter(a => a.status === 'pending').length : 0;
      return `<a href="#${k}" class="tab${rt.name === k || (rt.name === 'contract' && k === 'contracts') || (rt.name === 'item' && k === 'overview') ? ' on' : ''}"${rt.name === k ? ' aria-current="page"' : ''}>${label}${n ? ` <span class="count">${n}</span>` : ''}</a>`; }).join('');
    const view = $('#view'), V = { overview: CS.vOverview, contracts: CS.vContracts, renewals: CS.vRenewals, invoices: CS.vInvoices, ask: CS.vAsk, add: CS.vAdd, agent: CS.vAgent, value: CS.vValue, case: CS.vCase };
    view.innerHTML = rt.name === 'contract' ? CS.vContract(rt.id) : rt.name === 'item' ? CS.vItem(rt.id) : V[rt.name]();
    if (rt.name === 'contracts') CS.paintList();
    if (rt.name === 'ask') CS.paintChat();
    if (rt.name === 'agent') CS.paintRun();
    const asof = $('#asof'); if (asof && asof.value !== S.asOf) asof.value = S.asOf;
    $('#asof-reset').hidden = S.asOf === D.asOf;
    const fresh = rt.name === 'contract' && S.hl && S.hl.fresh && S.hl.id === rt.id;
    if (key !== lastRoute) { lastRoute = key; if (!scrollClause && !fresh) window.scrollTo(0, 0); }
    if (rt.name === 'contract' && (scrollClause || fresh)) { const el = view.querySelector('.clause.on'); if (el) el.scrollIntoView({ block: 'center', behavior: 'auto' }); if (S.hl) S.hl.fresh = false; }
    if (rt.name === 'case' && S.asmFocus) { const el = $('#asm-' + S.asmFocus); S.asmFocus = null; if (el) { el.classList.add('flash'); el.scrollIntoView({ block: 'center', behavior: 'auto' }); } }
    CS.tourRing();
  }
  CS.render = render;
  function goClause(id, clause, quote) {
    const c = byId(id); if (!c) return; const f = findClause(c, clause);
    if (f) { S.doc[id] = f.di; S.hl = { id, clause: f.cl.n, quote: quote || '', fresh: true }; }
    const target = cLink(c); if (location.hash === target) render(true); else location.hash = target;
  }

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const act = el.dataset.act, id = el.dataset.id;
    const need = { verify: 'verify', decide: 'decide', undecide: 'decide', hold: 'pay', paid: 'pay', claim: 'claim' }[act];
    if (need && !CS.can(need)) { toast('That belongs to another team, so this sign-in cannot do it.'); return; }
    switch (act) {
      case 'role': if (CS.isAdmin()) { S.role = el.dataset.role; render(); } break;
      case 'engine': S.engine = el.dataset.engine; save(); render(); break;
      case 'ai-connect': if (CS.ai.sample && CS.ai.via !== 'key') { toast('AI is already connected through Claude.'); break; } $('#ai-err').hidden = true; $('#aidlg').hidden = false; $('#ai-key').focus(); break;
      case 'ai-close': $('#aidlg').hidden = true; break;
      case 'ai-forget': CS.hosted.forget(); $('#ai-key').value = ''; $('#aidlg').hidden = true; toast('AI disconnected.'); render(); break;
      case 'ai-save': { const err = $('#ai-err'); err.hidden = true; el.disabled = true; el.textContent = 'Checking the key…';
        CS.hosted.connect($('#ai-key').value, $('#ai-remember').checked).then(() => { $('#ai-key').value = ''; $('#aidlg').hidden = true; toast('AI connected with your API key.'); render(); },
          x => { err.textContent = CS.aiCopy(x); err.hidden = false; }).then(() => { el.disabled = false; el.textContent = 'Connect'; }); break; }
      case 'attn': S.attn = el.dataset.f; render(); break;
      case 'cat': S.cat = el.dataset.cat; document.querySelectorAll('#cats .chip').forEach(b => b.classList.toggle('on', b.dataset.cat === S.cat)); CS.paintList(); break;
      case 'cite': e.preventDefault(); goClause(id, el.dataset.clause); break;
      case 'hl': goClause(id, el.dataset.clause, el.dataset.quote); break;
      case 'doc': S.doc[id] = Number(el.dataset.i); S.hl = null; render(); break;
      case 'verify': { const c = byId(id), t = c && c.terms[Number(el.dataset.i)]; if (t) { S.verified[verifiedKey(c, t)] = true; addLog({ who: who(), cid: c.id, text: `confirmed the term "${t.label}" against §${t.clause || 'the contract'}.` }); save(); render(); } break; }
      case 'decide': { const r = CS.store.decide(id + '|' + el.dataset.choice); save(); render(); if (r) toast('Decision recorded.'); break; }
      case 'store': { const r = CS.store[el.dataset.fn](el.dataset.arg); if (r === false) toast('Already done.'); if (r !== null) { save(); render(); } break; }
      case 'csv': CS.csv(el.dataset.what, id); break;
      case 'copy-tracker': CS.copyTracker(); break;
      case 'asm': e.preventDefault(); S.asmFocus = id; if (location.hash === '#case') render(); else location.hash = '#case'; break;
      case 'undecide': delete S.decisions[id]; addLog({ who: who(), cid: id, text: 'reopened the renewal decision.' }); save(); render(); break;
      case 'claim': { const k = el.dataset.k; if (S.claims[k]) delete S.claims[k]; else S.claims[k] = S.asOf; save(); render(); break; }
      case 'hold': { const k = invoiceChecks().find(x => x.inv.id === id);
        if (S.held[id]) { delete S.held[id]; addLog({ who: who(), cid: k && k.c ? k.c.id : null, text: `released the hold on invoice ${id}.` }); }
        else { S.held[id] = S.asOf; addLog({ who: who(), cid: k && k.c ? k.c.id : null, text: `put ${k && k.over > 0.005 ? inrC(toInr(k.c, k.over)) + ' of ' : ''}invoice ${id} on hold.` });
          if (k && k.c) addTask({ role: 'owner', cid: k.c.id, from: who(), title: `Payment to ${k.inv.supplier} is on hold`, detail: `Invoice ${id} is being queried by Finance. Tell your supplier contact if they ask.` }); }
        save(); render(); break; }
      case 'paid': if (S.paid[id]) delete S.paid[id]; else { S.paid[id] = S.asOf; addLog({ who: who(), text: `marked invoice ${id} as paid.` }); } save(); render(); break;
      case 'inv-toggle': { const k = invoiceChecks().find(x => x.inv.id === id); const cur = S.open[id] != null ? S.open[id] : (k && k.status === 'variance'); S.open[id] = !cur; render(); break; }
      case 'task-done': { const t = S.tasks.find(x => x.id === id); if (t) { t.done = true; addLog({ who: who(), cid: t.cid, text: `completed the task "${t.title}".` }); save(); render(); } break; }
      case 'draft': CS.runDraft(el.dataset.kind, id, el.dataset.extra, false); break;
      case 'draft-redo': if (S.draft) CS.runDraft(S.draft.kind, S.draft.id, S.draft.extra, true); break;
      case 'draft-stop': case 'ai-stop': CS.abort(); break;
      case 'draft-submit': CS.submitDraft(); break;
      case 'draft-copy': { const text = S.draft ? S.draft.text : ''; const fallback = () => { const r = document.createRange(); r.selectNodeContents($('#dr-body')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Text selected. Press copy.'); };
        try { navigator.clipboard.writeText(text).then(() => toast('Copied.'), fallback); } catch (err) { fallback(); } break; }
      case 'drawer-close': CS.closeDrawer(); break;
      case 'ask-chip': CS.ask(el.dataset.q); break;
      case 'ask-q': S.pendingQ = el.dataset.q; S.scope = 'all'; location.hash = '#ask'; break;
      case 'ask-about': S.scope = id; location.hash = '#ask'; break;
      case 'sample-load': CS.resetAdd(); S.add.text = D.samples[Number(el.dataset.i)].text; render(); break;
      case 'scan-sample': CS.scanSample(); break;
      case 'extract': CS.extract(); break;
      case 'add-reset': CS.resetAdd(); render(); break;
      case 'save-contract': CS.saveContract(); break;
      case 'remove-added': S.added = S.added.filter(c => c.id !== id); delete S.decisions[id]; S.tasks = S.tasks.filter(t => t.cid !== id); save(); toast('Contract removed.'); location.hash = '#contracts'; break;
      case 'sweep': CS.runSweep(); break;
      case 'sweep-stop': if (CS.sweepCtl) CS.sweepCtl.abort(); break;
      case 'approve': CS.decideApproval(id, true); break;
      case 'reject': CS.decideApproval(id, false); break;
      case 'view-approval': { const a = S.approvals.find(x => x.id === id); if (a) CS.showMessage({ subject: a.subject || CS.ACT[a.action].label, to: `${a.supplier} (supplier)`, on: a.on, body: a.message }, true); break; }
      case 'view-msg': { const m = S.outbox.find(x => x.id === id); if (m) CS.showMessage(m, false); break; }
      case 'undo': CS.undoLog(id); break;
      case 'asof-reset': S.asOf = D.asOf; render(); break;
      case 'reset': if (!S.resetArmed) { S.resetArmed = true; el.textContent = 'Select again to clear your changes'; setTimeout(() => { S.resetArmed = false; el.textContent = 'Reset sample data'; }, 4000); }
        else { const u = S.user; resetState(); S.user = u; S.role = u ? CS.USERS[u].role : 'all'; save(); S.run = null; S.resetArmed = false; el.textContent = 'Reset sample data'; toast('Sample data restored.'); if (route().name === 'contract' && !byId(route().id)) location.hash = '#contracts'; else render(); } break;
    }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'q') { S.q = e.target.value; CS.paintList(); }
    if (e.target.id === 'addtext') S.add.text = e.target.value;
    if (e.target.id === 'askq') S.pendingQ = e.target.value;
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'asof' && isIso(t.value)) { S.asOf = t.value; render(); }
    if (t.id === 'scope') S.scope = t.value;
    if (t.id === 'addfile' && t.files && t.files[0]) CS.handleFile(t.files[0]);
    if (t.dataset && t.dataset.pol) { const k = t.dataset.pol; S.policy[k] = Object.assign({}, CS.policy(k), { mode: t.value }); save(); toast(`Rule updated: ${CS.ACT[k].label.toLowerCase()} is now "${t.options[t.selectedIndex].text}".`); }
    if (t.dataset && t.dataset.lim) { const k = t.dataset.lim, n = Math.max(0, Number(t.value) || 0); S.policy[k] = Object.assign({}, CS.policy(k), { limit: n }); save(); toast(`Limit updated to ${inrC(n)}.`); }
  });
  document.addEventListener('submit', e => { if (e.target.id === 'askform') { e.preventDefault(); CS.ask($('#askq').value); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.draft) CS.closeDrawer(); });
  window.addEventListener('hashchange', () => render());

  CS.renderGate();
  render();
  try {
    const off = () => { setAi(null); CS.hosted.restore(); };
    if (window.claude && typeof window.claude.use === 'function') window.claude.use('sample').then(fn => { if (typeof fn === 'function') setAi(fn); else off(); }, off);
    else off();
  } catch (e) { setAi(null); }
})();
