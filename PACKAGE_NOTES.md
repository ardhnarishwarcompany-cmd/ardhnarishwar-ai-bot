# Cleaned & verified package

What was checked (all passed):
- Backend: syntax check of every .js file, all `require()` paths resolve, app boots.
- Full run against a fresh MySQL/MariaDB: tables auto-create, `seed`, `seed:platform`,
  `seed:superadmin` run, admin login works, CMS endpoints return 200.
- HR Letters: templates / companies / next-ref / create record / status change / list work;
  `<script>` in letter HTML is stripped by the sanitizer; endpoints return 401 without a token.
- Frontend: `vite build` succeeds, oxlint = 0 errors (68 non-blocking warnings).
- All 162 API calls in `frontend/src/api/client.js` match a registered backend route.

What was cleaned:
- Removed 3 old nested zips (backend.zip, backend (2).zip, backend (3).zip) — duplicates of `backend/`.
- Removed `backend/.env` (it had local settings: UPLOADS_URL_BASE=http://localhost:5000/uploads
  would break images in production). Use `.env.example` as the base; keep the server's own .env.
- Removed empty literal `{config,controllers,...}` folders created by a bad mkdir.
- `frontend/dist` rebuilt fresh from current source (API = https://ardhnarishwar-backend.recruweb.com/api).

Deploy:
- Backend: upload `backend/` (no node_modules), keep existing server `.env`, `npm install`, startup file `src/server.js`.
- Frontend: upload `frontend/dist/` contents (incl. hidden `.htaccess`), or Node app with `server.cjs`.

---
# Update: Change Password (Admin, Client, Candidate)

New endpoints (all need the user's own login token, rate-limited to 10 tries / 15 min):
- Admin:     POST /api/auth/change-password
- Client:    POST /api/platform-auth/change-password
- Candidate: POST /api/candidate-auth/change-password
Body: { currentPassword, newPassword } (min 8 chars, must differ from current).

Where users see it:
- Admin  -> /admin/settings (card at the bottom)
- Client -> /portal profile page ("Change password" card under Account)
- Candidate -> /candidate profile page (same card)

Behaviour:
- Wrong current password returns 400 (not 401) so the user is not logged out by mistake.
- Client and Candidate: all OTHER devices are signed out, current browser stays logged in.
- Admin: the linked Super Admin login (Organizations / Roles / Subscriptions) is updated automatically,
  so `npm run seed:superadmin` no longer needs to be re-run after changing the password.
- Also fixed: frontend `platformResetPassword` sent `password` but backend expects `newPassword`.

Files: backend/src/utils/passwordPolicy.js (new), the 3 auth controllers + routes,
frontend/src/components/ChangePasswordCard.jsx (new, shared), admin/Settings.jsx,
portal/PortalProfile.jsx, candidate/CandidateProfile.jsx, api/client.js. Nothing else changed.
