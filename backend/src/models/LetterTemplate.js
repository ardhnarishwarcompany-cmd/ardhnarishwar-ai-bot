const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// A reusable HR letter format (Offer / Experience / Relieving / Joining / custom).
// `body` is HTML containing {{placeholders}} such as {{employee_name}} or
// {{company_name}}. The Generate screen reads the placeholders found in the
// body (plus `fields`, for custom ones) and builds its input form from them,
// so editing a template in the admin panel automatically changes the form.
const LetterTemplate = sequelize.define('LetterTemplate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  // offer | joining | experience | relieving | custom
  type: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'custom' },
  description: { type: DataTypes.STRING(500), allowNull: true },
  subject: { type: DataTypes.STRING(300), allowNull: true }, // supports {{placeholders}}
  body: { type: DataTypes.TEXT('long'), allowNull: false },
  // Policies & Terms clauses: [{ title, text, enabled }]. Rendered wherever
  // the body contains {{terms}}; can be edited per letter at generate time.
  terms: { type: DataTypes.JSON, allowNull: true },
  // Definitions for custom placeholders:
  // [{ key, label, type: text|textarea|date|number|select, required, defaultValue, options: [] }]
  fields: { type: DataTypes.JSON, allowNull: true },
  showSignature: { type: DataTypes.BOOLEAN, defaultValue: true },
  // Visual design of the letter (colours, header/footer style, borders, fonts,
  // watermark). See frontend/src/admin/letters/letterDesign.js for the shape.
  design: { type: DataTypes.JSON, allowNull: true },
  isSystem: { type: DataTypes.BOOLEAN, defaultValue: false }, // seeded default — can't be deleted, can be duplicated/edited
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'letter_templates',
  timestamps: true,
});

module.exports = LetterTemplate;