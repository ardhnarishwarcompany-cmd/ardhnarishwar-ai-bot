// Light-weight HTML clean-up for admin-authored letter markup. Letters are
// only ever written by authenticated admins, so this is defence-in-depth:
// it strips scripts, embeds, inline event handlers and javascript: URLs.
function sanitizeHtml(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)\b[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1=$2#$2');
}

module.exports = { sanitizeHtml };