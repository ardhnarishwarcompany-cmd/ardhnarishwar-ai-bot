const express = require('express');
const router = express.Router();
const helperBotController = require('../controllers/helperBotController');

// Public endpoints for website visitors & users
router.post('/chat', helperBotController.handleChat);
router.get('/page-context', helperBotController.getPageContext);
router.get('/knowledge', helperBotController.getKnowledge);
router.get('/tours', helperBotController.getTours);
router.get('/features', helperBotController.getFeatures);
router.get('/explain-website', helperBotController.explainWebsite);
router.get('/main-7-modules', helperBotController.getMain7Modules);
router.get('/live-updates', helperBotController.getLiveUpdates);
router.post('/feedback', helperBotController.submitFeedback);

// Admin stats endpoint
router.get('/admin/stats', helperBotController.getAdminStats);

module.exports = router;
