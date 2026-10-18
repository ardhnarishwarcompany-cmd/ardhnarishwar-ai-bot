const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Letterhead / issuer profile. Several can exist so the same templates can be
// used for different companies or organizations.
const LetterCompany = sequelize.define('LetterCompany', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false }, // display name
  legalName: { type: DataTypes.STRING, allowNull: true },
  logoUrl: { type: DataTypes.STRING(500), allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING(60), allowNull: true },
  website: { type: DataTypes.STRING, allowNull: true },
  registrationNo: { type: DataTypes.STRING, allowNull: true }, // CIN / GST / company no.
  signatoryName: { type: DataTypes.STRING, allowNull: true },
  signatoryDesignation: { type: DataTypes.STRING, allowNull: true },
  signatureUrl: { type: DataTypes.STRING(500), allowNull: true },
  accentColor: { type: DataTypes.STRING(20), defaultValue: '#281b3d' },
  footerText: { type: DataTypes.STRING(500), allowNull: true },
  refPrefix: { type: DataTypes.STRING(20), defaultValue: 'HR' }, // used in reference numbers
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'letter_companies',
  timestamps: true,
});

module.exports = LetterCompany;