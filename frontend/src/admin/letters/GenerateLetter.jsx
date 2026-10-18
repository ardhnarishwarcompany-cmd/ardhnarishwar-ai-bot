import { useEffect, useMemo, useState } from 'react';
import { createLetterRecord, getNextLetterRef } from '../../api/client';
import FormField from './FormField';
import { LetterPreview } from './LetterPaper';
import { formFieldsFor, renderLetter, todayIso } from './letterUtils';

export default function GenerateLetter({ meta, templates, companies, onGoTo }) {
  const activeTemplates = useMemo(() => templates.filter((t) => t.isActive), [templates]);
  const activeCompanies = useMemo(() => companies.filter((c) => c.isActive !== false), [companies]);

  const [templateId, setTemplateId] = useState(activeTemplates[0]?.id ?? null);
  const [companyId, setCompanyId] = useState((activeCompanies.find((c) => c.isDefault) || activeCompanies[0])?.id ?? null);
  const [values, setValues] = useState({});
  const [terms, setTerms] = useState([]);
  const [refNo, setRefNo] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { ok, text }

  const template = activeTemplates.find((t) => t.id === templateId) || null;
  const company = activeCompanies.find((c) => c.id === companyId) || null;
  const fields = useMemo(() => formFieldsFor(template, meta), [template, meta]);
  const usesTerms = Boolean(template && /\{\{\s*terms\s*\}\}/.test(template.body));

  // Switching template: keep values for fields that still exist, add defaults for new ones.
  useEffect(() => {
    if (!template) return;
    setTerms((template.terms || []).map((t) => ({ ...t, enabled: t.enabled !== false })));
    setValues((prev) => {
      const next = {};
      fields.forEach((f) => {
        next[f.key] = prev[f.key] ?? (f.key === 'issue_date' ? todayIso() : f.defaultValue ?? '');
      });
      return next;
    });
    setMessage(null);
  }, [template, fields]);

  const type = template?.type;
  useEffect(() => {
    if (!type) return;
    getNextLetterRef({ companyId, type }).then((r) => setRefNo(r.refNo)).catch(() => setRefNo(''));
  }, [companyId, type]);

  const setValue = (key, v) => setValues((p) => ({ ...p, [key]: v }));
  const setClause = (i, patch) => setTerms((p) => p.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));

  const preview = useMemo(
    () => (template ? renderLetter({ template, values, company, refNo, meta, terms, markMissing: true }) : null),
    [template, values, company, refNo, meta, terms],
  );

  async function save(status) {
    setMessage(null);
    const missing = fields.filter((f) => f.required && !String(values[f.key] ?? '').trim());
    if (missing.length) {
      setMessage({ ok: false, text: `Please fill: ${missing.map((f) => f.label).join(', ')}` });
      return;
    }
    const final = renderLetter({ template, values, company, refNo, meta, terms, markMissing: false });
    setSaving(true);
    try {
      const rec = await createLetterRecord({
        templateId: template.id,
        templateName: template.name,
        companyId: company?.id,
        companyName: company?.name,
        type: template.type,
        employeeName: values.employee_name,
        employeeId: values.employee_id,
        designation: values.designation,
        subject: final.subject,
        issueDate: values.issue_date,
        data: { ...values, terms },
        renderedHtml: final.bodyHtml,
        companySnapshot: company,
        showSignature: template.showSignature,
        design: template.design || null,
        refNo,
        status,
      });
      setMessage({ ok: true, text: `${status === 'draft' ? 'Draft saved' : 'Letter issued'} — Ref ${rec.refNo}. You can print / save it as PDF below.` });
      setRefNo(rec.refNo);
      getNextLetterRef({ companyId, type }).then(() => {}).catch(() => {});
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.error || 'Could not save the letter.' });
    } finally {
      setSaving(false);
    }
  }

  if (activeTemplates.length === 0) {
    return (
      <div className="admin-card">
        <p className="lt-muted">No active templates. Create or activate one in the Templates tab.</p>
        <button type="button" className="admin-btn admin-btn-gold" onClick={() => onGoTo('templates')}>Go to Templates</button>
      </div>
    );
  }

  // group fields for display
  const groups = [];
  fields.forEach((f) => {
    const g = f.group || 'Details';
    let bucket = groups.find((x) => x.name === g);
    if (!bucket) { bucket = { name: g, items: [] }; groups.push(bucket); }
    bucket.items.push(f);
  });

  return (
    <div className="lt-split">
      <div className="admin-form admin-card">
        <div className="lt-group">1 · Choose letter</div>
        <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
          {activeTemplates.map((t) => (
            <button key={t.id} type="button" className={`lt-tpl-card ${t.id === templateId ? 'is-active' : ''}`} onClick={() => setTemplateId(t.id)}>
              <div style={{ flex: 1 }}>
                <strong>{t.name}</strong>
                <span className="lt-muted">{t.description}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="lt-group">2 · Company / letterhead</div>
        <select value={companyId ?? ''} onChange={(e) => setCompanyId(Number(e.target.value))}>
          {activeCompanies.map((c) => <option key={c.id} value={c.id}>{c.name}{c.isDefault ? ' (default)' : ''}</option>)}
        </select>

        <div className="lt-group" style={{ marginTop: 22 }}>3 · Details</div>
        {groups.map((g) => (
          <div key={g.name}>
            <div className="lt-muted" style={{ margin: '14px 0 8px', fontWeight: 600 }}>{g.name}</div>
            <div className="lt-grid2">
              {g.items.map((f) => <FormField key={f.key} def={f} value={values[f.key]} onChange={(v) => setValue(f.key, v)} />)}
            </div>
          </div>
        ))}

        {usesTerms && (
          <>
            <div className="lt-group" style={{ marginTop: 24 }}>4 · Policies &amp; Terms</div>
            <p className="lt-muted" style={{ marginTop: 0 }}>Untick a clause to leave it out of this letter, or edit the wording. Changes here apply to this letter only.</p>
            {terms.map((t, i) => (
              <div className="lt-clause" key={i} style={{ opacity: t.enabled ? 1 : 0.55 }}>
                <div className="lt-clause-head">
                  <input type="checkbox" style={{ width: 'auto' }} checked={t.enabled} onChange={(e) => setClause(i, { enabled: e.target.checked })} />
                  <input type="text" value={t.title} onChange={(e) => setClause(i, { title: e.target.value })} placeholder="Clause title" />
                  <button type="button" className="lt-iconbtn" onClick={() => setTerms((p) => p.filter((_, idx) => idx !== i))}>Remove</button>
                </div>
                <textarea rows={3} value={t.text} onChange={(e) => setClause(i, { text: e.target.value })} />
              </div>
            ))}
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setTerms((p) => [...p, { title: '', text: '', enabled: true }])}>+ Add clause</button>
          </>
        )}

        {message && <p className={message.ok ? 'lt-ok' : 'lt-err'}>{message.text}</p>}

        <div className="lt-row" style={{ marginTop: 22, flexWrap: 'wrap' }}>
          <button type="button" className="admin-btn admin-btn-gold" disabled={saving} onClick={() => save('issued')}>{saving ? 'Saving…' : 'Save & Issue'}</button>
          <button type="button" className="admin-btn admin-btn-ghost" disabled={saving} onClick={() => save('draft')}>Save as Draft</button>
          <button type="button" className="admin-btn admin-btn-dark" onClick={() => window.print()}>Print / Save PDF</button>
        </div>
      </div>

      <div className="lt-sticky">
        {preview && (
          <LetterPreview
            company={company}
            refNo={refNo}
            issueDate={values.issue_date}
            subject={preview.subject}
            bodyHtml={preview.bodyHtml}
            showSignature={template.showSignature}
            design={template.design}
          />
        )}
        <p className="lt-muted" style={{ marginTop: 8 }}>Yellow [Field] marks show details not filled in yet. Use “Print / Save PDF” and choose “Save as PDF” as the destination.</p>
      </div>
    </div>
  );
}