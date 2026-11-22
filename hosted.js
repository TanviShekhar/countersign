/* Countersign hosted mode: when the page is not running inside Claude (for example on GitHub Pages),
   AI features can use a Claude API key the viewer supplies. The key stays in this browser tab and is
   sent only to the Claude API. For production, these calls belong behind a server (see the README). */
(() => {
  'use strict';
  const CS = window.CS;
  const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.136.0/+esm';
  const MODEL = 'claude-opus-5-5';
  const STORE = 'countersign.apikey';
  let Anthropic = null;

  async function loadSdk() {
    if (!Anthropic) { const m = await import(SDK_URL); Anthropic = m.default || m.Anthropic; }
    if (!Anthropic) throw { code: 'upstream_error', message: 'The Claude SDK did not load.' };
    return Anthropic;
  }
  const b64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = () => rej({ code: 'image_rejected' }); r.readAsDataURL(blob); });
  /* Turn an SDK error into the same {code, message, text} shape the rest of the page already handles. */
  function fail(e, text) {
    if (e && e.code && !e.status && typeof e.code === 'string' && !(Anthropic && e instanceof Anthropic.APIError)) return Object.assign({ text }, e);
    let code = 'upstream_error';
    if (Anthropic) {
      if (e instanceof Anthropic.APIUserAbortError) code = 'cancelled';
      else if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) code = 'bad_key';
      else if (e instanceof Anthropic.RateLimitError) code = 'rate_limited';
      else if (e instanceof Anthropic.BadRequestError) code = /too long|too large/i.test(e.message || '') ? 'prompt_too_large' : 'upstream_error';
      else if (e instanceof Anthropic.APIConnectionError) code = 'network';
    }
    if (e && e.name === 'AbortError') code = 'cancelled';
    return { code, message: (e && e.message) || '', text: text || undefined };
  }
  function parseJson(text) {
    const tries = [text, (text.match(/```(?:json)?\s*([\s\S]*?)```/) || [])[1]];
    const a = text.search(/[\[{]/), b = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']')); if (a >= 0 && b > a) tries.push(text.slice(a, b + 1));
    for (const t of tries) { if (!t) continue; try { return JSON.parse(t); } catch (e) { /* try the next shape */ } }
    throw { code: 'invalid_json', message: 'No JSON value in the reply.', text };
  }

  function makeSample(client) {
    async function sample(input, opts) {
      opts = opts || {};
      const messages = (typeof input === 'string' ? [{ role: 'user', content: input }] : input).map(t => ({ role: t.role, content: t.content }));
      if (opts.images) {
        const blobs = [].concat(Array.from(opts.images)), last = messages[messages.length - 1], blocks = [];
        for (const bl of blobs) blocks.push({ type: 'image', source: { type: 'base64', media_type: bl.type || 'image/jpeg', data: await b64(bl) } });
        last.content = blocks.concat([{ type: 'text', text: last.content }]);
      }
      let text = '';
      try {
        /* Fallbacks are on: if the model declines a request, the API re-runs it on a fallback model in the same call. */
        const stream = client.beta.messages.stream({ model: MODEL, max_tokens: 16000, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default', messages }, { signal: opts.signal });
        for await (const ev of stream) {
          if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') { text += ev.delta.text; if (opts.onText && text.trim()) opts.onText({ text, delta: ev.delta.text }); }
        }
        const msg = await stream.finalMessage();
        if (msg.stop_reason === 'refusal') throw { code: 'refused', message: 'The request was declined.' };
        const out = msg.content.filter(bk => bk.type === 'text').map(bk => bk.text).join('');
        if (!out.trim()) throw { code: 'empty_completion', message: 'No text came back.' };
        return { text: out, truncated: msg.stop_reason === 'max_tokens', modelTierApplied: 'default' };
      } catch (e) { throw fail(e, text); }
    }
    sample.json = async (input, opts) => parseJson((await sample(input, opts)).text);
    /* No page tools in hosted mode, so the agent uses its plan-then-act path. */
    sample.limits = async () => ({ maxPromptBytes: 262144, images: { maxCount: 4, maxInputBytes: 20e6, mediaTypes: ['image/jpeg', 'image/png', 'image/webp'] } });
    return sample;
  }

  /* Checks the key with a free call to the Models API, then switches the page's AI features on. */
  async function connect(apiKey, remember) {
    apiKey = String(apiKey || '').trim();
    if (!apiKey) throw { code: 'bad_key' };
    let A;
    try { A = await loadSdk(); } catch (e) { throw { code: 'network', message: 'The Claude SDK could not be loaded.' }; }
    const client = new A({ apiKey, dangerouslyAllowBrowser: true });
    try { await client.models.retrieve(MODEL); } catch (e) { throw fail(e); }
    try { if (remember) sessionStorage.setItem(STORE, apiKey); else sessionStorage.removeItem(STORE); } catch (e) { /* optional */ }
    CS.ai.via = 'key'; CS.setAi(makeSample(client));
  }
  function forget() { try { sessionStorage.removeItem(STORE); } catch (e) { /* optional */ } CS.ai.via = null; CS.setAi(null); }
  function restore() { let k = null; try { k = sessionStorage.getItem(STORE); } catch (e) { k = null; } if (k) connect(k, true).catch(() => forget()); }

  CS.hosted = { connect, forget, restore, MODEL };
})();
