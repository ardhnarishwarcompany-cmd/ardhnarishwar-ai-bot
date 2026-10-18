const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// One generated letter. Stores a frozen snapshot (rendered HTML + company
// profile) so an issued letter never changes if the template or the company
// profile is edited later.
const LetterRecord = sequelize.define('LetterRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  refNo: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  type: { type: DataTypes.STRING(40), allowNull: false },
  templateId: { type: DataTypes.INTEGER, allowNull: true },
  templateName: { type: DataTypes.STRING, allowNull: true },
  companyId: { type: DataTypes.INTEGER, allowNull: true },
  companyName: { type: DataTypes.STRING, allowNull: true },
  employeeName: { type: DataTypes.STRING, allowNull: false },
  employeeId: { type: DataTypes.STRING(80), allowNull: true },
  designation: { type: DataTypes.STRING, allowNull: true },
  subject: { type: DataTypes.STRING(300), allowNull: true },
  issueDate: { type: DataTypes.DATEONLY, allowNull: true },
  data: { type: DataTypes.JSON, allowNull: true }, // values entered in the form
  renderedHtml: { type: DataTypes.TEXT('long'), allowNull: false },
  companySnapshot: { type: DataTypes.JSON, allowNull: true },
  showSignature: { type: DataTypes.BOOLEAN, defaultValue: true },
  design: { type: DataTypes.JSON, allowNull: true }, // frozen copy of the template design at issue time
  status: { type: DataTypes.STRING(20), defaultValue: 'issued' }, // draft | issued | revoked
  createdBy: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'letter_records',
  timestamps: true,
});

module.exports = LetterRecord;