import { useCallback, useEffect, useState } from 'react';
import {
  listLetterRecords, getLetterRecord, setLetterRecordStatus, deleteLetterRecord,
} from '../../api/client';
import { LetterPreview } from './LetterPaper';
import { formatDate } from './letterUtils';

export default function IssuedLetters({ meta }) {
  const [rows, setRows] = useState(null);
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [error, setError] = useState(null);
  const [viewing, setViewing] = useState(null);

  const load = useCallback(() => {
    listLetterRecords({ type: type || undefined, q: q || undefined })
      .then(setRows)
      .catch(() => setError('Could not load issued letters.'));
  }, [type, q]);

  useEffect(() => { load(); }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  async function view(row) { setViewing(await getLetterRecord(row.id)); }

  async function toggleRevoke(row) {
    await setLetterRecordStatus(row.id, row.status === 'revoked' ? 'issued' : 'revoked');
    load();
  }

  async function remove(row) {
    if (!confirm(`Delete letter ${row.refNo}? This can't be undone.`)) return;
    await deleteLetterRecord(row.id);
    load();
  }

  return (
    <div className="admin-card admin-form">
      <form className="lt-row" style={{ flexWrap: 'wrap', marginBottom: 14 }} onSubmit={(e) => { e.preventDefault(); load(); }}>
        <select style={{ width: 200, marginBottom: 0 }} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All letter types</option>
          {meta.types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input style={{ width: 280, marginBottom: 0 }} placeholder="Search name, employee ID, ref no…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="admin-btn admin-btn-ghost">Search</button>
      </form>

      {error && <p className="lt-err">{error}</p>}
      {!error && !rows && <p className="lt-muted">Loading…</p>}
      {rows && rows.length === 0 && <p className="lt-muted">No letters yet — generate your first one from the “Generate Letter” tab.</p>}

      {rows && rows.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="lt-table-list">
            <thead><tr><th>Ref no.</th><th>Letter</th><th>Employee</th><th>Company</th><th>Date</th><th>Status</th><th /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.refNo}</td>
                  <td>{r.templateName || r.type}</td>
                  <td>{r.employeeName}{r.employeeId ? <span className="lt-muted"> · {r.employeeId}</span> : null}</td>
                  <td>{r.companyName}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.issueDate)}</td>
                  <td><span className={`lt-badge ${r.status === 'revoked' ? 'is-revoked' : r.status === 'issued' ? 'is-ok' : 'is-off'}`}>{r.status}</span></td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <button type="button" className="lt-link" onClick={() => view(r)}>View / Print</button>
                    <button type="button" className="lt-link" onClick={() => toggleRevoke(r)}>{r.status === 'revoked' ? 'Reinstate' : 'Revoke'}</button>
                    <button type="button" className="lt-link" style={{ color: '#d64545' }} onClick={() => remove(r)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,12,30,.72)', zIndex: 1000, overflow: 'auto', padding: 24 }} onClick={() => setViewing(null)}>
          <div style={{ maxWidth: 900, margin: '0 auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="lt-row" style={{ marginBottom: 12 }}>
              <button type="button" className="admin-btn admin-btn-gold" onClick={() => window.print()}>Print / Save PDF</button>
              <button type="button" className="admin-btn admin-btn-ghost" style={{ background: '#fff' }} onClick={() => setViewing(null)}>Close</button>
              <span style={{ color: '#fff', fontSize: 13 }}>{viewing.refNo}{viewing.status === 'revoked' ? ' — REVOKED' : ''}</span>
            </div>
            <LetterPreview
              company={viewing.companySnapshot}
              refNo={viewing.refNo}
              issueDate={viewing.issueDate}
              subject={viewing.subject}
              bodyHtml={viewing.renderedHtml}
              showSignature={viewing.showSignature}
              design={viewing.design}
            />
          </div>
        </div>
      )}
    </div>
  );
}