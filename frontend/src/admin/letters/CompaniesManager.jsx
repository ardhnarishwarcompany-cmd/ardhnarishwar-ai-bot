import { useState } from 'react';
import {
  createLetterCompany, updateLetterCompany, deleteLetterCompany, uploadMedia, mediaUrl,
} from '../../api/client';
import { LetterPreview } from './LetterPaper';
import { todayIso } from './letterUtils';

const blank = () => ({
  name: '', legalName: '', logoUrl: '', address: '', email: '', phone: '', website: '', registrationNo: '',
  signatoryName: '', signatoryDesignation: '', signatureUrl: '', accentColor: '#281b3d', footerText: '',
  refPrefix: 'HR', isDefault: false, isActive: true,
});

function ImageField({ label, value, onChange }) {
  const [busy, setBusy] = useState(false);
  async function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { const m = await uploadMedia(file); onChange(m.url); } finally { setBusy(false); }
  }
  return (
    <div>
      <label>{label}</label>
      <div className="lt-imgbox">
        {value && <img src={mediaUrl(value)} alt="" />}
        <input type="file" accept="image/*" onChange={pick} style={{ marginBottom: 0 }} />
      </div>
      {busy && <div className="lt-muted">Uploading…</div>}
      {value && !busy && <button type="button" className="lt-link" style={{ paddingLeft: 0 }} onClick={() => onChange('')}>Remove</button>}
    </div>
  );
}

export default function CompaniesManager({ companies, reload }) {
  const [selectedId, setSelectedId] = useState(companies[0]?.id ?? 'new');
  const [draft, setDraft] = useState(companies[0] ? { ...blank(), ...companies[0] } : blank());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  function select(c) { setSelectedId(c ? c.id : 'new'); setDraft(c ? { ...blank(), ...c } : blank()); setMsg(null); }

  async function save() {
    setSaving(true); setMsg(null);
    try {
      const saved = selectedId === 'new' ? await createLetterCompany(draft) : await updateLetterCompany(selectedId, draft);
      await reload();
      setSelectedId(saved.id);
      setDraft({ ...blank(), ...saved });
      setMsg({ ok: true, text: 'Company saved.' });
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.error || 'Could not save.' });
    } finally { setSaving(false); }
  }

  async function remove() {
    if (!confirm('Delete this company profile? Issued letters keep their own copy of the letterhead.')) return;
    try {
      await deleteLetterCompany(selectedId);
      const list = await reload() || [];
      select(list[0] || null);
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.error || 'Could not delete.' });
    }
  }

  const sampleBody = '<p>Dear {Employee Name},</p><p>This is how the letterhead, signature and footer will look on every letter issued for this company.</p>';

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10, marginBottom: 22 }}>
        {companies.map((c) => (
          <button key={c.id} type="button" className={`lt-tpl-card ${c.id === selectedId ? 'is-active' : ''}`} onClick={() => select(c)}>
            <div style={{ flex: 1, minWidth: 0 }}><strong>{c.name}</strong><span className="lt-muted">{c.refPrefix}{c.isDefault ? ' · default' : ''}</span></div>
            {c.isActive === false && <span className="lt-badge is-off">Off</span>}
          </button>
        ))}
        <button type="button" className={`lt-tpl-card ${selectedId === 'new' ? 'is-active' : ''}`} onClick={() => select(null)}><strong>+ New company</strong></button>
      </div>

      <div className="lt-split">
        <div className="admin-form admin-card">
          <div className="lt-grid2">
            <div><label>Company name *</label><input value={draft.name} onChange={(e) => set({ name: e.target.value })} /></div>
            <div><label>Legal name</label><input value={draft.legalName || ''} onChange={(e) => set({ legalName: e.target.value })} /></div>
            <div className="lt-span2"><label>Address</label><textarea rows={2} value={draft.address || ''} onChange={(e) => set({ address: e.target.value })} /></div>
            <div><label>Email</label><input value={draft.email || ''} onChange={(e) => set({ email: e.target.value })} /></div>
            <div><label>Phone</label><input value={draft.phone || ''} onChange={(e) => set({ phone: e.target.value })} /></div>
            <div><label>Website</label><input value={draft.website || ''} onChange={(e) => set({ website: e.target.value })} /></div>
            <div><label>Registration / CIN / GST no.</label><input value={draft.registrationNo || ''} onChange={(e) => set({ registrationNo: e.target.value })} /></div>
            <div><label>Signatory name</label><input value={draft.signatoryName || ''} onChange={(e) => set({ signatoryName: e.target.value })} /></div>
            <div><label>Signatory designation</label><input value={draft.signatoryDesignation || ''} onChange={(e) => set({ signatoryDesignation: e.target.value })} /></div>
            <ImageField label="Logo" value={draft.logoUrl} onChange={(v) => set({ logoUrl: v })} />
            <ImageField label="Signature image (optional)" value={draft.signatureUrl} onChange={(v) => set({ signatureUrl: v })} />
            <div><label>Accent colour</label><input type="color" style={{ height: 44, padding: 4 }} value={draft.accentColor || '#281b3d'} onChange={(e) => set({ accentColor: e.target.value })} /></div>
            <div><label>Reference prefix</label><input value={draft.refPrefix || ''} onChange={(e) => set({ refPrefix: e.target.value })} placeholder="e.g. ARD" /></div>
            <div className="lt-span2"><label>Footer text</label><input value={draft.footerText || ''} onChange={(e) => set({ footerText: e.target.value })} /></div>
          </div>
          <div className="lt-row" style={{ gap: 22, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', margin: 0, textTransform: 'none', letterSpacing: 0 }}>
              <input type="checkbox" style={{ width: 'auto', margin: 0 }} checked={draft.isDefault} onChange={(e) => set({ isDefault: e.target.checked })} /> Default company
            </label>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', margin: 0, textTransform: 'none', letterSpacing: 0 }}>
              <input type="checkbox" style={{ width: 'auto', margin: 0 }} checked={draft.isActive !== false} onChange={(e) => set({ isActive: e.target.checked })} /> Active
            </label>
          </div>
          {msg && <p className={msg.ok ? 'lt-ok' : 'lt-err'}>{msg.text}</p>}
          <div className="lt-row" style={{ marginTop: 20 }}>
            <button type="button" className="admin-btn admin-btn-gold" disabled={saving || !draft.name} onClick={save}>{saving ? 'Saving…' : selectedId === 'new' ? 'Create company' : 'Save changes'}</button>
            {selectedId !== 'new' && <button type="button" className="admin-btn admin-btn-ghost" onClick={remove}>Delete</button>}
          </div>
        </div>

        <div className="lt-sticky">
          <LetterPreview print={false} company={draft} refNo={`${draft.refPrefix || 'HR'}/OFR/${new Date().getFullYear()}/0001`} issueDate={todayIso()} subject="Sample Letter" bodyHtml={sampleBody} showSignature />
        </div>
      </div>
    </div>
  );
}