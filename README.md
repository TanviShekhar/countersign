# Countersign

A working prototype of an AI-read supplier contract repository, built for a contracting case study.
It covers the "intelligent repository" stage of the contract lifecycle: one searchable source of
truth for every signed contract, with the next step put in front of the person who owns it.

Everything in it is fictional: the company (Vindhya Consumer Brands, an invented Indian company),
its eight suppliers, the twelve contract documents, the people and every figure.

## What it does

- **To-do list:** one card per case, showing only the step that is due now.
- **Contracts:** key terms linked to the clause they came from, amendments applied, search inside clause text.
- **Renewals:** notice deadlines worked back into a date for each person.
- **Invoice check:** each invoice line compared with the contract price, in the contract's currency.
- **Scans:** scanned PDFs and photos are read into text by AI, then the terms are extracted.
- **Agent:** a sweep that does routine actions itself, asks before anything binding, and hands the rest to a person.
- **Value:** one-off and yearly amounts side by side, with repeat overcharges and GST shown apart.
- **The case:** why this stage, the stakeholder map, the problem, the flows, assumptions and success metrics.

## Signing in

The sign-in is simulated. It is there to show what each team would see, and it is not security.
Every account uses the password `test`.

| Sign in as | Username | What you see |
|---|---|---|
| Admin | `admin` | Everything: all queues, the agent, value and the case. Can act as any role. |
| Finance (Ritika Deshmukh) | `finance` | Invoice checks, payment holds, rebates, Finance approvals, value. |
| Legal (Rushikesh Kulkarni) | `legal` | Terms to confirm, notices to approve, compliance gaps, adding contracts. |
| Procurement (Yash Patil) | `procurement` | Renegotiations, coverage gaps, missing documents, renewals, the Excel tracker. |
| Business owner (Anuj Shinde) | `owner` | Renewal decisions, service credits, the contracts he owns. |

There is one sign-in page. The details are filled in already: pick a person from the drop-down and
select Sign in. An address such as `#login-finance` opens the page with that person selected.

## Running the agent sweep when hosted

The sweep has two ways to decide, chosen on the Agent tab:

1. **Built-in rules.** Fixed logic and standard wording. Needs no AI and works on any static host,
   including GitHub Pages. The same rules, approvals, limits and activity log apply.
2. **Claude AI.** Claude reads each open item, writes each message to fit, and gives its reasons.
   - Inside Claude (the published artifact), this uses the viewer's own Claude with no setup.
   - On a hosted copy, select **Connect AI** and paste a Claude API key. The page then calls the
     Claude API from the browser through the official SDK. The key is kept in the browser tab
     (session storage, only if you tick the box) and is sent only to the Claude API.

Putting an API key in a browser is fine for a demo and wrong for production: anyone using that
browser can read it. A production version would run the sweep on a server:

1. Move the state (decisions, approvals, the activity log) from the browser into a shared database.
2. Run the sweep on a schedule from a server job that holds the key as a secret. A scheduled
   Claude Managed Agents deployment, a GitHub Actions cron job or a cloud function all fit.
3. Have the job call the same rule gate this prototype uses (`applyAction` in `agent.js`), so the
   agent can never do more than the rules allow.
4. Let the page read results from the database, and send approvals back to it.

## Files

| File | What it holds |
|---|---|
| `index.html` | The standalone page for a web host. Built from `countersign.html` by `build.py`. |
| `countersign.html` | Markup and styles, as the page fragment Claude publishes. |
| `data.js` | The fictional contracts, invoices, payments, people and tracker rows. |
| `core.js` | Helpers, state, sign-ins, and the facts worked out from contracts. |
| `views.js` | Overview, contracts, renewals, invoice check, ask, and adding a contract (with OCR). |
| `agent.js` | The rules, the action gate, approvals, the activity log, and the case tab. |
| `sweep.js` | The agent screen and both ways of running a sweep. |
| `cases.js` | The four cases, case pages, the value page and the Excel tracker. |
| `tour.js` | The welcome screen, sign-in pages and the guided tour. |
| `hosted.js` | Hosted mode: Claude through an API key supplied by the viewer. |
| `main.js` | Routing and events. |

There is no build step for the scripts. After changing `countersign.html`, run:

```bash
python3 build.py
```

## Limits

- Changes are saved in your browser only. Nothing is shared between people.
- Sending is simulated: messages go to an outbox inside the prototype.
- The rules of Indian law shown (45-day payment to small enterprises, data protection, stamp duty,
  PF and ESI) are simplified illustrations, not legal advice.
- Conversion rates for dollars and pounds are fixed sample rates.
