# Deploy fix: /services/<slug> 404 on Hostinger

Cause: Hostinger answered direct/refresh URLs like /services/hrms-workforce-management
with its own 404 because the React (BrowserRouter) routes don't exist as real files.

## Frontend (ardhnarishwar.recruweb.com)
Node.js app:  upload `frontend/server.cjs` + `frontend/dist/` + `frontend/package.json`
              (same folder), Startup file = `server.cjs`, then Restart.
Static host:  upload the CONTENTS of `frontend/dist/` (incl. hidden `.htaccess`) to public_html.
`frontend/public/.htaccess` makes every future `npm run build` include the rule automatically.

## Backend (ardhnarishwar-backend.recruweb.com)
No code change needed. Startup file `src/server.js`. Keep your existing production `.env`
on the server (do NOT overwrite it with the one in this zip). No node_modules in zip:
run `npm install` on the server.

## Test
Open /services/hrms-workforce-management directly and press F5 -> must load.
