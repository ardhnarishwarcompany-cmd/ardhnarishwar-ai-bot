// Field catalogue, default templates, default company profile and the
// Solutions-page card for the HR Letters module. Everything here is only
// *seed* data: findOrCreate is used, so admin edits are never overwritten.

const LETTER_TYPES = [
  { value: 'offer', label: 'Offer Letter' },
  { value: 'joining', label: 'Joining Letter' },
  { value: 'experience', label: 'Experience Letter' },
  { value: 'relieving', label: 'Relieving Letter' },
  { value: 'custom', label: 'Custom Letter' },
];

// Placeholders the admin can use as {{key}} in any template. The Generate
// form asks for each one that a template actually uses.
const STANDARD_FIELDS = [
  { key: 'salutation', label: 'Salutation', type: 'select', options: ['Mr.', 'Ms.', 'Mrs.', 'Dr.'], defaultValue: 'Mr.', group: 'Employee' },
  { key: 'employee_name', label: 'Employee Name', type: 'text', required: true, group: 'Employee' },
  { key: 'employee_id', label: 'Employee ID', type: 'text', group: 'Employee' },
  { key: 'employee_address', label: 'Employee Address', type: 'textarea', group: 'Employee' },
  { key: 'employee_email', label: 'Employee Email', type: 'text', group: 'Employee' },
  { key: 'designation', label: 'Designation', type: 'text', required: true, group: 'Employment' },
  { key: 'department', label: 'Department', type: 'text', group: 'Employment' },
  { key: 'location', label: 'Work Location', type: 'text', group: 'Employment' },
  { key: 'employment_type', label: 'Employment Type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Internship'], defaultValue: 'Full-time', group: 'Employment' },
  { key: 'reporting_manager', label: 'Reporting Manager', type: 'text', group: 'Employment' },
  { key: 'salary', label: 'Salary / CTC', type: 'text', placeholder: 'e.g. INR 6,00,000 per annum', group: 'Compensation' },
  { key: 'joining_date', label: 'Joining Date', type: 'date', group: 'Dates' },
  { key: 'offer_valid_till', label: 'Offer Valid Till', type: 'date', group: 'Dates' },
  { key: 'resignation_date', label: 'Resignation Date', type: 'date', group: 'Dates' },
  { key: 'last_working_day', label: 'Last Working Day', type: 'date', group: 'Dates' },
  { key: 'probation_period', label: 'Probation Period', type: 'text', defaultValue: '6 months', group: 'Terms' },
  { key: 'notice_period', label: 'Notice Period', type: 'text', defaultValue: '30 days', group: 'Terms' },
  { key: 'working_hours', label: 'Working Hours', type: 'text', defaultValue: '9:30 AM to 6:30 PM, Monday to Friday', group: 'Terms' },
  { key: 'issue_date', label: 'Issue Date', type: 'date', required: true, group: 'Letter' },
];

// Filled automatically from the selected company / system — never asked for.
const AUTO_FIELDS = [
  { key: 'company_name', label: 'Company Name' },
  { key: 'company_legal_name', label: 'Company Legal Name' },
  { key: 'company_address', label: 'Company Address' },
  { key: 'company_email', label: 'Company Email' },
  { key: 'company_phone', label: 'Company Phone' },
  { key: 'company_website', label: 'Company Website' },
  { key: 'company_reg_no', label: 'Registration No.' },
  { key: 'signatory_name', label: 'Signatory Name' },
  { key: 'signatory_designation', label: 'Signatory Designation' },
  { key: 'ref_no', label: 'Reference No.' },
  { key: 'tenure', label: 'Tenure (auto from joining → last working day)' },
  { key: 'terms', label: 'Policies & Terms block' },
];

const T = (title, text) => ({ title, text, enabled: true });

const DEFAULT_TEMPLATES = [
  {
    name: 'Offer Letter',
    slug: 'offer-letter',
    type: 'offer',
    description: 'Formal job offer with compensation, joining date and terms of employment.',
    subject: 'Offer of Employment – {{designation}}',
    sortOrder: 1,
    fields: [],
    terms: [
      T('Probation', 'You will be on probation for {{probation_period}} from your date of joining. Confirmation of employment is subject to satisfactory performance and conduct during this period.'),
      T('Notice Period', 'After confirmation, either party may end this employment by giving {{notice_period}} written notice or salary in lieu of the notice period.'),
      T('Documents & Verification', 'This offer is subject to satisfactory verification of your educational, professional and identity documents and of your references. Any discrepancy may result in withdrawal of this offer or termination of employment.'),
      T('Confidentiality', 'You will keep all proprietary, client and business information of {{company_name}} strictly confidential, during and after your employment.'),
      T('Company Policies', 'You will abide by the code of conduct, leave, attendance, IT-usage and other policies of {{company_name}} as amended from time to time.'),
      T('Working Hours', 'Your normal working hours will be {{working_hours}}. You may be required to work additional hours as business needs demand.'),
    ],
    body: `<p>To,<br><strong>{{salutation}} {{employee_name}}</strong><br>{{employee_address}}</p>
<p>Dear {{salutation}} {{employee_name}},</p>
<p>We are pleased to offer you the position of <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department at <strong>{{company_name}}</strong>. We were impressed with your skills and experience and are confident that you will make a valuable contribution to our team.</p>
<p>The key terms of your employment are summarised below:</p>
<table class="lt-table">
<tr><td>Designation</td><td>{{designation}}</td></tr>
<tr><td>Department</td><td>{{department}}</td></tr>
<tr><td>Employment Type</td><td>{{employment_type}}</td></tr>
<tr><td>Work Location</td><td>{{location}}</td></tr>
<tr><td>Reporting To</td><td>{{reporting_manager}}</td></tr>
<tr><td>Date of Joining</td><td>{{joining_date}}</td></tr>
<tr><td>Compensation</td><td>{{salary}}</td></tr>
</table>
<p>This offer is valid until <strong>{{offer_valid_till}}</strong>. Please sign and return a copy of this letter as your acceptance.</p>
{{terms}}
<p>We look forward to welcoming you to the {{company_name}} family.</p>
<div class="lt-accept"><p><strong>Acceptance</strong></p><p>I, {{employee_name}}, have read and understood the terms of this offer and accept it.</p><p>Signature: ______________________ &nbsp;&nbsp; Date: ______________</p></div>`,
  },
  {
    name: 'Joining Letter',
    slug: 'joining-letter',
    type: 'joining',
    description: 'Confirms the joining date, employee ID, reporting details and documents to bring.',
    subject: 'Joining Letter – {{designation}}',
    sortOrder: 2,
    fields: [
      { key: 'offer_letter_date', label: 'Offer Letter Date', type: 'date' },
      { key: 'reporting_time', label: 'Reporting Time', type: 'text', defaultValue: '10:00 AM' },
      { key: 'documents_required', label: 'Documents to Bring', type: 'textarea', defaultValue: 'Government photo ID and address proof\nEducational certificates (originals and copies)\nRelieving / experience letters from previous employers\nPassport-size photographs\nBank account details' },
    ],
    terms: [
      T('Reporting', 'You are requested to report on your joining date at the time and place mentioned above and complete the joining formalities with HR.'),
      T('Probation', 'Your probation period will be {{probation_period}} from the date of joining.'),
      T('Code of Conduct', 'You are expected to follow the code of conduct, confidentiality and other policies of {{company_name}} throughout your employment.'),
    ],
    body: `<p>Dear {{salutation}} {{employee_name}},</p>
<p>With reference to your offer letter dated <strong>{{offer_letter_date}}</strong>, we are pleased to confirm your joining at <strong>{{company_name}}</strong> as <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department.</p>
<table class="lt-table">
<tr><td>Employee ID</td><td>{{employee_id}}</td></tr>
<tr><td>Date of Joining</td><td>{{joining_date}}</td></tr>
<tr><td>Reporting Time</td><td>{{reporting_time}}</td></tr>
<tr><td>Work Location</td><td>{{location}}</td></tr>
<tr><td>Reporting To</td><td>{{reporting_manager}}</td></tr>
<tr><td>Compensation</td><td>{{salary}}</td></tr>
</table>
<p>Please carry the following documents on your first day:</p>
<p>{{documents_required}}</p>
{{terms}}
<p>We wish you a successful and rewarding career with us.</p>`,
  },
  {
    name: 'Experience Letter',
    slug: 'experience-letter',
    type: 'experience',
    description: 'Certifies an employee\'s role, tenure and conduct for use with future employers.',
    subject: 'Experience Certificate',
    sortOrder: 3,
    fields: [
      { key: 'responsibilities', label: 'Key Responsibilities (optional)', type: 'textarea' },
    ],
    terms: [],
    body: `<p><strong>TO WHOM IT MAY CONCERN</strong></p>
<p>This is to certify that <strong>{{salutation}} {{employee_name}}</strong> (Employee ID: {{employee_id}}) was employed with <strong>{{company_name}}</strong> as <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department from <strong>{{joining_date}}</strong> to <strong>{{last_working_day}}</strong>, a total tenure of {{tenure}}.</p>
<p>{{responsibilities}}</p>
<p>During this period we found their conduct to be good and their work to be sincere and satisfactory. {{company_name}} has no objection to their pursuing opportunities elsewhere.</p>
<p>We thank them for their contribution and wish them every success in the future.</p>
{{terms}}`,
  },
  {
    name: 'Relieving Letter',
    slug: 'relieving-letter',
    type: 'relieving',
    description: 'Accepts the resignation and confirms the employee is relieved from duties.',
    subject: 'Relieving Letter',
    sortOrder: 4,
    fields: [],
    terms: [
      T('Full & Final Settlement', 'All dues payable to you will be settled as per company policy after clearance of all assets, accounts and handover formalities.'),
      T('Confidentiality', 'Your obligations regarding confidentiality and non-disclosure of {{company_name}} information continue to apply after your last working day.'),
    ],
    body: `<p>Dear {{salutation}} {{employee_name}},</p>
<p>Employee ID: <strong>{{employee_id}}</strong><br>Designation: <strong>{{designation}}</strong>, {{department}}</p>
<p>This is with reference to your resignation dated <strong>{{resignation_date}}</strong>. We hereby accept your resignation and confirm that you are relieved from your duties at <strong>{{company_name}}</strong> with effect from the close of business hours on <strong>{{last_working_day}}</strong>.</p>
<p>You served the company from {{joining_date}} to {{last_working_day}} ({{tenure}}). We confirm that you have completed the handover and exit formalities, subject to the terms below.</p>
{{terms}}
<p>We thank you for your contribution to {{company_name}} and wish you the very best in your future endeavours.</p>`,
  },
];

const DEFAULT_COMPANY = {
  name: 'Ardhnarishwar',
  legalName: 'Ardhnarishwar',
  address: 'Registered office address — update this in Admin → HR Letters → Companies',
  email: '',
  phone: '',
  website: '',
  registrationNo: '',
  signatoryName: 'Authorised Signatory',
  signatoryDesignation: 'Human Resources',
  accentColor: '#281b3d',
  footerText: 'This is a system-generated letter issued by the HR department.',
  refPrefix: 'HR',
  isDefault: true,
};

// The card that appears on the public Solutions page. accessType 'admin'
// means: anyone can read the page, but launching it needs the admin login.
const LETTER_SERVICE = {
  title: 'HR Letters & Document Templates',
  slug: 'hr-letter-templates',
  category: 'HR & Workforce',
  shortDescription: 'Offer, Joining, Experience and Relieving letters from reusable, brandable templates.',
  description: 'Generate professional HR letters for any company or organization. Templates, letterheads and policy clauses are all managed from the admin panel.',
  features: [
    'Offer Letter, Joining Letter, Experience Letter & Relieving Letter',
    'Dynamic fields: employee, ID, company, designation, salary, location, dates',
    'Editable Policies & Terms clauses per template and per letter',
    'Multiple company letterheads with logo and signatory',
    'Auto reference numbers and an issued-letter register',
    'One-click print / Save as PDF',
  ],
  techSummary: 'HR Letters is a template engine built into the admin panel. Each letter format is stored as editable HTML with {{placeholders}}; when you generate a letter the form is built from the placeholders that template uses, the selected company\u2019s letterhead and signatory are applied, and a frozen copy is saved in the issued-letters register with its own reference number. Administrators control the templates, clauses and companies; nothing is hard-coded.',
  techStack: ['Template Engine ({{placeholders}})', 'Multi-Company Letterheads', 'Policies & Terms Library', 'Issued Letters Register', 'Print / PDF Export'],
  accessType: 'admin',
  externalUrl: '/admin/letters',
  demoEnabled: false,
  sortOrder: 21,
  isPublished: true,
};

async function ensureLetterDefaults() {
  const LetterTemplate = require('./models/LetterTemplate');
  const LetterCompany = require('./models/LetterCompany');
  const Service = require('./models/Service');

  for (const t of DEFAULT_TEMPLATES) {
    await LetterTemplate.findOrCreate({ where: { slug: t.slug }, defaults: { ...t, isSystem: true, isActive: true } });
  }
  if ((await LetterCompany.count()) === 0) {
    await LetterCompany.create(DEFAULT_COMPANY);
  }
  // Default Ardhnarishwar logo: if backend/src/uploads/ardhnarishwar-logo.jpg exists,
  // use it on any company profile that has no logo yet (never overrides a logo you set).
  const fs = require('fs');
  const path = require('path');
  if (fs.existsSync(path.join(__dirname, 'uploads', 'ardhnarishwar-logo.jpg'))) {
    const { Op } = require('sequelize');
    await LetterCompany.update(
      { logoUrl: '/uploads/ardhnarishwar-logo.jpg' },
      { where: { name: 'Ardhnarishwar', [Op.or]: [{ logoUrl: null }, { logoUrl: '' }] } },
    );
  }
  await Service.findOrCreate({ where: { slug: LETTER_SERVICE.slug }, defaults: LETTER_SERVICE });
}

module.exports = {
  LETTER_TYPES, STANDARD_FIELDS, AUTO_FIELDS, DEFAULT_TEMPLATES, DEFAULT_COMPANY, LETTER_SERVICE, ensureLetterDefaults,
};