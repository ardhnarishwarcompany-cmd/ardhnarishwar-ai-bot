// Shared helpers for the HR Letters module: placeholder discovery, value
// building and rendering. Used by the template editor (live preview), the
// Generate screen and the Issued Letters viewer, so a letter always renders
// the same way everywhere.

const TOKEN_RE = /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g;

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Ordered, de-duplicated list of {{placeholders}} found in the given strings.
export function extractTokens(...sources) {
  const found = [];
  sources.flat().forEach((src) => {
    if (typeof src !== 'string') return;
    for (const m of src.matchAll(TOKEN_RE)) if (!found.includes(m[1])) found.push(m[1]);
  });
  return found;
}

export function todayIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// "2 years and 3 months", "5 months", "12 days" — from two ISO dates.
export function computeTenure(startIso, endIso) {
  if (!startIso || !endIso) return '';
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return '';
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (e.getDate() < s.getDate() - 1) months -= 1;
  if (months < 1) {
    const days = Math.round((e - s) / 86400000) + 1;
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} year${years === 1 ? '' : 's'}`);
  if (rest) parts.push(`${rest} month${rest === 1 ? '' : 's'}`);
  return parts.join(' and ');
}

// key -> field definition, from the standard catalogue plus a template's own
// custom fields (custom definitions win).
export function buildFieldDefs(meta, template) {
  const defs = {};
  (meta?.standardFields || []).forEach((f) => { defs[f.key] = f; });
  (template?.fields || []).forEach((f) => { defs[f.key] = { group: 'Additional details', ...f }; });
  return defs;
}

const autoKeys = (meta) => new Set((meta?.autoFields || []).map((f) => f.key));

// Which input fields the Generate form needs for a template, in a sensible order.
export function formFieldsFor(template, meta) {
  if (!template) return [];
  const defs = buildFieldDefs(meta, template);
  const auto = autoKeys(meta);
  const termsText = (template.terms || []).map((t) => `${t.title} ${t.text}`);
  const used = extractTokens(template.body, template.subject, termsText).filter((k) => !auto.has(k));
  ['employee_name', 'issue_date'].forEach((k) => { if (!used.includes(k)) used.push(k); });
  (template.fields || []).forEach((f) => { if (!used.includes(f.key)) used.push(f.key); });

  const order = (meta?.standardFields || []).map((f) => f.key);
  const rank = (k) => (order.includes(k) ? order.indexOf(k) : 1000 + used.indexOf(k));
  return used
    .sort((a, b) => rank(a) - rank(b))
    .map((k) => defs[k] || { key: k, label: k.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()), type: 'text', group: 'Additional details' });
}

// Resolves the value of any placeholder (already formatted for display, NOT escaped).
function makeResolver({ values, company, refNo, defs }) {
  const v = values || {};
  const c = company || {};
  const auto = {
    company_name: c.name,
    company_legal_name: c.legalName || c.name,
    company_address: c.address,
    company_email: c.email,
    company_phone: c.phone,
    company_website: c.website,
    company_reg_no: c.registrationNo,
    signatory_name: c.signatoryName,
    signatory_designation: c.signatoryDesignation,
    ref_no: refNo,
    tenure: v.tenure || computeTenure(v.joining_date, v.last_working_day),
  };
  return (key) => {
    if (key in auto) return auto[key] || '';
    const raw = v[key];
    if (raw === undefined || raw === null || raw === '') return '';
    return defs?.[key]?.type === 'date' ? formatDate(raw) : String(raw);
  };
}

const labelOf = (key, defs, meta) => (
  defs?.[key]?.label
  || (meta?.autoFields || []).find((f) => f.key === key)?.label
  || key.replace(/_/g, ' ')
);

/**
 * Renders a template to { subject, bodyHtml }.
 *  - values:  { key: value } entered in the form
 *  - terms:   clause list to use for {{terms}} (defaults to template.terms)
 *  - markMissing: show empty placeholders as highlighted [Label] (preview only)
 */
export function renderLetter({ template, values, company, refNo, meta, terms, markMissing = false }) {
  const defs = buildFieldDefs(meta, template);
  const resolve = makeResolver({ values, company, refNo, defs });

  const sub = (text, html) => String(text ?? '').replace(TOKEN_RE, (_, key) => {
    const val = resolve(key);
    if (!val) {
      if (!markMissing) return '';
      const mark = `[${labelOf(key, defs, meta)}]`;
      return html ? `<span class="lt-missing">${escapeHtml(mark)}</span>` : mark;
    }
    if (!html) return val;
    return escapeHtml(val).replace(/\n/g, '<br>');
  });

  const clauses = (terms || template?.terms || []).filter((t) => t.enabled !== false && (t.title || t.text));
  const termsHtml = clauses.length
    ? `<div class="lt-terms"><h4>Terms &amp; Conditions</h4><ol>${clauses
      .map((t) => `<li>${t.title ? `<strong>${escapeHtml(t.title)}.</strong> ` : ''}${sub(escapeHtml(t.text), true)}</li>`)
      .join('')}</ol></div>`
    : '';

  let body = String(template?.body || '').replace(/\{\{\s*terms\s*\}\}/g, '\u0000TERMS\u0000');
  body = sub(body, true).replace('\u0000TERMS\u0000', termsHtml);
  // drop paragraphs left empty because an optional field was blank
  if (!markMissing) body = body.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');

  return { subject: sub(template?.subject || '', false), bodyHtml: body };
}

// Example data used by the template editor's live preview.
export function sampleValues(meta) {
  const base = {
    salutation: 'Mr.', employee_name: 'Rahul Sharma', employee_id: 'EMP-0142', employee_address: '12 Lake View Road, Pune, Maharashtra',
    employee_email: 'rahul.sharma@example.com', designation: 'Senior Software Engineer', department: 'Engineering', location: 'Pune',
    employment_type: 'Full-time', reporting_manager: 'Priya Mehta', salary: 'INR 12,00,000 per annum', joining_date: '2024-03-04',
    offer_valid_till: '2026-10-25', resignation_date: '2026-09-15', last_working_day: '2026-10-15', probation_period: '6 months',
    notice_period: '30 days', working_hours: '9:30 AM to 6:30 PM, Monday to Friday', issue_date: todayIso(),
  };
  (meta?.standardFields || []).forEach((f) => { if (base[f.key] === undefined && f.defaultValue) base[f.key] = f.defaultValue; });
  return base;
}