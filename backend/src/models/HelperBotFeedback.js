const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HelperBotFeedback = sequelize.define('HelperBotFeedback', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  messageId: {
    type: DataTypes.STRING,
  },
  userQuery: {
    type: DataTypes.TEXT,
  },
  botResponse: {
    type: DataTypes.TEXT,
  },
  pagePath: {
    type: DataTypes.STRING,
  },
  pageTitle: {
    type: DataTypes.STRING,
  },
  userRole: {
    type: DataTypes.STRING,
    defaultValue: 'guest',
  },
  isHelpful: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  feedbackComment: {
    type: DataTypes.STRING(500),
  },
}, {
  tableName: 'helper_bot_feedback',
  timestamps: true,
});

module.exports = HelperBotFeedback;
