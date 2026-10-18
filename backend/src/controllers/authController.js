const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { validatePasswordChange } = require('../utils/passwordPolicy');

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.', details: err.message });
  }
}

// Returns the currently logged-in admin, based on the token
async function me(req, res) {
  try {
    const admin = await Admin.findByPk(req.admin.id, {
      attributes: ['id', 'name', 'email'],
    });
    if (!admin) return res.status(404).json({ error: 'Admin not found.' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: 'Could not load profile.', details: err.message });
  }
}

// Change the logged-in admin's own password.
// A wrong "current password" returns 400 (not 401) on purpose: the frontend
// treats 401 as "session expired" and would log the admin out.
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const problem = validatePasswordChange(currentPassword, newPassword);
    if (problem) return res.status(400).json({ error: problem });

    const admin = await Admin.findByPk(req.admin.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found.' });

    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect.' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    admin.passwordHash = passwordHash;
    await admin.save();

    // The CMS admin is mirrored as a platform Super Admin user (see
    // seedSuperAdmin.js) that shares this password hash. Keep it in sync so
    // the same new password works for the Organizations / Roles /
    // Subscriptions sections - no need to re-run `npm run seed:superadmin`.
    try {
      const { User } = require('../models/platform/platformAssociations');
      const mirrored = await User.findOne({ where: { email: admin.email, isSuperAdmin: true } });
      if (mirrored) {
        mirrored.passwordHash = passwordHash;
        await mirrored.save();
      }
    } catch (syncErr) {
      console.error('Super admin password sync skipped:', syncErr.message);
    }

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not change password.', details: err.message });
  }
}

module.exports = { login, me, changePassword };
