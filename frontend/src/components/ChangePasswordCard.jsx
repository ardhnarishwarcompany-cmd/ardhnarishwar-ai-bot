import { useMemo, useState } from 'react';
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const MIN_LENGTH = 8;
const MAX_LENGTH = 72;

// 0-4 score, purely a visual hint. The server enforces the real rules
// (min 8 chars, must differ from the current password).
function passwordScore(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= MIN_LENGTH) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  else if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score += 0.5;
  return Math.min(4, Math.floor(score));
}

const STRENGTH = [
  { label: 'Too short', color: '#d1d5db' },
  { label: 'Weak', color: '#ef4444' },
  { label: 'Fair', color: '#f59e0b' },
  { label: 'Good', color: '#84cc16' },
  { label: 'Strong', color: '#16a34a' },
];

const inputClass =
  'w-full border border-line rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-gold';

function PasswordField({ id, label, value, onChange, autoComplete, show, onToggle, disabled }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-muted mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={MAX_LENGTH}
          disabled={disabled}
          className={inputClass}
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

/**
 * Reusable "Change password" card. Used by the admin Settings page, the Client
 * Portal profile and the Candidate profile, so all three behave the same.
 *
 * Props:
 *   onSubmit(currentPassword, newPassword) -> Promise   (throws on failure)
 *   description  optional helper text under the title
 */
export default function ChangePasswordCard({ onSubmit, description }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const score = useMemo(() => passwordScore(next), [next]);
  const strength = STRENGTH[next ? Math.max(score, next.length >= MIN_LENGTH ? 1 : 0) : 0];
  const mismatch = confirm.length > 0 && next !== confirm;

  function clearMessages() {
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearMessages();

    if (!current || !next || !confirm) {
      setError('Please fill in all the fields.');
      return;
    }
    if (next.length < MIN_LENGTH) {
      setError(`New password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (next !== confirm) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (next === current) {
      setError('New password must be different from the current password.');
      return;
    }

    setSaving(true);
    try {
      const res = await onSubmit(current, next);
      setSuccess(res?.message || 'Password updated successfully.');
      setCurrent('');
      setNext('');
      setConfirm('');
      setShow(false);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          (err?.response?.status === 429
            ? 'Too many attempts. Please try again in a few minutes.'
            : 'Could not change password. Please try again.')
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-line p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound size={18} className="text-gold" />
        <h2 className="text-base font-semibold text-ink">Change password</h2>
      </div>
      <p className="text-xs text-muted mb-5">
        {description || 'Use a strong password you do not use anywhere else.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md" noValidate>
        <PasswordField
          id="cp-current"
          label="Current password"
          value={current}
          onChange={(v) => { setCurrent(v); clearMessages(); }}
          autoComplete="current-password"
          show={show}
          onToggle={() => setShow((s) => !s)}
          disabled={saving}
        />
        <div>
          <PasswordField
            id="cp-new"
            label="New password"
            value={next}
            onChange={(v) => { setNext(v); clearMessages(); }}
            autoComplete="new-password"
            show={show}
            onToggle={() => setShow((s) => !s)}
            disabled={saving}
          />
          {next && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 flex-1 rounded-full"
                    style={{ background: i <= score ? strength.color : '#e5e7eb' }}
                  />
                ))}
              </div>
              <p className="text-[11px] mt-1" style={{ color: strength.color }}>
                {next.length < MIN_LENGTH ? `At least ${MIN_LENGTH} characters required` : strength.label}
              </p>
            </div>
          )}
        </div>
        <div>
          <PasswordField
            id="cp-confirm"
            label="Confirm new password"
            value={confirm}
            onChange={(v) => { setConfirm(v); clearMessages(); }}
            autoComplete="new-password"
            show={show}
            onToggle={() => setShow((s) => !s)}
            disabled={saving}
          />
          {mismatch && <p className="text-[11px] text-red-500 mt-1">Passwords do not match.</p>}
        </div>

        {error && (
          <p className="flex items-start gap-1.5 text-sm text-red-600" role="alert">
            <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}
        {success && (
          <p className="flex items-start gap-1.5 text-sm" style={{ color: '#2f7a4d' }} role="status">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> {success}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 text-sm font-semibold bg-ink px-5 py-2.5 rounded-lg hover:bg-teal transition disabled:opacity-60"
          style={{ color: '#fbf8f2' }}
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Updating…
            </>
          ) : (
            'Update password'
          )}
        </button>
      </form>
    </section>
  );
}
