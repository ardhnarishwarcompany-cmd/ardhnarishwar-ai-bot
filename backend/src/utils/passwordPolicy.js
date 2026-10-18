// Shared rules for the "Change password" feature (admin, client and candidate
// accounts all use the same policy so the three portals behave identically).
//
// Same minimum as registration / reset (8 chars). Max 72 because bcrypt only
// looks at the first 72 bytes — longer passwords would silently be truncated.
const MIN_LENGTH = 8;
const MAX_LENGTH = 72;

function validatePasswordChange(currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    return 'Current password and new password are required.';
  }
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return 'Invalid password.';
  }
  if (newPassword.length < MIN_LENGTH) {
    return `New password must be at least ${MIN_LENGTH} characters.`;
  }
  if (Buffer.byteLength(newPassword, 'utf8') > MAX_LENGTH) {
    return `New password must be at most ${MAX_LENGTH} characters.`;
  }
  if (newPassword === currentPassword) {
    return 'New password must be different from the current password.';
  }
  return null;
}

module.exports = { validatePasswordChange, MIN_LENGTH, MAX_LENGTH };
