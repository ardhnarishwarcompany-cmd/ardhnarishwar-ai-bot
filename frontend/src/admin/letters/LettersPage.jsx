import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import {
  getLetterMeta, listLetterTemplates, listLetterCompanies,
} from '../../api/client';
import GenerateLetter from './GenerateLetter';
import TemplatesManager from './TemplatesManager';
import CompaniesManager from './CompaniesManager';
import IssuedLetters from './IssuedLetters';
import './letters.css';

const TABS = [
  { id: 'generate', label: 'Generate Letter' },
  { id: 'templates', label: 'Templates' },
  { id: 'companies', label: 'Companies' },
  { id: 'issued', label: 'Issued Letters' },
];

export default function LettersPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'generate';

  const [meta, setMeta] = useState(null);
  const [templates, setTemplates] = useState(null);
  const [companies, setCompanies] = useState(null);
  const [error, setError] = useState(null);

  const reloadTemplates = useCallback(() => listLetterTemplates().then((d) => { setTemplates(d); return d; }), []);
  const reloadCompanies = useCallback(() => listLetterCompanies().then((d) => { setCompanies(d); return d; }), []);

  useEffect(() => {
    Promise.all([getLetterMeta(), listLetterTemplates(), listLetterCompanies()])
      .then(([m, t, c]) => { setMeta(m); setTemplates(t); setCompanies(c); })
      .catch((err) => setError(err.response?.data?.error || 'Could not load HR Letters. Is the backend running?'));
  }, []);

  const ready = meta && templates && companies;

  return (
    <AdminLayout>
      <h1 className="admin-page-title">HR Letters</h1>
      <p className="admin-page-sub" style={{ marginBottom: 0 }}>
        Offer, Joining, Experience and Relieving letters — templates, letterheads and policies are all controlled here.
      </p>

      <div className="lt-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`lt-tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => setParams({ tab: t.id })}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="lt-err">{error}</p>}
      {!error && !ready && <p className="lt-muted">Loading…</p>}

      {ready && tab === 'generate' && (
        <GenerateLetter meta={meta} templates={templates} companies={companies} onGoTo={(t) => setParams({ tab: t })} />
      )}
      {ready && tab === 'templates' && (
        <TemplatesManager meta={meta} templates={templates} companies={companies} reload={reloadTemplates} />
      )}
      {ready && tab === 'companies' && (
        <CompaniesManager companies={companies} reload={reloadCompanies} />
      )}
      {ready && tab === 'issued' && <IssuedLetters meta={meta} />}
    </AdminLayout>
  );
}