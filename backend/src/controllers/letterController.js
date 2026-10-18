const slugify = require('slugify');
const { Op } = require('sequelize');
const LetterTemplate = require('../models/LetterTemplate');
const LetterCompany = require('../models/LetterCompany');
const LetterRecord = require('../models/LetterRecord');
const { sanitizeHtml } = require('../utils/sanitizeHtml');
const { LETTER_TYPES, STANDARD_FIELDS, AUTO_FIELDS } = require('../letterDefaults');

const TYPE_CODE = { offer: 'OFR', joining: 'JOI', experience: 'EXP', relieving: 'REL', custom: 'LTR' };

function fail(res, status, error, err) {
  res.status(status).json({ error, details: err ? err.message : undefined });
}

const pick = (obj, keys) => keys.reduce((o, k) => (obj[k] !== undefined ? { ...o, [k]: obj[k] } : o), {});

// ---------------------------------------------------------------- meta
async function meta(req, res) {
  res.json({ types: LETTER_TYPES, standardFields: STANDARD_FIELDS, autoFields: AUTO_FIELDS });
}

// ----------------------------------------------------------- templates
const TEMPLATE_FIELDS = ['name', 'type', 'description', 'subject', 'body', 'terms', 'fields', 'showSignature', 'design', 'isActive', 'sortOrder'];

// ---- letter design: whitelist + validate every value (it ends up in CSS) ----
const DESIGN_ENUMS = {
  headerLayout: ['left', 'center', 'right', 'banner'],
  headerBorder: ['none', 'bottom', 'box', 'double'],
  borderStyle: ['solid', 'double', 'dashed', 'dotted'],
  pageBorder: ['none', 'single', 'double', 'frame'],
  footerLayout: ['center', 'split', 'bar'],
  footerBorder: ['none', 'top', 'box', 'double'],
  subjectStyle: ['lines', 'filled', 'boxed', 'underline', 'plain'],
  fontFamily: ['serif', 'sans', 'modern', 'classic'],
  watermarkType: ['none', 'text', 'logo'],
  align: ['left', 'center', 'right'],
};
const DESIGN_COLORS = ['primaryColor', 'secondaryColor', 'headerBg', 'headerText', 'footerBg', 'footerText',
  'pageBorderColor', 'tableHeaderBg', 'bodyText', 'watermarkColor'];
const DESIGN_NUMS = {
  headerBorderWidth: [0, 12], footerBorderWidth: [0, 12], pageBorderWidth: [0, 12], baseFontSize: [9, 16],
  watermarkOpacity: [0.02, 0.3], headerPadding: [0, 30], logoSize: [30, 160], pageMargin: [0, 20],
};
const DESIGN_BOOLS = ['showFooterContact', 'tableStriped', 'showCompanyName'];

function cleanDesign(input) {
  if (input === null) return null;
  if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined;
  const out = {};
  Object.entries(DESIGN_ENUMS).forEach(([k, allowed]) => { if (allowed.includes(input[k])) out[k] = input[k]; });
  DESIGN_COLORS.forEach((k) => { if (/^#[0-9a-fA-F]{6}$/.test(String(input[k] || ''))) out[k] = input[k]; });
  Object.entries(DESIGN_NUMS).forEach(([k, [min, max]]) => {
    const n = Number(input[k]);
    if (input[k] !== '' && input[k] !== null && input[k] !== undefined && Number.isFinite(n)) out[k] = Math.min(max, Math.max(min, n));
  });
  DESIGN_BOOLS.forEach((k) => { if (typeof input[k] === 'boolean') out[k] = input[k]; });
  if (typeof input.watermarkText === 'string') out.watermarkText = input.watermarkText.slice(0, 40);
  if (typeof input.footerLeft === 'string') out.footerLeft = input.footerLeft.slice(0, 200);
  if (typeof input.footerRight === 'string') out.footerRight = input.footerRight.slice(0, 200);
  if (typeof input.tagline === 'string') out.tagline = input.tagline.slice(0, 160);
  return out;
}

function cleanTemplate(body) {
  const data = pick(body, TEMPLATE_FIELDS);
  if (data.design !== undefined) {
    const d = cleanDesign(data.design);
    if (d === undefined) delete data.design; else data.design = d;
  }
  if (data.body !== undefined) data.body = sanitizeHtml(data.body);
  if (data.terms !== undefined) {
    data.terms = (Array.isArray(data.terms) ? data.terms : [])
      .filter((t) => t && (t.title || t.text))
      .map((t) => ({ title: String(t.title || ''), text: sanitizeHtml(String(t.text || '')), enabled: t.enabled !== false }));
  }
  if (data.fields !== undefined) {
    data.fields = (Array.isArray(data.fields) ? data.fields : [])
      .filter((f) => f && /^[a-z][a-z0-9_]*$/.test(f.key || ''))
      .map((f) => ({
        key: f.key,
        label: String(f.label || f.key),
        type: ['text', 'textarea', 'date', 'number', 'select'].includes(f.type) ? f.type : 'text',
        required: Boolean(f.required),
        defaultValue: f.defaultValue || '',
        options: Array.isArray(f.options) ? f.options.map(String).filter(Boolean) : [],
      }));
  }
  return data;
}

async function uniqueSlug(base, ignoreId) {
  const root = slugify(base || 'template', { lower: true, strict: true }) || 'template';
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await LetterTemplate.findOne({ where: { slug, ...(ignoreId ? { id: { [Op.ne]: ignoreId } } : {}) } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

async function listTemplates(req, res) {
  try {
    const where = req.query.active === 'true' ? { isActive: true } : {};
    const items = await LetterTemplate.findAll({ where, order: [['sortOrder', 'ASC'], ['id', 'ASC']] });
    res.json(items);
  } catch (err) { fail(res, 500, 'Could not load templates.', err); }
}

async function createTemplate(req, res) {
  try {
    const data = cleanTemplate(req.body);
    if (!data.name || !data.body) return fail(res, 400, 'Template name and body are required.');
    data.slug = await uniqueSlug(data.name);
    data.isSystem = false;
    res.status(201).json(await LetterTemplate.create(data));
  } catch (err) { fail(res, 400, 'Could not create template.', err); }
}

async function updateTemplate(req, res) {
  try {
    const item = await LetterTemplate.findByPk(req.params.id);
    if (!item) return fail(res, 404, 'Template not found.');
    await item.update(cleanTemplate(req.body));
    res.json(item);
  } catch (err) { fail(res, 400, 'Could not update template.', err); }
}

async function duplicateTemplate(req, res) {
  try {
    const item = await LetterTemplate.findByPk(req.params.id);
    if (!item) return fail(res, 404, 'Template not found.');
    const copy = item.toJSON();
    delete copy.id; delete copy.createdAt; delete copy.updatedAt;
    copy.name = `${item.name} (Copy)`;
    copy.slug = await uniqueSlug(copy.name);
    copy.isSystem = false;
    res.status(201).json(await LetterTemplate.create(copy));
  } catch (err) { fail(res, 400, 'Could not duplicate template.', err); }
}

async function removeTemplate(req, res) {
  try {
    const item = await LetterTemplate.findByPk(req.params.id);
    if (!item) return fail(res, 404, 'Template not found.');
    if (item.isSystem) return fail(res, 400, 'Default templates cannot be deleted. Deactivate or duplicate it instead.');
    await item.destroy();
    res.json({ success: true });
  } catch (err) { fail(res, 500, 'Could not delete template.', err); }
}

// ----------------------------------------------------------- companies
const COMPANY_FIELDS = ['name', 'legalName', 'logoUrl', 'address', 'email', 'phone', 'website', 'registrationNo',
  'signatoryName', 'signatoryDesignation', 'signatureUrl', 'accentColor', 'footerText', 'refPrefix', 'isDefault', 'isActive'];

async function listCompanies(req, res) {
  try {
    res.json(await LetterCompany.findAll({ order: [['isDefault', 'DESC'], ['name', 'ASC']] }));
  } catch (err) { fail(res, 500, 'Could not load companies.', err); }
}

async function createCompany(req, res) {
  try {
    const data = pick(req.body, COMPANY_FIELDS);
    if (!data.name) return fail(res, 400, 'Company name is required.');
    if (data.refPrefix) data.refPrefix = String(data.refPrefix).replace(/[^A-Za-z0-9-]/g, '').toUpperCase().slice(0, 12) || 'HR';
    if (data.isDefault) await LetterCompany.update({ isDefault: false }, { where: {} });
    res.status(201).json(await LetterCompany.create(data));
  } catch (err) { fail(res, 400, 'Could not create company.', err); }
}

async function updateCompany(req, res) {
  try {
    const item = await LetterCompany.findByPk(req.params.id);
    if (!item) return fail(res, 404, 'Company not found.');
    const data = pick(req.body, COMPANY_FIELDS);
    if (data.refPrefix) data.refPrefix = String(data.refPrefix).replace(/[^A-Za-z0-9-]/g, '').toUpperCase().slice(0, 12) || 'HR';
    if (data.isDefault) await LetterCompany.update({ isDefault: false }, { where: { id: { [Op.ne]: item.id } } });
    await item.update(data);
    res.json(item);
  } catch (err) { fail(res, 400, 'Could not update company.', err); }
}

async function removeCompany(req, res) {
  try {
    const item = await LetterCompany.findByPk(req.params.id);
    if (!item) return fail(res, 404, 'Company not found.');
    if ((await LetterCompany.count()) <= 1) return fail(res, 400, 'At least one company profile is required.');
    await item.destroy();
    if (item.isDefault) {
      const first = await LetterCompany.findOne({ order: [['id', 'ASC']] });
      if (first) await first.update({ isDefault: true });
    }
    res.json({ success: true });
  } catch (err) { fail(res, 500, 'Could not delete company.', err); }
}

// ------------------------------------------------------------- records
async function buildRef(companyId, type) {
  const company = companyId ? await LetterCompany.findByPk(companyId) : null;
  const prefix = (company && company.refPrefix) || 'HR';
  const base = `${prefix}/${TYPE_CODE[type] || 'LTR'}/${new Date().getFullYear()}`;
  let seq = await LetterRecord.count({ where: { refNo: { [Op.like]: `${base}/%` } } });
  let refNo;
  do {
    seq += 1;
    refNo = `${base}/${String(seq).padStart(4, '0')}`;
    // eslint-disable-next-line no-await-in-loop
  } while (await LetterRecord.findOne({ where: { refNo } }));
  return refNo;
}

async function nextRef(req, res) {
  try {
    res.json({ refNo: await buildRef(req.query.companyId, req.query.type) });
  } catch (err) { fail(res, 500, 'Could not generate reference number.', err); }
}

async function listRecords(req, res) {
  try {
    const where = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.q) {
      const like = { [Op.like]: `%${req.query.q}%` };
      where[Op.or] = [{ employeeName: like }, { employeeId: like }, { refNo: like }, { companyName: like }];
    }
    const items = await LetterRecord.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 200, 500),
      attributes: { exclude: ['renderedHtml', 'companySnapshot'] },
    });
    res.json(items);
  } catch (err) { fail(res, 500, 'Could not load letters.', err); }
}

async function getRecord(req, res) {
  try {
    const item = await LetterRecord.findByPk(req.params.id);
    if (!item) return fail(res, 404, 'Letter not found.');
    res.json(item);
  } catch (err) { fail(res, 500, 'Could not load letter.', err); }
}

async function createRecord(req, res) {
  try {
    const b = req.body || {};
    if (!b.employeeName || !b.renderedHtml || !b.type) return fail(res, 400, 'Employee name, letter type and content are required.');
    const template = b.templateId ? await LetterTemplate.findByPk(b.templateId) : null;
    const company = b.companyId ? await LetterCompany.findByPk(b.companyId) : null;

    let refNo = b.refNo;
    let html = sanitizeHtml(b.renderedHtml);
    if (!refNo || (await LetterRecord.findOne({ where: { refNo } }))) {
      const fresh = await buildRef(b.companyId, b.type);
      if (refNo) html = html.split(refNo).join(fresh);
      refNo = fresh;
    }

    const record = await LetterRecord.create({
      refNo,
      type: b.type,
      templateId: template ? template.id : null,
      templateName: template ? template.name : b.templateName || null,
      companyId: company ? company.id : null,
      companyName: company ? company.name : b.companyName || null,
      employeeName: b.employeeName,
      employeeId: b.employeeId || null,
      designation: b.designation || null,
      subject: b.subject || null,
      issueDate: b.issueDate || null,
      data: b.data || {},
      renderedHtml: html,
      companySnapshot: b.companySnapshot || (company ? company.toJSON() : null),
      showSignature: b.showSignature !== false,
      design: cleanDesign(b.design) || (template && template.design) || null,
      status: ['draft', 'issued'].includes(b.status) ? b.status : 'issued',
      createdBy: (req.admin && (req.admin.email || req.admin.id)) ? String(req.admin.email || req.admin.id) : null,
    });
    res.status(201).json(record);
  } catch (err) { fail(res, 400, 'Could not save letter.', err); }
}

async function updateRecordStatus(req, res) {
  try {
    const item = await LetterRecord.findByPk(req.params.id);
    if (!item) return fail(res, 404, 'Letter not found.');
    if (!['draft', 'issued', 'revoked'].includes(req.body.status)) return fail(res, 400, 'Invalid status.');
    await item.update({ status: req.body.status });
    res.json(item);
  } catch (err) { fail(res, 400, 'Could not update letter.', err); }
}

async function removeRecord(req, res) {
  try {
    const item = await LetterRecord.findByPk(req.params.id);
    if (!item) return fail(res, 404, 'Letter not found.');
    await item.destroy();
    res.json({ success: true });
  } catch (err) { fail(res, 500, 'Could not delete letter.', err); }
}

module.exports = {
  meta,
  listTemplates, createTemplate, updateTemplate, duplicateTemplate, removeTemplate,
  listCompanies, createCompany, updateCompany, removeCompany,
  nextRef, listRecords, getRecord, createRecord, updateRecordStatus, removeRecord,
};