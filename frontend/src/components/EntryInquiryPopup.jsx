import { useEffect, useState } from 'react';
import { X, ArrowRight, Check, Building2, UserRound } from 'lucide-react';
import { submitContactForm } from '../api/client';
import './EntryInquiryPopup.css';

// Popup sirf public website pages par dikhega (admin / portal / candidate area me nahi)
const HIDDEN_PREFIXES = ['/admin', '/portal', '/candidate'];

function shouldShowOnEntry() {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname;
  return !HIDDEN_PREFIXES.some((x) => p === x || p.startsWith(x + '/'));
}

const EXPERIENCE = ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'];

const emptyClient = { name: '', email: '', phone: '', company: '', message: '' };
const emptyCandidate = { name: '', email: '', phone: '', location: '', role: '', experience: '', message: '' };

export default function EntryInquiryPopup() {
  // Koi localStorage/sessionStorage nahi: isliye har page load / refresh par popup dubara khulega.
  // SPA ke andar page change karne par dobara nahi khulega (sirf entry/refresh par).
  const [open, setOpen] = useState(shouldShowOnEntry);
  const [tab, setTab] = useState('client');
  const [client, setClient] = useState(emptyClient);
  const [candidate, setCandidate] = useState(emptyCandidate);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open) return null;

  const isClient = tab === 'client';
  const switchTab = (t) => { setTab(t); setError(''); setDone(false); };

  const onClient = (e) => setClient((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onCandidate = (e) => setCandidate((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isClient) {
        await submitContactForm({
          name: client.name,
          email: client.email,
          phone: client.phone,
          company: client.company,
          subject: 'Client Inquiry',
          interestedIn: 'Client Inquiry',
          source: 'entry-popup-client',
          message: client.message,
        });
        setClient(emptyClient);
      } else {
        const message = [
          '[CANDIDATE INQUIRY]',
          candidate.role ? `Role / field: ${candidate.role}` : null,
          candidate.experience ? `Experience: ${candidate.experience}` : null,
          candidate.location ? `Location: ${candidate.location}` : null,
          '',
          candidate.message,
        ].filter((x) => x !== null)
          .join('\n');
        await submitContactForm({
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          company: '',
          subject: 'Candidate Inquiry',
          interestedIn: 'Candidate Inquiry',
          source: 'entry-popup-candidate',
          message,
        });
        setCandidate(emptyCandidate);
      }
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not send your inquiry. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="eip-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="eip-modal" role="dialog" aria-modal="true" aria-labelledby="eip-title">
        <button type="button" className="eip-close" onClick={() => setOpen(false)} aria-label="Close">
          <X size={18} />
        </button>

        <div className="eip-head">
          <div className="eip-kicker">Welcome to Ardhnarishwar</div>
          <h2 id="eip-title">How can we help you?</h2>
          <p>Choose who you are and send us a quick inquiry.</p>
        </div>

        <div className="eip-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={isClient} className={`eip-tab ${isClient ? 'is-active' : ''}`} onClick={() => switchTab('client')}>
            <Building2 size={16} /> I'm a Client
          </button>
          <button type="button" role="tab" aria-selected={!isClient} className={`eip-tab ${!isClient ? 'is-active' : ''}`} onClick={() => switchTab('candidate')}>
            <UserRound size={16} /> I'm a Candidate
          </button>
        </div>

        {done ? (
          <div className="eip-success">
            <div className="eip-success-icon"><Check size={26} /></div>
            <h3>Thank you!</h3>
            <p>Your inquiry has been received. Our team will contact you shortly.</p>
            <button type="button" className="eip-submit" onClick={() => setOpen(false)}>
              Continue to website <ArrowRight size={16} />
            </button>
          </div>
        ) : isClient ? (
          <form className="eip-form" onSubmit={submit}>
            <div className="eip-row">
              <label>Name *<input required name="name" value={client.name} onChange={onClient} placeholder="Your name" /></label>
              <label>Work email *<input required type="email" name="email" value={client.email} onChange={onClient} placeholder="you@company.com" /></label>
            </div>
            <div className="eip-row">
              <label>Phone<input type="tel" name="phone" value={client.phone} onChange={onClient} placeholder="+91 ..." /></label>
              <label>Company<input name="company" value={client.company} onChange={onClient} placeholder="Company name" /></label>
            </div>
            <label>What do you need? *
              <textarea required rows={3} name="message" value={client.message} onChange={onClient} placeholder="e.g. Hiring support, HRMS, AI recruitment, staffing..." />
            </label>
            {error && <div className="eip-error">{error}</div>}
            <button className="eip-submit" type="submit" disabled={busy}>
              {busy ? 'Sending...' : 'Send inquiry'} {!busy && <ArrowRight size={16} />}
            </button>
          </form>
        ) : (
          <form className="eip-form" onSubmit={submit}>
            <div className="eip-row">
              <label>Full name *<input required name="name" value={candidate.name} onChange={onCandidate} placeholder="Your name" /></label>
              <label>Email *<input required type="email" name="email" value={candidate.email} onChange={onCandidate} placeholder="you@email.com" /></label>
            </div>
            <div className="eip-row">
              <label>Phone *<input required type="tel" name="phone" value={candidate.phone} onChange={onCandidate} placeholder="+91 ..." /></label>
              <label>Location<input name="location" value={candidate.location} onChange={onCandidate} placeholder="City" /></label>
            </div>
            <div className="eip-row">
              <label>Role / field<input name="role" value={candidate.role} onChange={onCandidate} placeholder="e.g. Java Developer, HR, Sales" /></label>
              <label>Experience
                <select name="experience" value={candidate.experience} onChange={onCandidate}>
                  <option value="">Select</option>
                  {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
            </div>
            <label>What are you looking for? *
              <textarea required rows={3} name="message" value={candidate.message} onChange={onCandidate} placeholder="Job type, expected role, anything we should know..." />
            </label>
            {error && <div className="eip-error">{error}</div>}
            <button className="eip-submit" type="submit" disabled={busy}>
              {busy ? 'Sending...' : 'Send inquiry'} {!busy && <ArrowRight size={16} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}