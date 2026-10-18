const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/letterController');
const { requireAdmin } = require('../middleware/auth');

// Everything in the HR Letters module is admin-only.
router.use(requireAdmin);

router.get('/meta', ctrl.meta);

router.get('/templates', ctrl.listTemplates);
router.post('/templates', ctrl.createTemplate);
router.post('/templates/:id/duplicate', ctrl.duplicateTemplate);
router.put('/templates/:id', ctrl.updateTemplate);
router.delete('/templates/:id', ctrl.removeTemplate);

router.get('/companies', ctrl.listCompanies);
router.post('/companies', ctrl.createCompany);
router.put('/companies/:id', ctrl.updateCompany);
router.delete('/companies/:id', ctrl.removeCompany);

router.get('/next-ref', ctrl.nextRef);
router.get('/records', ctrl.listRecords);
router.get('/records/:id', ctrl.getRecord);
router.post('/records', ctrl.createRecord);
router.patch('/records/:id/status', ctrl.updateRecordStatus);
router.delete('/records/:id', ctrl.removeRecord);

module.exports = router;