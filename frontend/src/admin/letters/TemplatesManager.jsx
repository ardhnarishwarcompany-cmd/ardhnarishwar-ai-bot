import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createLetterTemplate, updateLetterTemplate, duplicateLetterTemplate, deleteLetterTemplate,
} from '../../api/client';
import { LetterPreview } from './LetterPaper';
import RichEditor from './RichEditor';
import DesignPanel from './DesignPanel';
import { renderLetter, sampleValues, todayIso } from './letterUtils';

const blank = (type = 'custom') => ({
  name: '', type, description: '', subject: '', showSignature: true, design: null, isActive: true, sortOrder: 50,
  body: '<p>Dear {{salutation}} {{employee_name}},</p>\n<p>Write your letter here. Use the field chips above to insert details such as {{designation}} or {{company_name}}.</p>\n{{terms}}',
  terms: [], fields: [],
});

export default function TemplatesManager({ meta, templates, companies, reload }) {
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? 'new');
  const [draft, setDraft] = useState(templates[0] ? clone(templates[0]) : blank());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const editorRef = useRef(null);

  function clone(t) {
    return { ...t, terms: (t.terms || []).map((x) => ({ ...x })), fields: (t.fields || []).map((x) => ({ ...x, options: x.options || [] })) };
  }

  function select(t) {
    setSelectedId(t ? t.id : 'new');
    setDraft(t ? clone(t) : blank());
    setMsg(null);
  }

  // keep the editor in sync after a reload (e.g. a duplicate was created)
  useEffect(() => {
    if (selectedId !== 'new' && !templates.some((t) => t.id === selectedId)) select(templates[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates]);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  function insert(text) {
    if (editorRef.current) editorRef.current.insert(text);
    else set({ body: draft.body + text });
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        ...draft,
        sortOrder: Number(draft.sortOrder) || 0,
        fields: draft.fields.map((f) => ({
          ...f,
          options: typeof f.options === 'string' ? f.options.split(',').map((s) => s.trim()).filter(Boolean) : f.options,
        })),
      };
      const saved = selectedId === 'new' ? await createLetterTemplate(payload) : await updateLetterTemplate(selectedId, payload);
      await reload();
      setSelectedId(saved.id);
      setDraft(clone(saved));
      setMsg({ ok: true, text: 'Template saved.' });
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.error || 'Could not save the template.' });
    } finally {
      setSaving(false);
    }
  }

  // push the current design to every template (one click, same look everywhere)
  async function applyDesignToAll() {
    if (!confirm('Use this design on ALL templates? Their wording stays the same; only the colours, header, footer and borders change.')) return;
    try {
      await Promise.all(templates.map((t) => updateLetterTemplate(t.id, { design: draft.design || {} })));
      await reload();
      setMsg({ ok: true, text: 'Design applied to all templates.' });
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.error || 'Could not apply the design to all templates.' });
    }
  }

  async function duplicate() {
    const copy = await duplicateLetterTemplate(selectedId);
    await reload();
    select(copy);
    setMsg({ ok: true, text: 'Duplicated — edit the copy freely.' });
  }

  async function remove() {
    if (!confirm('Delete this template? Letters already issued are not affected.')) return;
    try {
      await deleteLetterTemplate(selectedId);
      await reload();
      setMsg(null);
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.error || 'Could not delete.' });
    }
  }

  const current = templates.find((t) => t.id === selectedId);
  const company = companies.find((c) => c.isDefault) || companies[0];

  // chips: standard + custom + auto fields
  const chips = useMemo(() => [
    ...meta.standardFields.map((f) => f.key),
    ...draft.fields.map((f) => f.key).filter(Boolean),
    ...meta.autoFields.map((f) => f.key),
  ].filter((k, i, a) => a.indexOf(k) === i), [meta, draft.fields]);

  const previewMeta = meta;
  const preview = useMemo(
    () => renderLetter({
      template: draft,
      values: { ...sampleValues(meta), issue_date: todayIso() },
      company,
      refNo: 'HR/SAMPLE/0001',
      meta: previewMeta,
      markMissing: true,
    }),
    [draft, company, meta, previewMeta],
  );

  const setClause = (i, patch) => set({ terms: draft.terms.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) });
  const setField = (i, patch) => set({ fields: draft.fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) });

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10, marginBottom: 22 }}>
        {templates.map((t) => (
          <button key={t.id} type="button" className={`lt-tpl-card ${t.id === selectedId ? 'is-active' : ''}`} onClick={() => select(t)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong>{t.name}</strong>
              <span className="lt-muted" style={{ textTransform: 'capitalize' }}>{t.type}{t.isSystem ? ' · default' : ''}</span>
            </div>
            {!t.isActive && <span className="lt-badge is-off">Off</span>}
          </button>
        ))}
        <button type="button" className={`lt-tpl-card ${selectedId === 'new' ? 'is-active' : ''}`} onClick={() => select(null)}>
          <strong>+ New template</strong>
        </button>
      </div>

      <div className="lt-split">
        <div className="admin-form admin-card">
          <div className="lt-grid2">
            <div className="lt-span2"><label>Template name *</label><input value={draft.name} onChange={(e) => set({ name: e.target.value })} /></div>
            <div>
              <label>Letter type</label>
              <select value={draft.type} onChange={(e) => set({ type: e.target.value })}>
                {meta.types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div><label>Sort order</label><input type="number" value={draft.sortOrder} onChange={(e) => set({ sortOrder: e.target.value })} /></div>
            <div className="lt-span2"><label>Short description</label><input value={draft.description || ''} onChange={(e) => set({ description: e.target.value })} /></div>
            <div className="lt-span2"><label>Subject line (can use fields)</label><input value={draft.subject || ''} onChange={(e) => set({ subject: e.target.value })} placeholder="e.g. Offer of Employment – {{designation}}" /></div>
          </div>

          <label>Letter body</label>
          <div className="lt-muted" style={{ marginBottom: 4 }}>Type your letter like in Word. To add a detail that changes for every employee, click your cursor where it should go and then click a field below — it is filled in when the letter is generated.</div>
          <div className="lt-chips">
            {chips.map((k) => <button type="button" className="lt-chip" key={k} onMouseDown={(e) => { e.preventDefault(); insert(`{{${k}}}`); }}>{`{{${k}}}`}</button>)}
          </div>
          <RichEditor ref={editorRef} editorKey={selectedId} value={draft.body} onChange={(html) => set({ body: html })} />

          <div className="lt-group">Design</div>
          <DesignPanel
            design={draft.design}
            company={company}
            onChange={(design) => set({ design })}
            canApplyAll={templates.length > 1}
            onApplyAll={applyDesignToAll}
          />

          <div className="lt-group">Policies &amp; Terms (shown where the body has {'{{terms}}'})</div>
          {draft.terms.map((t, i) => (
            <div className="lt-clause" key={i}>
              <div className="lt-clause-head">
                <input type="checkbox" style={{ width: 'auto', margin: 0 }} checked={t.enabled !== false} onChange={(e) => setClause(i, { enabled: e.target.checked })} title="Included by default" />
                <input type="text" style={{ margin: 0 }} value={t.title} onChange={(e) => setClause(i, { title: e.target.value })} placeholder="Clause title" />
                <button type="button" className="lt-iconbtn" onClick={() => set({ terms: draft.terms.filter((_, idx) => idx !== i) })}>Remove</button>
              </div>
              <textarea rows={3} style={{ marginBottom: 0 }} value={t.text} onChange={(e) => setClause(i, { text: e.target.value })} placeholder="Clause text — fields like {{notice_period}} work here too" />
            </div>
          ))}
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => set({ terms: [...draft.terms, { title: '', text: '', enabled: true }] })}>+ Add clause</button>

          <div className="lt-group" style={{ marginTop: 26 }}>Custom fields</div>
          <p className="lt-muted" style={{ marginTop: 0 }}>Need a detail that isn’t in the standard list? Define it here, then insert <code>{'{{your_key}}'}</code> in the body.</p>
          {draft.fields.map((f, i) => (
            <div className="lt-clause" key={i}>
              <div className="lt-grid2">
                <div><label>Key (a–z, 0–9, _)</label><input value={f.key} onChange={(e) => setField(i, { key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} /></div>
                <div><label>Label</label><input value={f.label} onChange={(e) => setField(i, { label: e.target.value })} /></div>
                <div>
                  <label>Type</label>
                  <select value={f.type} onChange={(e) => setField(i, { type: e.target.value })}>
                    {['text', 'textarea', 'date', 'number', 'select'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label>Default value</label><input value={f.defaultValue || ''} onChange={(e) => setField(i, { defaultValue: e.target.value })} /></div>
                {f.type === 'select' && (
                  <div className="lt-span2"><label>Options (comma separated)</label>
                    <input value={Array.isArray(f.options) ? f.options.join(', ') : f.options} onChange={(e) => setField(i, { options: e.target.value })} />
                  </div>
                )}
              </div>
              <div className="lt-row">
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', margin: 0, textTransform: 'none', letterSpacing: 0 }}>
                  <input type="checkbox" style={{ width: 'auto', margin: 0 }} checked={Boolean(f.required)} onChange={(e) => setField(i, { required: e.target.checked })} /> Required
                </label>
                <button type="button" className="lt-iconbtn" onClick={() => set({ fields: draft.fields.filter((_, idx) => idx !== i) })}>Remove field</button>
              </div>
            </div>
          ))}
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => set({ fields: [...draft.fields, { key: '', label: '', type: 'text', defaultValue: '', required: false, options: [] }] })}>+ Add custom field</button>

          <div className="lt-group" style={{ marginTop: 26 }}>Options</div>
          <div className="lt-row" style={{ gap: 22, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', margin: 0, textTransform: 'none', letterSpacing: 0 }}>
              <input type="checkbox" style={{ width: 'auto', margin: 0 }} checked={draft.isActive} onChange={(e) => set({ isActive: e.target.checked })} /> Active (available when generating)
            </label>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', margin: 0, textTransform: 'none', letterSpacing: 0 }}>
              <input type="checkbox" style={{ width: 'auto', margin: 0 }} checked={draft.showSignature} onChange={(e) => set({ showSignature: e.target.checked })} /> Show signature block
            </label>
          </div>

          {msg && <p className={msg.ok ? 'lt-ok' : 'lt-err'}>{msg.text}</p>}
          <div className="lt-row" style={{ marginTop: 20, flexWrap: 'wrap' }}>
            <button type="button" className="admin-btn admin-btn-gold" disabled={saving || !draft.name || !draft.body} onClick={save}>{saving ? 'Saving…' : selectedId === 'new' ? 'Create template' : 'Save changes'}</button>
            {selectedId !== 'new' && <button type="button" className="admin-btn admin-btn-ghost" onClick={duplicate}>Duplicate</button>}
            {selectedId !== 'new' && !current?.isSystem && <button type="button" className="admin-btn admin-btn-ghost" onClick={remove}>Delete</button>}
          </div>
        </div>

        <div className="lt-sticky">
          <LetterPreview
            print={false}
            company={company}
            refNo="HR/SAMPLE/0001"
            issueDate={todayIso()}
            subject={preview.subject}
            bodyHtml={preview.bodyHtml}
            showSignature={draft.showSignature}
            design={draft.design}
          />
          <p className="lt-muted" style={{ marginTop: 8 }}>Live preview with sample data. Highlighted [Field] marks are filled in when you generate a letter.</p>
        </div>
      </div>
    </div>
  );
}