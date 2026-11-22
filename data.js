/* Sample data for the Countersign prototype. Every company, person and figure here is fictional.
   The company is Indian and keeps its books in rupees; some suppliers are overseas and bill in US dollars or pounds. */
(() => {
  const cl = (n, h, t) => ({ n, h, t });
  const V = 'Vindhya Consumer Brands Limited';

  const contracts = [
    {
      id: 'C-001', supplier: 'Brightlane Software', country: 'United States', currency: 'USD', title: 'CRM platform subscription', category: 'Software',
      owner: { name: 'Anuj Shinde', team: 'Sales and Supply Operations' }, price: 'US$54 × 520 seats',
      effective: '2024-03-01', end: '2027-02-28', autoRenew: true, renewalMonths: 12, noticeDays: 90,
      annualValue: 336960, uplift: { pct: 5, clause: 'A1-3' },
      docs: [
        { id: 'MSA', label: 'Master Subscription Agreement', date: '2024-02-12', clauses: [
          cl('1', 'Parties and scope', `This Master Subscription Agreement is made on 12 February 2024 between Brightlane Software Inc., a Delaware corporation ("Brightlane"), and ${V}, Bengaluru, India ("Customer"). It governs every Order Form the parties sign.`),
          cl('2', 'Term and renewal', 'Each Order Form states its Initial Term. At the end of the Initial Term and of each Renewal Term, the Order Form renews automatically for a further twelve (12) months unless either party gives the other written notice of non-renewal at least ninety (90) days before the end of the then-current term.'),
          cl('3', 'Notices', 'Notices of non-renewal or termination must be sent by email to legal-notices@brightlane.example and by tracked courier to Brightlane Software Inc., Attn: Legal, 400 Carrow Street, Austin, Texas, USA. Notice takes effect on receipt of the courier copy.'),
          cl('4', 'Fees on renewal', 'Fees for a Renewal Term are Brightlane\'s then-current list price.'),
          cl('5', 'Payment and taxes', 'Fees are invoiced monthly in advance in US dollars and are payable within thirty (30) days of the invoice date. Fees exclude taxes. Customer may deduct any tax that Indian law requires it to withhold, and the amount deducted is treated as paid to Brightlane once Customer provides the withholding certificate. Late amounts bear interest at 1% per month.'),
          cl('6', 'Service levels', 'Brightlane will make the Service available 99.9% of each calendar month, excluding scheduled maintenance notified at least 48 hours ahead. For each full 0.1% by which availability falls below 99.9%, Customer may claim a service credit of 5% of the monthly fees, capped at 25%. Customer must claim a credit in writing within thirty (30) days after the end of the affected month, or the credit is forfeited.'),
          cl('7', 'Data protection', 'Brightlane processes Customer personal data only under the Data Processing Addendum in Schedule 2 and will notify Customer of a personal data breach within 72 hours.'),
          cl('8', 'Liability', 'Each party\'s total liability in any contract year is capped at the fees paid or payable in the twelve (12) months before the claim. The cap does not apply to breach of confidentiality or data protection obligations.'),
          cl('9', 'Termination', 'Either party may terminate for material breach not cured within thirty (30) days of notice. Customer has no right to terminate for convenience during a term.'),
          cl('10', 'Governing law', 'This Agreement is governed by the laws of the State of New York, and the courts of New York have exclusive jurisdiction.')
        ] },
        { id: 'OF1', label: 'Order Form No. 1', date: '2024-03-01', clauses: [
          cl('OF-1', 'Service', 'Brightlane CRM Enterprise, 400 named user seats.'),
          cl('OF-2', 'Initial Term', 'Thirty-six (36) months from 1 March 2024, ending 28 February 2027.'),
          cl('OF-3', 'Fees', 'US$58.00 per seat per month, invoiced monthly in advance.'),
          cl('OF-4', 'Seat changes', 'Customer may add seats at any time at the then-current per-seat fee. Seats may be reduced only with effect from the start of a Renewal Term, by notice given no later than the non-renewal notice date.')
        ] },
        { id: 'A1', label: 'Amendment No. 1', date: '2025-09-01', clauses: [
          cl('A1-1', 'Seats', 'From 1 September 2025 the number of seats under Order Form No. 1 increases from 400 to 520.'),
          cl('A1-2', 'Fees', 'From the same date the fee in clause OF-3 is replaced by US$54.00 per seat per month for all 520 seats.'),
          cl('A1-3', 'Renewal pricing', 'Clause 4 of the Agreement is replaced as follows: fees for a Renewal Term may increase by no more than five percent (5%) over the fees in the preceding term.'),
          cl('A1-4', 'Other terms', 'All other terms of the Agreement and Order Form No. 1 are unchanged.')
        ] }
      ],
      superseded: { '4': 'A1-3', 'OF-1': 'A1-1', 'OF-3': 'A1-2' },
      terms: [
        { label: 'Current term ends', value: '28 Feb 2027, after a 36-month initial term', clause: 'OF-2' },
        { label: 'Renewal', value: 'Renews automatically for 12 months at a time', clause: '2' },
        { label: 'Notice to stop renewal', value: 'In writing, at least 90 days before the term ends', clause: '2' },
        { label: 'How to give notice', value: 'Email and tracked courier to Brightlane Legal in Austin, USA. It only counts once the courier copy arrives.', clause: '3', conf: 'medium', verified: false },
        { label: 'Fees', value: 'US$54.00 per seat per month for 520 seats', clause: 'A1-2', changedBy: 'Amendment No. 1', was: 'US$58.00 per seat for 400 seats' },
        { label: 'Price increase on renewal', value: 'No more than 5% over the previous term', clause: 'A1-3', changedBy: 'Amendment No. 1', was: 'Brightlane\'s list price, with no cap' },
        { label: 'Reducing seats', value: 'Only from the start of a renewal term, with notice by the non-renewal date', clause: 'OF-4', conf: 'medium', verified: false },
        { label: 'Payment and tax', value: 'US dollars, 30 days from invoice date. Indian tax withheld counts as paid. Late amounts carry 1% interest a month.', clause: '5' },
        { label: 'Service level', value: '99.9% availability each month. 5% credit for each 0.1% missed, up to 25%.', clause: '6' },
        { label: 'Ending early', value: 'No right to end for convenience during a term', clause: '9' },
        { label: 'Liability cap', value: 'Fees for the previous 12 months. No cap for confidentiality or data protection breaches.', clause: '8' },
        { label: 'Personal data', value: 'Covered by the data processing addendum in Schedule 2. Breach notice within 72 hours.', clause: '7' },
        { label: 'Governing law', value: 'New York law, New York courts', clause: '10' }
      ],
      risks: [
        { level: 'high', text: 'Seats can only be cut at renewal, and only if notice is given by the same deadline as non-renewal.', clause: 'OF-4' },
        { level: 'medium', text: 'The notice must reach Austin by courier. From India, allow at least a week for delivery.', clause: '3' },
        { level: 'medium', text: 'Fees are in US dollars, so the rupee cost moves with the exchange rate. Disputes go to New York courts.', clause: '10' }
      ],
      rates: { seat: { price: 54, unit: 'seat per month', clause: 'A1-2' } },
      slas: [{ name: 'Platform availability', target: 99.9, unit: '%', clause: '6', rule: { per: 0.1, pct: 5, cap: 25 }, claimDays: 30,
        history: [{ m: '2026-08', actual: 99.95, fee: 28080 }, { m: '2026-09', actual: 99.93, fee: 28080 }, { m: '2026-10', actual: 99.62, fee: 28080 }] }],
      usage: { label: 'seats', paid: 520, active: 371, unitCost: 648, source: 'Based on single sign-on logins in the last 90 days', clause: 'OF-4' }
    },

    {
      id: 'C-002', supplier: 'Sahyadri Staffing Services', country: 'India', currency: 'INR', title: 'Temporary staffing for warehouses', category: 'Staffing',
      owner: { name: 'Anuj Shinde', team: 'Sales and Supply Operations' }, price: 'Warehouse Associate ₹1,005 a day', billing: 'Udit Pawar',
      effective: '2025-04-01', end: '2027-03-31', autoRenew: true, renewalMonths: 12, noticeDays: 60,
      annualValue: 38400000,
      docs: [{ id: 'TSA', label: 'Temporary Staffing Services Agreement', date: '2025-04-01', clauses: [
        cl('1', 'Parties', `This Agreement is made on 1 April 2025 between Sahyadri Staffing Services Private Limited, Pune ("Agency"), and ${V}, Bengaluru ("Client").`),
        cl('2', 'Term', 'This Agreement starts on 1 April 2025 and continues for an initial term of twenty-four (24) months, ending 31 March 2027. It then renews for successive periods of twelve (12) months unless either party gives written notice of non-renewal at least sixty (60) days before the end of the current period.'),
        cl('3', 'Bill rates', 'Client will pay the following all-inclusive bill rates per person-day: Warehouse Associate ₹980; Forklift Operator ₹1,250. The rates include wages, statutory contributions, travel and every other cost of supplying the workers, and Agency\'s service charge. No other charge may be invoiced. The rates exclude GST.'),
        cl('4', 'Minimum wage revisions', 'If the applicable minimum wage is revised by government notification, the wage component of the bill rates changes by the same amount from the effective date of the notification. Agency will give Client the notification and a revised rate sheet. Agency\'s service charge does not change.'),
        cl('5', 'Volume rebate', 'If fees invoiced in a contract year exceed ₹3,00,00,000, Agency will credit Client three percent (3%) of the fees above that amount. The credit is due within forty-five (45) days after the end of the contract year.'),
        cl('6', 'Statutory compliance', 'Agency is the employer of all workers and will pay wages, provident fund (PF), employees\' state insurance (ESI) and all other statutory dues on time. Agency will give Client proof of payment (challans and wage registers) by the 20th of the following month. Client may withhold payment of an invoice until the proof for that month is received. Agency indemnifies Client against any claim made against Client as principal employer.'),
        cl('7', 'Direct hire', 'Client may hire a worker directly without a fee once the worker has completed six (6) months on assignment. Before then, a fee equal to one month\'s gross salary applies.'),
        cl('8', 'Payment', 'Agency invoices monthly in arrears. Invoices are payable within forty-five (45) days of receipt, after deduction of tax at source as required by law.'),
        cl('9', 'Insurance', 'Agency will maintain commercial general liability insurance of at least ₹2,00,00,000 per occurrence and provide a certificate on request.'),
        cl('10', 'Liability', 'Each party\'s liability is capped at the fees paid in the preceding twelve (12) months, except for the indemnity in clause 6.'),
        cl('11', 'Termination', 'Either party may terminate for convenience on ninety (90) days\' written notice.'),
        cl('12', 'Governing law', 'This Agreement is governed by the laws of India. Disputes will be referred to arbitration in Pune under the Arbitration and Conciliation Act, 1996.')
      ] },
      { id: 'A1', label: 'Amendment No. 1', date: '2025-10-01', clauses: [
        cl('A1-1', 'New role', 'From 1 October 2025 the role of Data Entry Operator is added to clause 3 at an all-inclusive bill rate of ₹1,100 per person-day.'),
        cl('A1-2', 'Other terms', 'All other terms of the Agreement are unchanged.')
      ] },
      { id: 'A2', label: 'Amendment No. 2', date: '2026-10-01', scanned: true, clauses: [
        cl('A2-1', 'Revised rate', 'Following the minimum wage notification effective 1 October 2026, the all-inclusive bill rate for Warehouse Associate in clause 3 is revised from ₹980 to ₹1,005 per person-day from that date. The rates for Forklift Operator and Data Entry Operator do not change.'),
        cl('A2-2', 'Other terms', 'All other terms of the Agreement, including that the rates are all-inclusive, are unchanged.')
      ] }],
      terms: [
        { label: 'Current term ends', value: '31 Mar 2027, after a 24-month initial term', clause: '2' },
        { label: 'Renewal', value: 'Renews automatically for 12 months at a time', clause: '2' },
        { label: 'Notice to stop renewal', value: 'In writing, at least 60 days before the period ends', clause: '2' },
        { label: 'How to give notice', value: 'Not stated', clause: '', conf: 'medium', verified: false },
        { label: 'Bill rates', value: 'Per person-day, before GST: Warehouse Associate ₹1,005 from 1 Oct 2026, Forklift Operator ₹1,250, Data Entry Operator ₹1,100', clause: 'A2-1', changedBy: 'Amendment No. 2', was: 'Warehouse Associate ₹980', conf: 'medium', verified: false },
        { label: 'Extra charges', value: 'None allowed. Rates are all-inclusive, so travel and other costs cannot be billed separately.', clause: '3' },
        { label: 'Rate changes', value: 'Only the wage part moves, and only when the government revises the minimum wage. The service charge is fixed.', clause: '4' },
        { label: 'Volume rebate', value: '3% credit on fees above ₹3,00,00,000 in a contract year, due within 45 days of year end', clause: '5' },
        { label: 'Statutory dues', value: 'Agency pays wages, PF and ESI and must send proof by the 20th of the next month. Vindhya may hold payment until it arrives.', clause: '6' },
        { label: 'Hiring a worker', value: 'Free after 6 months on assignment. Before that, one month\'s gross salary.', clause: '7' },
        { label: 'Payment terms', value: '45 days from receipt, after deducting tax at source', clause: '8' },
        { label: 'Ending early', value: 'Either side can end on 90 days\' written notice', clause: '11' },
        { label: 'Liability cap', value: 'Fees for the previous 12 months, except the principal-employer indemnity', clause: '10' },
        { label: 'Governing law', value: 'Indian law, arbitration in Pune', clause: '12' }
      ],
      risks: [
        { level: 'high', text: 'If the agency does not pay PF or ESI, the liability can fall on Vindhya as principal employer. The monthly proof is the only control.', clause: '6' },
        { level: 'medium', text: 'The rebate is a credit the agency must issue. Nothing makes it automatic, so someone has to chase it.', clause: '5' },
        { level: 'medium', text: 'Bill rates can rise without negotiation whenever minimum wages are revised. Check each revised rate sheet against the notification.', clause: '4' }
      ],
      rates: {
        wa: { price: 1005, unit: 'person-day', clause: 'A2-1' },
        fo: { price: 1250, unit: 'person-day', clause: '3' },
        deo: { price: 1100, unit: 'person-day', clause: '3' }
      },
      rebate: { threshold: 30000000, pct: 3, yearEnd: '2026-03-31', fees: 38400000, dueDays: 45, clause: '5' },
      obligations: [
        { who: 'Supplier', what: 'PF and ESI challans and the wage register for October 2026 were due by 20 Nov 2026 and have not been received. Payment can be held until they arrive (§6).', due: '2026-11-20', flag: 'proof of PF and ESI payment for October is missing', role: 'finance', act: 'chase_document', clause: '6' }
      ]
    },

    {
      id: 'C-003', supplier: 'Deccan Freightways', country: 'India', currency: 'INR', title: 'Road freight and distribution', category: 'Logistics',
      owner: { name: 'Anuj Shinde', team: 'Sales and Supply Operations' }, price: 'Rate schedule, fuel surcharge capped at 12%',
      effective: '2024-07-01', end: '2027-06-30', autoRenew: false, annualValue: 68000000, disputeDays: 15,
      docs: [{ id: 'FDA', label: 'Freight and Distribution Services Agreement', date: '2024-07-01', scanned: true, clauses: [
        cl('1', 'Parties', `This Agreement is made on 1 July 2024 between Deccan Freightways Private Limited, Hyderabad ("Carrier"), and ${V}, Bengaluru ("Shipper").`),
        cl('2', 'Term', 'This Agreement starts on 1 July 2024 and ends on 30 June 2027. It does not renew automatically. Any extension must be agreed in writing and signed by both parties.'),
        cl('3', 'Rates', 'Linehaul and handling rates are set out in the Rate Schedule and exclude GST. Carrier may adjust rates once per contract year by the change in the Wholesale Price Index, capped at five percent (5%), on sixty (60) days\' notice.'),
        cl('4', 'Fuel surcharge', 'Carrier may apply a fuel surcharge calculated on base linehaul charges using the diesel price table in the Rate Schedule. The surcharge will not exceed twelve percent (12%) of base linehaul charges in any month.'),
        cl('5', 'Service level', 'Carrier will deliver at least ninety-six percent (96%) of consignments on or before the scheduled delivery date in each calendar month. For each full percentage point below 96%, Shipper may claim a credit of two percent (2%) of that month\'s freight charges, capped at ten percent (10%). Claims must be made within sixty (60) days after the end of the month.'),
        cl('5.1', 'Force majeure', 'A consignment delayed by flood, strike or another event outside Carrier\'s control is left out of the on-time calculation only if Carrier gives Shipper written evidence of the event within five (5) days of the scheduled delivery date.'),
        cl('6', 'Loss and damage', 'Carrier is liable for loss of or damage to goods in its custody at ₹2,000 per kilogram, capped at ₹25,00,000 per consignment. Shipper must report damage within seven (7) days of delivery.'),
        cl('7', 'Payment', 'Invoices are payable within thirty (30) days, after deduction of tax at source as required by law. Shipper may withhold a disputed amount if it notifies Carrier within fifteen (15) days of the invoice date.'),
        cl('8', 'Insurance', 'Carrier will maintain transit insurance of at least ₹1,00,00,000 per occurrence.'),
        cl('9', 'Termination', 'Either party may terminate for material breach not cured within thirty (30) days. Shipper may terminate on sixty (60) days\' notice if on-time delivery is below 94% in any three (3) months of a rolling six-month period.'),
        cl('10', 'Governing law', 'This Agreement is governed by the laws of India. The courts at Hyderabad have exclusive jurisdiction.')
      ] }],
      terms: [
        { label: 'Term ends', value: '30 Jun 2027', clause: '2' },
        { label: 'Renewal', value: 'No automatic renewal. An extension needs a signed agreement.', clause: '2' },
        { label: 'Rate increases', value: 'Once a year, by wholesale price inflation, capped at 5%, with 60 days\' notice', clause: '3' },
        { label: 'Fuel surcharge', value: 'Follows the diesel price table, capped at 12% of base linehaul charges each month', clause: '4', conf: 'medium', verified: false },
        { label: 'Service level', value: '96% of consignments on time each month. 2% credit per full point missed, up to 10%.', clause: '5' },
        { label: 'Claiming credits', value: 'Within 60 days after the end of the month', clause: '5' },
        { label: 'Force majeure', value: 'Delays outside the carrier\'s control are left out only if written evidence is sent within 5 days of the scheduled delivery', clause: '5.1' },
        { label: 'Loss and damage', value: '₹2,000 per kilogram, capped at ₹25,00,000 per consignment. Report within 7 days.', clause: '6' },
        { label: 'Payment terms', value: '30 days, after tax deducted at source. Disputed amounts can be withheld if raised within 15 days of the invoice date.', clause: '7' },
        { label: 'Ending early', value: 'For breach, or on 60 days\' notice if on-time delivery is under 94% in 3 of any 6 months', clause: '9' },
        { label: 'Governing law', value: 'Indian law, Hyderabad courts', clause: '10' }
      ],
      risks: [
        { level: 'high', text: 'Overcharges must be disputed within 15 days of the invoice date, or the right to withhold is lost.', clause: '7' },
        { level: 'medium', text: 'This record was read from a scanned copy. The fuel surcharge cap has not yet been checked against the scan by a person.', clause: '4' },
        { level: 'medium', text: 'Liability of ₹2,000 per kilogram may be well below the value of high-value goods.', clause: '6' }
      ],
      rates: { fuelCap: { capPct: 12, clause: '4' } },
      slas: [{ name: 'On-time delivery', target: 96, unit: '%', clause: '5', rule: { per: 1, pct: 2, cap: 10 }, claimDays: 60,
        history: [{ m: '2026-08', actual: 96.8, fee: 5620000 }, { m: '2026-09', actual: 93.4, fee: 5940000, fmActual: 94.6, fm: 'Deccan says 71 late consignments were held up by flooding on NH 44 between 14 and 16 September. No written evidence was sent within 5 days.' }, { m: '2026-10', actual: 94.9, fee: 5565000 }] }],
      obligations: [
        { who: 'Customer', what: 'No stamp paper or e-stamp certificate was found with the scanned agreement. An agreement that is not duly stamped may not be accepted as evidence until duty and penalty are paid.', due: '2024-07-01', flag: 'no stamp duty certificate found with the agreement', role: 'legal', act: 'escalate', clause: '1' }
      ]
    },

    {
      id: 'C-004', supplier: 'Nirmal Facility Services', country: 'India', currency: 'INR', title: 'Housekeeping and maintenance, six sites', category: 'Facilities', msme: true,
      owner: { name: 'Rohit Kulkarni', team: 'Workplace', left: '2026-08-14', manager: 'Kavita Rao' }, price: '₹11,40,000 a month',
      effective: '2023-01-01', end: '2026-12-31', autoRenew: true, renewalMonths: 12, noticeDays: 60,
      annualValue: 13680000, uplift: { pct: 8, clause: '4' },
      exit: 'There is still a way out: six months\' notice plus two months\' charges (§7).',
      docs: [{ id: 'FSA', label: 'Facilities Services Agreement', date: '2023-01-01', clauses: [
        cl('1', 'Parties', `This Agreement is made on 1 January 2023 between Nirmal Facility Services, a partnership firm at Bengaluru registered as a small enterprise under the Micro, Small and Medium Enterprises Development Act, 2006 ("Provider"), and ${V} ("Customer").`),
        cl('2', 'Term', 'This Agreement starts on 1 January 2023 for an initial term of twenty-four (24) months. It then renews automatically for successive terms of twelve (12) months unless either party gives written notice of non-renewal at least sixty (60) days before the end of the current term.'),
        cl('3', 'Services', 'Provider will deliver housekeeping, waste removal and planned maintenance at the six Customer sites listed in Schedule 1.'),
        cl('4', 'Charges', 'The monthly service charge is set out in the Charges Schedule (₹11,40,000 for calendar year 2026, excluding GST). At the start of each renewal term the charge increases by eight percent (8%).'),
        cl('5', 'Response times', 'Provider will respond to urgent maintenance calls within four (4) hours and to routine calls within two (2) working days. If Provider misses the urgent response time more than three times in a month, Customer may claim a credit of 5% of that month\'s charge.'),
        cl('6', 'Insurance', 'Provider will maintain public liability insurance of at least ₹2,00,00,000 per occurrence and deliver a current certificate of insurance to Customer whenever a policy is renewed.'),
        cl('7', 'Termination for convenience', 'After the initial term, Customer may terminate for convenience on six (6) months\' written notice, on payment of an early termination charge equal to two (2) months\' service charges.'),
        cl('8', 'Staff and statutory dues', 'Provider will verify the background of all staff before they attend a Customer site and will pay their wages, PF and ESI on time.'),
        cl('9', 'Liability', 'Provider\'s liability is capped at the greater of ₹1,00,00,000 and the charges paid in the preceding twelve (12) months.'),
        cl('10', 'Payment', 'Invoices are issued monthly and are payable within forty-five (45) days of acceptance of the services, after deduction of tax at source as required by law.'),
        cl('11', 'Governing law', 'This Agreement is governed by the laws of India. The courts at Bengaluru have exclusive jurisdiction.')
      ] }],
      terms: [
        { label: 'Current term ends', value: '31 Dec 2026. The contract has renewed twice since the initial term.', clause: '2' },
        { label: 'Renewal', value: 'Renews automatically for 12 months at a time', clause: '2' },
        { label: 'Notice to stop renewal', value: 'In writing, at least 60 days before the term ends', clause: '2' },
        { label: 'How to give notice', value: 'Not stated', clause: '', conf: 'medium', verified: false },
        { label: 'Charges', value: '₹11,40,000 a month in 2026, before GST', clause: '4' },
        { label: 'Price increase on renewal', value: '8% at the start of each renewal term', clause: '4' },
        { label: 'Small enterprise status', value: 'Provider is a registered small enterprise, so the 45-day payment limit in the MSMED Act applies', clause: '1' },
        { label: 'Payment terms', value: '45 days from acceptance, after tax deducted at source', clause: '10' },
        { label: 'Response times', value: 'Urgent calls within 4 hours, routine calls within 2 working days. 5% credit if urgent calls are missed more than 3 times a month.', clause: '5' },
        { label: 'Insurance', value: 'Provider must hold ₹2,00,00,000 public liability cover and send a new certificate at each policy renewal', clause: '6' },
        { label: 'Ending early', value: 'Six months\' written notice plus a charge of two months\' fees', clause: '7' },
        { label: 'Liability cap', value: 'The greater of ₹1,00,00,000 and 12 months\' charges', clause: '9' },
        { label: 'Governing law', value: 'Indian law, Bengaluru courts', clause: '11' }
      ],
      risks: [
        { level: 'high', text: 'A fixed 8% rise applies at every renewal, with no link to inflation or performance.', clause: '4' },
        { level: 'high', text: 'As a registered small enterprise, the provider must be paid within 45 days. Late payment attracts compound interest under the MSMED Act.', clause: '10' },
        { level: 'medium', text: 'The contract does not say how notice must be delivered, which invites disputes over whether it was given.', clause: '2' }
      ],
      rates: { monthly: { price: 1140000, unit: 'month', clause: '4' } },
      obligations: [
        { who: 'Supplier', what: 'The insurance certificate on file expired on 30 Sep 2026. Nirmal must send a current one (§6).', due: '2026-09-30', flag: 'insurance certificate on file has expired', role: 'procurement', act: 'chase_document', clause: '6' }
      ]
    },

    {
      id: 'C-005', supplier: 'Rangrez Creative', country: 'India', currency: 'INR', title: 'Creative and media agency retainer', category: 'Marketing',
      owner: { name: 'Ananya Iyer', team: 'Brand Marketing' }, price: '₹12,00,000 a month',
      effective: '2025-10-01', end: '2026-09-30', autoRenew: false, annualValue: 14400000,
      docs: [{ id: 'ASA', label: 'Agency Services Agreement', date: '2025-10-01', clauses: [
        cl('1', 'Parties', `This Agreement is made on 1 October 2025 between Rangrez Creative LLP, Mumbai ("Agency"), and ${V}, Bengaluru ("Client").`),
        cl('2', 'Term', 'This Agreement starts on 1 October 2025 and ends on 30 September 2026. It does not renew automatically. Services provided after the end date are not covered by this Agreement unless the parties sign an extension.'),
        cl('3', 'Retainer', 'Client will pay a retainer of ₹12,00,000 per month, excluding GST, for up to 280 hours of Agency time. Unused hours carry forward one month and then lapse. Hours above the allowance are charged at ₹4,500 per hour and need Client\'s written approval in advance.'),
        cl('4', 'Third-party costs', 'Media, production and talent costs are passed through at cost plus an 8% handling fee. Any item above ₹2,00,000 needs Client\'s approval in advance.'),
        cl('5', 'Intellectual property', 'On payment in full, Agency assigns to Client all rights in the deliverables created for Client. Third-party materials, including stock images, music and talent, are licensed to Client only for twelve (12) months from first use and only for the media listed in the estimate.'),
        cl('6', 'Exclusivity', 'During the term Agency will not work for the competitors listed in Schedule 2.'),
        cl('7', 'Payment', 'Invoices are payable within thirty (30) days, after deduction of tax at source as required by law.'),
        cl('8', 'Termination', 'Either party may terminate on sixty (60) days\' written notice.'),
        cl('9', 'Liability', 'Agency\'s liability is capped at the fees paid in the preceding six (6) months.'),
        cl('10', 'Confidentiality', 'Each party will keep the other\'s confidential information secret for three (3) years after the Agreement ends.'),
        cl('11', 'Governing law', 'This Agreement is governed by the laws of India. The courts at Mumbai have exclusive jurisdiction.')
      ] }],
      terms: [
        { label: 'Term ended', value: '30 Sep 2026', clause: '2' },
        { label: 'Renewal', value: 'No automatic renewal. Work after the end date is not covered without a signed extension.', clause: '2' },
        { label: 'Retainer', value: '₹12,00,000 a month before GST, for up to 280 hours. Unused hours carry over one month only.', clause: '3' },
        { label: 'Extra hours', value: '₹4,500 an hour, with written approval in advance', clause: '3' },
        { label: 'Third-party costs', value: 'At cost plus 8%. Items above ₹2,00,000 need approval first.', clause: '4' },
        { label: 'Who owns the work', value: 'Vindhya owns deliverables once paid in full', clause: '5' },
        { label: 'Stock images, music and talent', value: 'Licensed for 12 months from first use only, in the listed media', clause: '5', conf: 'medium', verified: false },
        { label: 'Exclusivity', value: 'Agency cannot work for listed competitors, but only during the term', clause: '6' },
        { label: 'Payment terms', value: '30 days, after tax deducted at source', clause: '7' },
        { label: 'Liability cap', value: 'Fees for the previous 6 months', clause: '9' },
        { label: 'Governing law', value: 'Indian law, Mumbai courts', clause: '11' }
      ],
      risks: [
        { level: 'high', text: 'The agency is still working, but the contract has ended. Ownership of new work and exclusivity are no longer protected.', clause: '2' },
        { level: 'medium', text: 'Third-party licences run out 12 months after first use, so older campaign assets may need to come down.', clause: '5' }
      ],
      rates: { retainer: { price: 1200000, unit: 'month', clause: '3' } },
      obligations: [
        { who: 'Customer', what: 'Licences for stock images and music in the November 2025 festive campaign ended on 10 Nov 2026. Remove or re-license them.', due: '2026-11-10', flag: 'licences for festive campaign images and music have ended', role: 'owner', act: 'remind_owner', clause: '5' }
      ]
    },

    {
      id: 'C-006', supplier: 'Oakhurst Advisory', country: 'United Kingdom', currency: 'GBP', title: 'ERP implementation, phase 2', category: 'Consulting',
      owner: { name: 'Vikram Desai', team: 'Finance Systems' }, price: 'Fees capped at £620,000',
      effective: '2026-02-01', end: '2026-12-31', autoRenew: false, annualValue: 620000,
      docs: [{ id: 'SOW3', label: 'Statement of Work No. 3', date: '2026-02-01', clauses: [
        cl('1', 'Parties', `This Statement of Work No. 3 is made on 1 February 2026 under the Professional Services Agreement dated 15 January 2025 between Oakhurst Advisory LLP, London ("Consultant"), and ${V}, Bengaluru ("Client").`),
        cl('2', 'Term', 'Work under this SOW starts on 1 February 2026 and ends on 31 December 2026. The SOW does not renew. Work after the end date needs a signed change order.'),
        cl('3', 'Fees', 'Fees are charged on a time-and-materials basis in pounds sterling at these rates: Partner £340 per hour; Senior Consultant £230 per hour; Consultant £165 per hour. Rates are fixed for the term of this SOW.'),
        cl('4', 'Fee cap', 'Total fees under this SOW will not exceed £620,000 without a change order signed by Client\'s Chief Financial Officer. Consultant will notify Client in writing when fees reach 80% of the cap.'),
        cl('5', 'Expenses', 'Reasonable travel expenses are reimbursed at cost, up to eight percent (8%) of fees invoiced, with receipts.'),
        cl('6', 'Acceptance', 'Client has ten (10) business days to accept or reject each deliverable. A deliverable not rejected in that period is deemed accepted.'),
        cl('7', 'Intellectual property', 'Client owns all deliverables on payment. Consultant keeps its pre-existing methods and tools and grants Client a perpetual licence to use them as part of the deliverables.'),
        cl('8', 'Key personnel', 'Consultant will not replace the named engagement partner or project lead without Client\'s consent.'),
        cl('9', 'Payment and taxes', 'Invoices are issued monthly and are payable within thirty (30) days. Client may deduct any tax that Indian law requires it to withhold and will give Consultant the certificate.'),
        cl('10', 'Liability', 'Consultant\'s liability is capped at the fees paid under this SOW.'),
        cl('11', 'Termination', 'Client may terminate this SOW on fifteen (15) days\' notice, paying for work performed up to the termination date.'),
        cl('12', 'Governing law', 'This SOW is governed by the laws of England and Wales.')
      ] }],
      terms: [
        { label: 'Term ends', value: '31 Dec 2026', clause: '2' },
        { label: 'Renewal', value: 'Does not renew. Work after the end date needs a signed change order.', clause: '2' },
        { label: 'Hourly rates', value: 'In pounds: Partner £340, Senior Consultant £230, Consultant £165. Fixed for the term.', clause: '3' },
        { label: 'Fee cap', value: '£620,000 in total. Going over needs a change order signed by the CFO.', clause: '4' },
        { label: 'Cap warning', value: 'Consultant must tell Vindhya in writing when fees reach 80% of the cap', clause: '4', conf: 'medium', verified: false },
        { label: 'Expenses', value: 'At cost with receipts, up to 8% of fees invoiced', clause: '5' },
        { label: 'Accepting deliverables', value: '10 business days to reject, otherwise treated as accepted', clause: '6' },
        { label: 'Who owns the work', value: 'Vindhya owns deliverables on payment. Oakhurst keeps its own tools and licenses them to Vindhya.', clause: '7' },
        { label: 'Payment and tax', value: '30 days. Vindhya may deduct Indian withholding tax and provide the certificate.', clause: '9' },
        { label: 'Ending early', value: '15 days\' notice, paying for work done', clause: '11' },
        { label: 'Liability cap', value: 'Fees paid under this statement of work', clause: '10' },
        { label: 'Governing law', value: 'England and Wales', clause: '12' }
      ],
      risks: [
        { level: 'high', text: 'Deliverables are treated as accepted if nobody rejects them within 10 business days.', clause: '6' },
        { level: 'medium', text: 'No written 80% cap warning is on file, although fees have passed that level.', clause: '4' },
        { level: 'medium', text: 'Fees are in pounds, so the rupee cost of the remaining work moves with the exchange rate.', clause: '3' }
      ],
      rates: {
        partner: { price: 340, unit: 'hour', clause: '3' },
        senior: { price: 230, unit: 'hour', clause: '3' },
        consultant: { price: 165, unit: 'hour', clause: '3' }
      },
      cap: { limit: 620000, billed: 590000, clause: '4' }
    },

    {
      id: 'C-007', supplier: 'Stratus Cloud', country: 'Singapore', currency: 'USD', title: 'Enterprise cloud hosting', category: 'Software',
      owner: { name: 'Sneha Reddy', team: 'Platform Engineering' }, price: 'US$1,200,000 a year minimum',
      effective: '2025-06-01', end: '2027-05-31', autoRenew: true, renewalMonths: 12, noticeDays: 60,
      annualValue: 1200000,
      docs: [{ id: 'ECA', label: 'Enterprise Cloud Agreement', date: '2025-06-01', clauses: [
        cl('1', 'Parties', `This Agreement is made on 1 June 2025 between Stratus Cloud Pte. Ltd., Singapore ("Stratus"), and ${V}, Bengaluru, India ("Customer").`),
        cl('2', 'Term', 'This Agreement starts on 1 June 2025 for an initial term of twenty-four (24) months, ending 31 May 2027. It renews for successive twelve (12) month terms unless either party gives written notice of non-renewal at least sixty (60) days before the end of the current term.'),
        cl('3', 'Committed spend', 'Customer commits to spend at least US$1,200,000 on Services in each contract year. If actual spend in a contract year is lower, Stratus will invoice the shortfall within thirty (30) days after the end of that year. Unused commitment does not carry forward.'),
        cl('4', 'Discount', 'Customer receives an 18% discount from list prices on all Services while the commitment is in place.'),
        cl('4.1', 'Q4 migration discount', 'For Services used from 1 October 2026 to 31 December 2026, Customer receives a further five percent (5%) discount on charges, after the discount in clause 4, in return for moving its analytics workloads to Stratus by 30 September 2026.'),
        cl('5', 'Availability', 'Stratus will provide monthly availability of 99.95% for compute and storage services. If availability is below 99.95%, Customer may claim a credit of 10% of the monthly charges for the affected service; if below 99.0%, 25%. Claims must be made within thirty (30) days after the end of the month.'),
        cl('6', 'Data protection', 'Stratus processes personal data under the Data Processing Addendum in Schedule 3. Stratus will give thirty (30) days\' notice before engaging a new sub-processor, and Customer may object.'),
        cl('7', 'Data location', 'Customer data is stored in the India (Mumbai) region unless Customer selects another region, and is not moved without Customer\'s instruction.'),
        cl('8', 'Payment', 'Charges are invoiced monthly in arrears in US dollars and are payable within thirty (30) days.'),
        cl('9', 'Liability', 'Each party\'s liability is capped at the fees paid in the preceding twelve (12) months. For breach of clause 6 the cap is two times that amount.'),
        cl('10', 'Termination and exit', 'Customer may not terminate for convenience during the initial term. On termination Stratus will keep Customer data available for export for ninety (90) days and then delete it.'),
        cl('11', 'Governing law', 'This Agreement is governed by the laws of Singapore. Disputes will be referred to arbitration in Singapore under the SIAC Rules.')
      ] }],
      terms: [
        { label: 'Current term ends', value: '31 May 2027, after a 24-month initial term', clause: '2' },
        { label: 'Renewal', value: 'Renews automatically for 12 months at a time', clause: '2' },
        { label: 'Notice to stop renewal', value: 'In writing, at least 60 days before the term ends', clause: '2' },
        { label: 'Minimum spend', value: 'US$1,200,000 each contract year. Any shortfall is invoiced, and unused commitment is lost.', clause: '3' },
        { label: 'Discount', value: '18% off list prices while the commitment is in place', clause: '4' },
        { label: 'Q4 extra discount', value: 'A further 5% off charges for October to December 2026', clause: '4.1', conf: 'medium', verified: false },
        { label: 'Service level', value: '99.95% availability each month. 10% credit below that, 25% below 99.0%.', clause: '5' },
        { label: 'Personal data', value: 'Covered by the addendum in Schedule 3. 30 days\' notice of new sub-processors, with a right to object.', clause: '6' },
        { label: 'Data location', value: 'Stored in the India (Mumbai) region unless Vindhya chooses otherwise', clause: '7' },
        { label: 'Payment terms', value: 'Monthly in arrears, in US dollars, 30 days', clause: '8' },
        { label: 'Liability cap', value: 'Fees for the previous 12 months, doubled for data protection breaches', clause: '9' },
        { label: 'Ending early', value: 'Not allowed during the initial term. Data stays available for 90 days after the end.', clause: '10' },
        { label: 'Governing law', value: 'Singapore law, arbitration in Singapore', clause: '11' }
      ],
      risks: [
        { level: 'high', text: 'Vindhya pays the full US$1,200,000 each year even if it uses less, and the unused amount does not roll over.', clause: '3' },
        { level: 'medium', text: 'The commitment is in US dollars. A weaker rupee raises the cost of any shortfall.', clause: '3' }
      ],
      slas: [{ name: 'Compute and storage availability', target: 99.95, unit: '%', clause: '5', rule: { tiers: [{ below: 99.95, pct: 10 }, { below: 99.0, pct: 25 }] }, claimDays: 30,
        history: [{ m: '2026-08', actual: 99.99, fee: 79100 }, { m: '2026-09', actual: 99.97, fee: 77600 }, { m: '2026-10', actual: 99.98, fee: 76400 }] }],
      rates: { q4: { pct: 5, from: '2026-10-01', to: '2026-12-31', clause: '4.1' } },
      commit: { annual: 1200000, yearStart: '2026-06-01', through: '2026-10-31', consumed: 391000, clause: '3' }
    },

    {
      id: 'C-008', supplier: 'Vantage Analytics', country: 'United States', currency: 'USD', title: 'Customer analytics platform', category: 'Software',
      owner: { name: 'Imran Qureshi', team: 'Growth Analytics' }, price: 'US$94,000 a year',
      effective: '2026-01-15', end: '2027-01-14', autoRenew: true, renewalMonths: 12, noticeDays: 30,
      annualValue: 94000, uplift: { pct: 10, clause: '3' },
      docs: [{ id: 'SST', label: 'Software Subscription Terms', date: '2026-01-15', clauses: [
        cl('1', 'Parties', `These Subscription Terms are agreed on 15 January 2026 between Vantage Analytics Corp, a Delaware corporation ("Vantage"), and ${V}, Bengaluru, India ("Customer").`),
        cl('2', 'Term', 'The subscription starts on 15 January 2026 and runs for twelve (12) months, ending 14 January 2027. It renews automatically for further twelve (12) month periods unless Customer gives written notice of non-renewal at least thirty (30) days before the renewal date.'),
        cl('3', 'Fees and taxes', 'The annual subscription fee is US$94,000, invoiced annually in advance. Vantage may increase the fee on renewal by up to ten percent (10%) by giving notice at least forty-five (45) days before the renewal date. All fees are payable in full without deduction. If Customer is required by law to withhold any tax, Customer will increase the payment so that Vantage receives the full invoiced amount.'),
        cl('4', 'Usage limits', 'The subscription covers up to 5 million tracked customer profiles. Overage is charged at US$12 per 1,000 profiles.'),
        cl('5', 'Customer data', 'Customer will upload customer contact and behavioural data to the Service. Vantage may use aggregated and de-identified data to improve its products. Data is hosted in the United States.'),
        cl('6', 'Data processing', 'The parties will sign a data processing addendum before Customer uploads any personal data to the Service.'),
        cl('7', 'Support', 'Vantage provides support by email on US business days. No availability commitment or service credits apply.'),
        cl('8', 'Liability', 'Vantage\'s total liability is limited to the fees paid in the three (3) months before the claim.'),
        cl('9', 'Termination', 'Customer may not terminate for convenience. Fees are non-refundable.'),
        cl('10', 'Governing law', 'These Terms are governed by the laws of the State of Delaware.')
      ] }],
      terms: [
        { label: 'Current term ends', value: '14 Jan 2027, after a 12-month term', clause: '2' },
        { label: 'Renewal', value: 'Renews automatically for 12 months at a time', clause: '2' },
        { label: 'Notice to stop renewal', value: 'In writing, at least 30 days before the renewal date', clause: '2' },
        { label: 'How to give notice', value: 'Not stated', clause: '', conf: 'medium', verified: false },
        { label: 'Fees', value: 'US$94,000 a year, invoiced in advance', clause: '3' },
        { label: 'Price increase on renewal', value: 'Up to 10%, if Vantage gives 45 days\' notice', clause: '3' },
        { label: 'Tax', value: 'No deductions allowed. If Indian tax must be withheld, Vindhya pays extra so Vantage still receives the full fee.', clause: '3', conf: 'medium', verified: false },
        { label: 'Usage limit', value: '5 million customer profiles. US$12 per 1,000 above that.', clause: '4' },
        { label: 'Use and location of data', value: 'Hosted in the United States. Vantage may use aggregated, de-identified data to improve its products.', clause: '5', conf: 'medium', verified: false },
        { label: 'Personal data', value: 'A data processing addendum must be signed before any personal data is uploaded', clause: '6' },
        { label: 'Service level', value: 'None. Email support on US business days only.', clause: '7' },
        { label: 'Liability cap', value: 'Fees for the previous 3 months', clause: '8' },
        { label: 'Ending early', value: 'Not allowed. Fees are non-refundable.', clause: '9' },
        { label: 'Governing law', value: 'Delaware', clause: '10' }
      ],
      risks: [
        { level: 'high', text: 'Customer personal data has been uploaded since February 2026 without the required addendum. India\'s data protection law expects a valid contract with anyone processing personal data on the company\'s behalf.', clause: '6' },
        { level: 'high', text: 'The tax gross-up means any Indian withholding tax is an extra cost to Vindhya on top of the fee.', clause: '3' },
        { level: 'high', text: 'Liability is limited to three months of fees, about US$23,500, for a system holding customer data.', clause: '8' }
      ],
      obligations: [
        { who: 'Both', what: 'Sign a data processing addendum. Personal data has been uploaded since 1 Feb 2026 without one (§6).', due: '2026-02-01', flag: 'no data processing addendum on file', sev: 'crit', role: 'legal', act: 'escalate', clause: '6' }
      ]
    }
  ];

  /* Amounts are in the contract's own currency and exclude GST. */
  const invoices = [
    { id: 'INV-88213', contract: 'C-001', supplier: 'Brightlane Software', date: '2026-11-03', period: 'November 2026', periodStart: '2026-11-01',
      lines: [{ desc: 'CRM Enterprise seats', qty: 520, billed: 58, rateKey: 'seat' }] },
    { id: 'SSS/26-27/0412', contract: 'C-002', supplier: 'Sahyadri Staffing Services', date: '2026-11-05', period: 'October 2026', periodStart: '2026-10-01',
      lines: [
        { desc: 'Warehouse Associate person-days', qty: 1840, billed: 1030, rateKey: 'wa' },
        { desc: 'Forklift Operator person-days', qty: 620, billed: 1250, rateKey: 'fo', reclass: { qty: 22, toKey: 'wa', why: 'Timesheets show 22 of these person-days were worked by a Warehouse Associate.' } },
        { desc: 'Data Entry Operator person-days', qty: 510, billed: 1100, rateKey: 'deo' },
        { desc: 'Travel and conveyance', kind: 'notallowed', amount: 38500, clause: '3' }
      ] },
    { id: 'DF/1031/26', contract: 'C-003', supplier: 'Deccan Freightways', date: '2026-11-10', period: 'October 2026', periodStart: '2026-10-01',
      lines: [
        { desc: 'Base linehaul', kind: 'amount', amount: 4500000 },
        { desc: 'Fuel surcharge', kind: 'pct', basis: 4500000, billedPct: 15.5, rateKey: 'fuelCap' },
        { desc: 'Handling and other charges', kind: 'amount', amount: 367500 }
      ] },
    { id: 'NFS-1012', contract: 'C-004', supplier: 'Nirmal Facility Services', date: '2026-10-12', period: 'October 2026', periodStart: '2026-10-01', unpaid: true,
      lines: [{ desc: 'Monthly service charge', qty: 1, billed: 1140000, rateKey: 'monthly' }] },
    { id: 'NFS-1108', contract: 'C-004', supplier: 'Nirmal Facility Services', date: '2026-11-08', period: 'November 2026', periodStart: '2026-11-01', unpaid: true,
      lines: [{ desc: 'Monthly service charge', qty: 1, billed: 1140000, rateKey: 'monthly' }] },
    { id: 'RC-0926', contract: 'C-005', supplier: 'Rangrez Creative', date: '2026-10-31', period: 'October 2026', periodStart: '2026-10-01',
      lines: [{ desc: 'Monthly retainer', qty: 1, billed: 1200000, rateKey: 'retainer' }] },
    { id: 'OA-1187', contract: 'C-006', supplier: 'Oakhurst Advisory', date: '2026-11-02', period: 'October 2026', periodStart: '2026-10-01',
      lines: [
        { desc: 'Partner hours', qty: 12, billed: 340, rateKey: 'partner' },
        { desc: 'Senior Consultant hours', qty: 164, billed: 246, rateKey: 'senior' },
        { desc: 'Consultant hours', qty: 188, billed: 165, rateKey: 'consultant' }
      ] },
    { id: 'STR-55102', contract: 'C-007', supplier: 'Stratus Cloud', date: '2026-11-04', period: 'October 2026', periodStart: '2026-10-01',
      lines: [{ desc: 'Compute, storage and network usage', kind: 'amount', amount: 76400, discountKey: 'q4' }] },
    { id: 'TSS/2210', contract: null, supplier: 'Trishul Security Services', date: '2026-11-06', period: 'October 2026', periodStart: '2026-10-01',
      lines: [{ desc: 'Guarding, three distribution centres', kind: 'amount', amount: 980000 }] }
  ];

  /* Suppliers paid in the last 12 months, from the accounts payable ledger, in rupees. */
  const payments = [
    { supplier: 'Stratus Cloud', spend12: 89091200 },
    { supplier: 'Oakhurst Advisory', spend12: 68440000 },
    { supplier: 'Deccan Freightways', spend12: 68240000 },
    { supplier: 'Sahyadri Staffing Services', spend12: 39160000 },
    { supplier: 'Brightlane Software', spend12: 29835520 },
    { supplier: 'Rangrez Creative', spend12: 15520000 },
    { supplier: 'Nirmal Facility Services', spend12: 13680000 },
    { supplier: 'Trishul Security Services', spend12: 11800000, note: 'No document found' },
    { supplier: 'Malabar Fleet Leasing', spend12: 9640000, note: 'Scanned copy only, not yet read' },
    { supplier: 'Vantage Analytics', spend12: 8272000 },
    { supplier: 'Godavari Packaging Industries', spend12: 7850000, note: 'No document found' },
    { supplier: 'Quillon Talent Search', spend12: 4400000, note: 'Unsigned draft only' },
    { supplier: 'Lingua Bridge Translations', spend12: 2760000, note: 'No document found' },
    { supplier: 'Utsav Events', spend12: 2130000, note: 'No document found' }
  ];

  /* Example contracts for the "Add a contract" screen. */
  const samples = [
    { name: 'Trishul Security Services', hint: 'Typed text, numbered clauses', text:
`SECURITY SERVICES AGREEMENT

1. Parties. This Agreement is made on 1 May 2025 between Trishul Security Services Private Limited, Bengaluru ("Trishul"), and Vindhya Consumer Brands Limited ("Customer").
2. Term. The Agreement starts on 1 May 2025 for an initial term of two years, ending 30 April 2027. It then renews for further periods of one year unless either party gives at least 120 days' written notice before the end of the current period.
3. Services. Trishul will provide security guards at Customer's three distribution centres, 24 hours a day. Trishul holds a valid licence under the Private Security Agencies (Regulation) Act, 2005 and will keep it in force.
4. Charges. Customer will pay Rs. 24,800 per guard per month, excluding GST. If the applicable minimum wage is revised by government notification, the charge changes by the same amount from the date of the notification.
5. Payment. Invoices are issued monthly and are payable within 30 days, after deduction of tax at source as required by law.
6. Service levels. Trishul will fill at least 98% of scheduled shifts each month. If it fills fewer, Customer may deduct 1.5 times the charge for each unfilled shift.
7. Statutory dues. Trishul will pay wages, PF and ESI for all guards on time and give Customer the challans by the 20th of the following month.
8. Liability. Trishul's liability for loss or theft of Customer property is limited to Rs. 25,00,000 per incident.
9. Termination. Customer may terminate on 90 days' notice if Trishul loses its licence or misses the service level in three consecutive months.
10. Notices. Notices must be sent by registered post to the registered office of the other party.
11. Governing law. This Agreement is governed by the laws of India. The courts at Bengaluru have exclusive jurisdiction.` },
    { name: 'Godavari Packaging Industries', hint: 'Typed text, no clause numbers', text:
`PACKAGING SUPPLY AGREEMENT

Dated 10 March 2026, between Godavari Packaging Industries, Rajahmundry, a registered micro enterprise (the Supplier), and Vindhya Consumer Brands Limited (the Buyer).

Duration. This agreement runs from 1 April 2026 to 31 March 2028. There is no automatic renewal.

Prices. Corrugated cartons are supplied at the prices in Appendix A, excluding GST, fixed until 31 March 2027. After that date the Supplier may change prices on 60 days' notice to reflect kraft paper price movements, by no more than 7% in any year.

Minimum purchase. The Buyer will buy at least 15,00,000 cartons in each contract year. If it buys fewer, it will pay 20% of the price of the shortfall.

Delivery. The Supplier will deliver within 5 working days of each order. Deliveries more than 2 working days late carry a 3% price reduction on the late order.

Payment. Within 45 days of acceptance of the goods.

Quality. Goods that do not meet the specification may be rejected within 14 days of delivery and will be replaced at the Supplier's cost.

Ending the agreement. Either party may end it on 6 months' written notice.

Law. Indian law applies and the courts at Bengaluru have jurisdiction.` }
  ];

  /* Text drawn onto an image in the browser to stand in for a scanned paper contract. */
  const scanSample = { name: 'Malabar Fleet Leasing', title: 'VEHICLE LEASE AGREEMENT', paras: [
    '1. Parties. This Agreement is made on 1 August 2025 between Malabar Fleet Leasing Private Limited, Kochi ("Lessor"), and Vindhya Consumer Brands Limited, Bengaluru ("Lessee").',
    '2. Term. The Agreement continues until 31 July 2028 and then renews for successive periods of twelve (12) months unless either party gives written notice at least ninety (90) days before the end of the current period.',
    '3. Vehicles and rent. Lessor will supply forty (40) light commercial vehicles. Lessee will pay rent of Rs. 21,500 per vehicle per month, excluding GST.',
    '4. Rent revision. Lessor may revise the rent once a year by up to six percent (6%) on thirty (30) days\' notice.',
    '5. Maintenance. Lessor will carry out scheduled servicing and repairs at its cost. If a vehicle is off the road for more than three (3) working days, Lessor will provide a replacement or waive rent for the days lost.',
    '6. Early return. If Lessee returns a vehicle before 31 July 2028, Lessee will pay fifty percent (50%) of the rent for the unexpired period.',
    '7. Insurance. Lessor will keep each vehicle comprehensively insured. Lessee bears the first Rs. 25,000 of each claim.',
    '8. Payment. Rent is invoiced monthly in advance and is payable within thirty (30) days, after deduction of tax at source as required by law.',
    '9. Termination. Either party may terminate for material breach not cured within thirty (30) days of written notice.',
    '10. Governing law. This Agreement is governed by the laws of India. The courts at Kochi have exclusive jurisdiction.'
  ] };

  /* The five people who hold a role in this prototype. All names are invented. */
  const people = { finance: 'Ritika Deshmukh', legal: 'Rushikesh Kulkarni', procurement: 'Yash Patil', owner: 'Anuj Shinde', supplier: 'Udit Pawar' };

  /* What the company's old Excel tracker says today. Wrong or stale cells are found by comparing with the contracts. */
  const tracker = [
    { cid: 'C-001', end: '28 Feb 2027', notice: '60 days', price: 'US$58 × 400 seats', owner: 'Anuj Shinde' },
    { cid: 'C-002', end: '31 Mar 2027', notice: '60 days', price: 'Warehouse Associate ₹980 a day', owner: 'Anuj Shinde' },
    { cid: 'C-003', end: '30 Jun 2027', notice: 'No auto-renewal', price: 'Rate schedule', owner: 'Anuj Shinde' },
    { cid: 'C-004', end: '31 Dec 2025', notice: '60 days', price: '₹10,55,000 a month', owner: 'Rohit Kulkarni' },
    { cid: 'C-005', end: '30 Sep 2027', notice: 'No auto-renewal', price: '₹12,00,000 a month', owner: 'Ananya Iyer' },
    { cid: 'C-006', end: '31 Dec 2026', notice: 'No auto-renewal', price: 'Fees capped at £620,000', owner: 'Vikram Desai' },
    { cid: 'C-007', end: '31 May 2027', notice: '30 days', price: 'US$1,200,000 a year minimum', owner: 'Sneha Reddy' }
  ];

  window.DEMO = {
    company: 'Vindhya Consumer Brands', companyLegal: V, asOf: '2026-11-22',
    fx: { USD: 88, GBP: 116 }, /* sample conversion rates to rupees */
    contracts, invoices, payments, samples, scanSample, people, tracker
  };
})();
