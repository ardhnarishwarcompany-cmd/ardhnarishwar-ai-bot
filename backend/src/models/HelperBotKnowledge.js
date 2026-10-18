const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HelperBotKnowledge = sequelize.define('HelperBotKnowledge', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  category: {
    type: DataTypes.ENUM('general', 'page_guide', 'feature_guide', 'click_path', 'faq', 'guided_tour'),
    defaultValue: 'general',
  },
  page: {
    type: DataTypes.STRING,
    defaultValue: 'all', // e.g. '/', '/services', '/contact', '/admin/crm', or 'all'
  },
  triggerKeywords: {
    type: DataTypes.JSON, // e.g. ['hrms', 'attendance', 'demo', 'pricing']
    defaultValue: [],
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  actionType: {
    type: DataTypes.ENUM('none', 'navigate', 'highlight', 'tour', 'explain'),
    defaultValue: 'none',
  },
  actionPayload: {
    type: DataTypes.JSON, // e.g. { targetUrl: '/contact', targetSelector: '#contact-form', tourId: 'services-tour' }
    defaultValue: {},
  },
  quickReplies: {
    type: DataTypes.JSON, // e.g. ['Where should I click?', 'Book a Demo', 'Show me services']
    defaultValue: [],
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'helper_bot_knowledge',
  timestamps: true,
});

module.exports = HelperBotKnowledge;
