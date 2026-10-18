/**
 * Official Knowledge Base & Context Engine for Website Helper Bot
 * Implements context-aware click guidance, page & element mapping, guided tours, and controlled fallbacks.
 */

const PAGE_CONTEXT_REGISTRY = {
  '/': {
    name: 'Home',
    title: 'Ardhnarishwar Global Business Solutions — Unified Enterprise Cloud',
    summary: 'The main landing page giving an executive overview of our AI-driven business ecosystem, featured enterprise solutions, client testimonials, and quick access to demos.',
    keyElements: [
      { id: 'hero-explore-btn', name: 'Explore Services Button', selector: '#hero-explore-btn, a[href="/services"]', purpose: 'Opens the full catalogue of live enterprise software modules and AI solutions.' },
      { id: 'hero-why-btn', name: 'Why Ardhnarishwar Link', selector: '#hero-why-btn, a[href="/why-ardhnarishwar"]', purpose: 'Discovers the enterprise synergy advantage and leadership foundation.' },
      { id: 'home-services-grid', name: 'Core Services Section', selector: '#services, #solutions, .solutions-premium, .services-section, [data-guide-id="core-services-section"], .solution-grid-premium', purpose: 'Displays cards for HRMS, Smart Attendance, AI Recruitment, Staffing, and live custom solutions.' },
      { id: 'home-contact-cta', name: 'Contact / Consultation CTA', selector: '#contact-cta, a[href="/contact"]', purpose: 'Direct access to speak with our enterprise advisors.' },
    ],
    quickReplies: [
      'What does Ardhnarishwar offer?',
      'Show me all services',
      'Explain 7 Core Modules',
      'Take a quick tour of this page'
    ]
  },
  '/services': {
    name: 'Solutions & Services Catalog',
    title: 'Enterprise Software & Solutions Catalog (Live Modules)',
    summary: 'Detailed showcase of live connected enterprise modules spanning Workforce Management, AI & Automation, Staffing, Global Operations, and Cybersecurity.',
    keyElements: [
      { id: 'services-category-tabs', name: 'Category Filter Tabs', selector: '#solutions-filter-tabs, .insight-filters, .insight-filters button, .category-tabs, button[data-category]', purpose: 'Filter products by Workforce, AI, Staffing, Security, and Global Network.' },
      { id: 'service-cards', name: 'Solution Cards', selector: '#first-solution-card, .solution-card, .solution-grid, [data-guide-id="solution-card"], .service-card', purpose: 'Click any card to read technical architecture, features, and launch an interactive preview.' },
      { id: 'solutions-grid', name: 'Solutions Grid Explorer', selector: '#solutions-grid, .solution-grid', purpose: 'Browse all available enterprise modules and software solutions.' }
    ],
    quickReplies: [
      'Explain Smart Attendance System',
      'Explain AI Recruitment Cloud',
      'Explain HRMS & Workforce Management',
      'Explain HR Staffing Solutions'
    ]
  },
  '/request-demo': {
    name: 'Request Demo',
    title: 'Book a Live Product Demonstration',
    summary: 'Schedule a tailored walkthrough of our enterprise software or test interactive product capabilities with our specialists.',
    keyElements: [
      { id: 'demo-name-input', name: 'Full Name Input', selector: 'input[name="name"], #demo-name', purpose: 'Enter your contact person name.' },
      { id: 'demo-email-input', name: 'Work Email Input', selector: 'input[name="email"], #demo-email', purpose: 'Corporate email for calendar invite.' },
      { id: 'demo-service-select', name: 'Product of Interest', selector: 'select[name="interestedIn"], #interestedIn', purpose: 'Choose which product you would like demonstrated.' },
      { id: 'demo-submit-btn', name: 'Submit Demo Request Button', selector: 'button[type="submit"]', purpose: 'Sends your demo request to our enterprise onboarding team.' }
    ],
    quickReplies: [
      'What information is needed to book a demo?',
      'Where should I click to submit the form?',
      'How quickly will someone reach out?'
    ]
  },
  '/pricing': {
    name: 'Pricing Plans',
    title: 'Flexible Plans for Startups, Growth & Enterprises',
    summary: 'Transparent subscription tiers for our software suites including Starter, Professional, and Enterprise packages.',
    keyElements: [
      { id: 'pricing-toggle', name: 'Billing Cycle Toggle', selector: '.pricing-toggle, [data-billing]', purpose: 'Switch between monthly and discounted annual billing.' },
      { id: 'pricing-tier-enterprise', name: 'Enterprise Custom Tier', selector: '.enterprise-tier-card, a[href="/contact"]', purpose: 'Get custom SLA, on-premise or dedicated cloud deployment.' }
    ],
    quickReplies: [
      'What plans are available?',
      'Do you offer custom pricing?',
      'How do I upgrade my subscription?'
    ]
  },
  '/about': {
    name: 'About Us',
    title: 'Vision, Mission & Leadership Heritage',
    summary: 'Discover Ardhnarishwar Global Business Solutions, our founding philosophy of unifying human potential with autonomous intelligence, key milestones, and global operations.',
    keyElements: [
      { id: 'about-services-cta', name: 'Explore Platform Services', selector: 'a[href="/services"]', purpose: 'Navigate directly to our full suite of enterprise software and AI tools.' },
      { id: 'about-contact-cta', name: 'Contact Leadership', selector: 'a[href="/contact"]', purpose: 'Connect directly with our executive consultants.' }
    ],
    quickReplies: [
      'What is Ardhnarishwar vision?',
      'What services do you offer?',
      'How can I get in touch?'
    ]
  },
  '/why-ardhnarishwar': {
    name: 'Why Choose Ardhnarishwar',
    title: 'The Enterprise Synergy Advantage',
    summary: 'Learn why leading organizations trust Ardhnarishwar: combining automated operational efficiency with high-context human decision-making, military-grade security, and 24/7 dedicated support.',
    keyElements: [
      { id: 'why-demo-cta', name: 'Book a Demo', selector: 'a[href="/request-demo"]', purpose: 'Schedule an enterprise consultation.' },
      { id: 'why-services-link', name: 'Explore Enterprise Tools', selector: 'a[href="/services"]', purpose: 'View all 20 connected software modules.' }
    ],
    quickReplies: [
      'What makes Ardhnarishwar unique?',
      'Where do I book a demo?',
      'Show me all modules'
    ]
  },
  '/how-it-works': {
    name: 'How It Works',
    title: 'Cloud Architecture & Enterprise Integration',
    summary: 'Comprehensive walkthrough of how our platform orchestrates real-time data pipelines, biometric device sync, AI recruitment algorithms, and secure multi-tenant cloud workspaces.',
    keyElements: [
      { id: 'hiw-services-btn', name: 'Explore Software Architecture', selector: 'a[href="/services"]', purpose: 'Inspect features and technical specifications for each module.' },
      { id: 'hiw-contact-btn', name: 'Speak with Solutions Architect', selector: 'a[href="/contact"]', purpose: 'Discuss custom deployment and legacy software migration.' }
    ],
    quickReplies: [
      'How does biometric attendance integrate?',
      'How does AI screening work?',
      'Request technical consultation'
    ]
  },
  '/industries': {
    name: 'Industries & Verticals',
    title: 'Tailored Industry Solutions',
    summary: 'Specialized enterprise workflows crafted for Healthcare, Information Technology, Manufacturing & Logistics, BFSI (Banking & Finance), and Retail organizations.',
    keyElements: [
      { id: 'industry-contact-btn', name: 'Industry Consultation', selector: 'a[href="/contact"]', purpose: 'Discuss compliance and industry-specific workflows.' }
    ],
    quickReplies: [
      'What industries do you support?',
      'Healthcare staffing solutions',
      'IT workforce management'
    ]
  },
  '/team': {
    name: 'Leadership & Team',
    title: 'Engineers, Architects & Visionaries',
    summary: 'Meet the executive leadership team, software architects, and AI researchers shaping the future of global business technology.',
    keyElements: [
      { id: 'team-careers-cta', name: 'Join Our Team Button', selector: 'a[href="/careers"]', purpose: 'Explore open engineering, product, and consulting positions.' },
      { id: 'team-contact-cta', name: 'Contact Leadership', selector: 'a[href="/contact"]', purpose: 'Send inquiries directly to executive management.' }
    ],
    quickReplies: [
      'Who leads the company?',
      'What jobs are open?',
      'Contact our advisors'
    ]
  },
  '/careers': {
    name: 'Careers & Job Openings',
    title: 'Join Ardhnarishwar Global Business Solutions',
    summary: 'Explore active job openings across AI research, full-stack engineering, product design, HR consulting, and enterprise sales.',
    keyElements: [
      { id: 'job-listings', name: 'Job Openings List', selector: '.job-card, .career-listings, a[href*="/careers/"]', purpose: 'Browse open roles, responsibilities, and qualifications.' },
      { id: 'candidate-portal-link', name: 'Candidate Portal Login', selector: 'a[href="/candidate/login"], a[href="/login/choose"]', purpose: 'Log in to track your job applications and assessment scores.' }
    ],
    quickReplies: [
      'What positions are open?',
      'How do I apply for a job?',
      'Open Candidate Portal'
    ]
  },
  '/blog': {
    name: 'Blog & Enterprise Insights',
    title: 'Tech Trends, Whitepapers & Product Updates',
    summary: 'Stay informed with articles on artificial intelligence, HR tech innovation, workforce automation, cybersecurity, and future of work best practices.',
    keyElements: [
      { id: 'featured-post-card', name: 'Featured Articles', selector: '.blog-card, a[href*="/blog/"]', purpose: 'Read full articles and technical insights.' }
    ],
    quickReplies: [
      'Show me latest articles',
      'AI recruitment trends',
      'Smart attendance innovations'
    ]
  },
  '/faq': {
    name: 'Frequently Asked Questions',
    title: 'Help Center & Common Inquiries',
    summary: 'Find rapid answers regarding pricing, implementation timelines, on-premise vs. cloud hosting, data privacy standards, and API integrations.',
    keyElements: [
      { id: 'faq-contact-btn', name: 'Contact Support Button', selector: 'a[href="/contact"]', purpose: 'Submit a question directly to our enterprise support desk.' }
    ],
    quickReplies: [
      'How long does onboarding take?',
      'Is my company data secure?',
      'Contact support'
    ]
  },
  '/contact': {
    name: 'Contact Us',
    title: 'Enterprise Sales & Technical Support',
    summary: 'Get in touch directly with our consultants, support staff, or headquarters for partnerships, bespoke solutions, and service inquiries.',
    keyElements: [
      { id: 'contact-form', name: 'Contact Inquiry Form', selector: 'form, #contact-form', purpose: 'Send inquiries about services, custom development, or enterprise pricing.' },
      { id: 'contact-phone', name: 'Direct Phone Line', selector: 'a[href^="tel:"]', purpose: 'Click to call our office directly.' },
      { id: 'contact-email', name: 'Email Address', selector: 'a[href^="mailto:"]', purpose: 'Send direct emails to our support desk.' }
    ],
    quickReplies: [
      'How can I contact technical support?',
      'Where do I submit my inquiry?',
      'Book a live demo instead'
    ]
  },
  '/login/choose': {
    name: 'Portal Selection',
    title: 'Choose Your Portal',
    summary: 'Central gateway directing users to Client / Organization Portal, Job-Seeker Candidate Portal, or CMS Admin Console.',
    keyElements: [
      { id: 'choose-client-portal', name: 'Organization Portal Link', selector: 'a[href="/portal/login"]', purpose: 'Login for business clients managing workforce & subscriptions.' },
      { id: 'choose-candidate-portal', name: 'Candidate Portal Link', selector: 'a[href="/candidate/login"]', purpose: 'Login for job seekers and career applicants.' },
      { id: 'choose-admin-portal', name: 'Admin Console Link', selector: 'a[href="/admin/login"]', purpose: 'Secure login for company administrators.' }
    ],
    quickReplies: [
      'Which portal should I choose?',
      'How do I log in as a client?',
      'Where do candidates sign in?'
    ]
  },
  '/portal/login': {
    name: 'Client Portal Login',
    title: 'Organization Client Sign In',
    summary: 'Secure login for enterprise clients to access their workforce dashboard, manage subscriptions, submit service inquiries, and invite team members.',
    keyElements: [
      { id: 'portal-login-form', name: 'Login Form', selector: 'form, input[type="email"]', purpose: 'Enter your registered organization credentials.' },
      { id: 'portal-register-link', name: 'Register New Organization', selector: 'a[href="/portal/register"]', purpose: 'Create a new corporate account.' }
    ],
    quickReplies: [
      'How do I register an organization?',
      'Forgot client password',
      'Go to Candidate Portal'
    ]
  },
  '/portal/workspace': {
    name: 'Client Workspace',
    title: 'Enterprise Operations Workspace',
    summary: 'Central executive dashboard for verified clients to review active service subscriptions, view team activities, and manage platform tools.',
    keyElements: [
      { id: 'workspace-inquiry-link', name: 'New Project Inquiry', selector: 'a[href="/portal/inquiry"]', purpose: 'Submit project requirements and technical support tickets.' },
      { id: 'workspace-services-link', name: 'Services Directory', selector: 'a[href="/portal/services"]', purpose: 'Explore subscribed modules and activate new features.' },
      { id: 'workspace-team-link', name: 'Manage Team', selector: 'a[href="/portal/team"]', purpose: 'Invite colleagues and manage permission levels.' }
    ],
    quickReplies: [
      'How do I submit an inquiry?',
      'How do I add team members?',
      'View my active subscriptions'
    ]
  },
  '/portal/inquiry': {
    name: 'Client Inquiries',
    title: 'Submit Project & Feature Inquiries',
    summary: 'Dedicated portal for corporate clients to submit custom development requests, integration tickets, and business expansion proposals.',
    keyElements: [
      { id: 'inquiry-form', name: 'Inquiry Form', selector: 'form', purpose: 'Submit your technical or business inquiry.' }
    ],
    quickReplies: [
      'What inquiry types can I submit?',
      'Back to Workspace',
      'Contact account manager'
    ]
  },
  '/portal/services': {
    name: 'Client Services Hub',
    title: 'Subscribed & Available Enterprise Solutions',
    summary: 'Review your company active subscriptions, upgrade service packages, or request activation of new workforce modules.',
    keyElements: [
      { id: 'portal-services-list', name: 'Services List', selector: '.service-card, [class*="service"]', purpose: 'Explore features and integration options.' }
    ],
    quickReplies: [
      'How do I upgrade services?',
      'Request demo of new tool',
      'Back to Workspace'
    ]
  },
  '/portal/team': {
    name: 'Client Team Management',
    title: 'Manage Colleagues & Roles',
    summary: 'Invite managers, HR specialists, and executives from your organization and assign granular platform access permissions.',
    keyElements: [
      { id: 'invite-member-btn', name: 'Invite Member Button', selector: 'button, .invite-btn', purpose: 'Send invitation link to a colleague.' }
    ],
    quickReplies: [
      'How do I invite a teammate?',
      'What roles are available?',
      'Back to Workspace'
    ]
  },
  '/candidate/login': {
    name: 'Candidate Portal Login',
    title: 'Job Seeker Sign In',
    summary: 'Login portal for job applicants to build their resume, take AI-driven skill assessments, and track interview progress.',
    keyElements: [
      { id: 'candidate-login-form', name: 'Candidate Login Form', selector: 'form, input[type="email"]', purpose: 'Enter your applicant credentials.' },
      { id: 'candidate-register-link', name: 'New Candidate Registration', selector: 'a[href="/candidate/register"]', purpose: 'Create a free job seeker profile.' }
    ],
    quickReplies: [
      'How do I create a candidate profile?',
      'Where do I browse jobs?',
      'Go to Client Portal'
    ]
  },
  '/candidate/profile': {
    name: 'Candidate Profile & Resume',
    title: 'Career Dashboard & AI Skill Match',
    summary: 'Manage your professional resume, view AI-suggested job recommendations, verify mobile number, and review interview performance scores.',
    keyElements: [
      { id: 'candidate-resume-upload', name: 'Upload Resume / CV', selector: 'input[type="file"], .resume-upload', purpose: 'Upload your latest resume for AI parsing.' },
      { id: 'candidate-save-profile', name: 'Save Profile Button', selector: 'button[type="submit"]', purpose: 'Persist updated skills, education, and experience.' }
    ],
    quickReplies: [
      'How does AI skill matching work?',
      'Where do I upload my resume?',
      'View available career services'
    ]
  },
  '/candidate/services': {
    name: 'Candidate Career Services',
    title: 'Career Tools & Assessment Tests',
    summary: 'Access mock AI interviews, resume optimization feedback, skill certifications, and priority job recommendations.',
    keyElements: [
      { id: 'candidate-service-card', name: 'Career Tools List', selector: '.service-card, [class*="card"]', purpose: 'Launch skill assessments and career guidance tools.' }
    ],
    quickReplies: [
      'How do I take a skill assessment?',
      'How do I improve my resume score?',
      'Back to Profile'
    ]
  },
  '/admin/login': {
    name: 'Admin Console Login',
    title: 'Administrator Sign In',
    summary: 'Secured authentication console for system administrators, content managers, and executive staff.',
    keyElements: [
      { id: 'admin-login-form', name: 'Admin Login Form', selector: 'form', purpose: 'Enter administrator credentials.' }
    ],
    quickReplies: [
      'What can admins do?',
      'Go to Home Page',
      'Client Portal Login'
    ]
  },
  '/admin/crm': {
    name: 'Admin CRM & Sales Cloud',
    title: 'Sales Pipeline, Leads & Opportunities',
    summary: 'Manage inbound business leads, track conversion funnels, schedule sales follow-ups, and review corporate deal pipelines.',
    keyElements: [
      { id: 'crm-add-lead-btn', name: 'New Lead Button', selector: 'a[href*="/leads/new"], button', purpose: 'Record a new prospective enterprise client.' },
      { id: 'crm-pipeline-view', name: 'Pipeline Stages', selector: '.pipeline-board, [class*="pipeline"]', purpose: 'Visual drag-and-drop sales stage tracker.' }
    ],
    quickReplies: [
      'How do I add a new lead?',
      'Where are incoming inquiries stored?',
      'Go to Services CMS'
    ]
  },
  '/admin/services': {
    name: 'Admin Services CMS',
    title: 'Services & Modules Management',
    summary: 'Create, update, and publish enterprise service offerings, edit technical documentation, and configure interactive demo simulators.',
    keyElements: [
      { id: 'admin-new-service-btn', name: 'Add Service Button', selector: 'a[href*="/services/new"]', purpose: 'Publish a new technology module to the website.' }
    ],
    quickReplies: [
      'How do I add a new service?',
      'How do I edit demo settings?',
      'Go to CRM Dashboard'
    ]
  },
  '/admin/submissions': {
    name: 'Admin Inquiries & Submissions',
    title: 'Contact & Demo Submissions Log',
    summary: 'Review and manage inbound contact form submissions, live demo requests, and corporate partnerships.',
    keyElements: [
      { id: 'submissions-table', name: 'Submissions Table', selector: 'table, .submissions-list', purpose: 'View visitor names, emails, and requested services.' }
    ],
    quickReplies: [
      'How do I respond to demo requests?',
      'Go to CRM',
      'Go to Main Admin'
    ]
  },
  '/admin/helper-bot': {
    name: 'AI Helper Bot Admin Center',
    title: 'Helper Bot Analytics & Feedback Log',
    summary: 'Monitor AI helper bot conversations, review user helpfulness ratings, analyze user inquiries, and test interactive guided tours.',
    keyElements: [
      { id: 'feedback-stats-cards', name: 'Helpfulness KPI Cards', selector: '.stats-grid, [class*="stat"]', purpose: 'Monitor positive vs negative feedback ratios.' },
      { id: 'simulate-tour-btn', name: 'Simulate Tour Button', selector: 'button:has-text("Simulate"), [class*="tour"]', purpose: 'Trigger interactive guided tours in real-time.' }
    ],
    quickReplies: [
      'What user feedback has been received?',
      'How do I test a guided tour?',
      'Back to Admin Dashboard'
    ]
  },
  '/admin': {
    name: 'Admin Command Center',
    title: 'System & Operations Dashboard',
    summary: 'Executive back-office console for monitoring total visitors, service inquiries, published modules, client organizations, and platform audit logs.',
    keyElements: [
      { id: 'admin-crm-link', name: 'CRM & Pipeline Menu', selector: 'a[href="/admin/crm"]', purpose: 'Manage sales leads, opportunities, tasks, and conversion funnel.' },
      { id: 'admin-services-link', name: 'Services CMS Menu', selector: 'a[href="/admin/services"]', purpose: 'Create, edit, or publish enterprise service offerings.' },
      { id: 'admin-submissions-link', name: 'Contact Submissions', selector: 'a[href="/admin/submissions"]', purpose: 'Review contact forms and demo inquiries submitted by visitors.' },
      { id: 'admin-bot-link', name: 'Helper Bot Admin', selector: 'a[href="/admin/helper-bot"]', purpose: 'Analyze bot metrics and user feedback.' }
    ],
    quickReplies: [
      'Where do I manage CRM leads?',
      'How do I publish a new service?',
      'Where are contact submissions stored?'
    ]
  }
};

const GUIDED_TOURS = [
  {
    id: 'website-overview-tour',
    title: '🌐 Website Explorer Tour',
    description: 'A 4-step quick walkthrough highlighting our core enterprise offerings and navigation.',
    steps: [
      {
        targetPage: '/',
        targetSelector: '#hero-explore-btn, a[href="/services"]',
        title: 'Step 1: Explore Enterprise Solutions',
        content: 'Start here to browse our unified cloud ecosystem — covering HRMS, AI Recruitment, Smart Attendance, CRM, and Custom Engineering.',
        actionText: 'Next: Interactive Demos'
      },
      {
        targetPage: '/',
        targetSelector: '#hero-demo-btn, #nav-request-demo-btn, #cta-demo-btn, a[href="/request-demo"], [data-guide-id="hero-demo-btn"]',
        title: 'Step 2: Request a Live Demo',
        content: 'Click "Request Demo" to schedule a personalized session with our product architects.',
        actionText: 'Next: View Core Services'
      },
      {
        targetPage: '/',
        targetSelector: '#services, #solutions, .solutions-premium, .services-section, [data-guide-id="core-services-section"], .solution-grid-premium',
        title: 'Step 3: Comprehensive Service Suite',
        content: 'Scroll through our live connected modules designed to digitize your workforce and automate operations.',
        actionText: 'Next: Contact & Portals'
      },
      {
        targetPage: '/',
        targetSelector: 'a[href="/login/choose"]',
        title: 'Step 4: Client & Candidate Portals',
        content: 'Access dedicated workspaces for corporate organizations, job applicants, and staff administrators.',
        actionText: 'Finish Tour'
      }
    ]
  },
  {
    id: 'demo-booking-tour',
    title: '🎯 How to Book a Demo Tour',
    description: 'Learn exactly how to submit your interest and schedule an enterprise walkthrough.',
    steps: [
      {
        targetPage: '/request-demo',
        targetSelector: 'input[name="name"], #demo-name',
        title: 'Step 1: Enter Your Name',
        content: 'Tell us who you are so our solutions team can address you properly.',
        actionText: 'Next: Work Email'
      },
      {
        targetPage: '/request-demo',
        targetSelector: 'input[name="email"], #demo-email',
        title: 'Step 2: Business Email',
        content: 'Provide your official corporate email where we can send the meeting invitation and product brief.',
        actionText: 'Next: Pick a Service'
      },
      {
        targetPage: '/request-demo',
        targetSelector: 'select[name="interestedIn"], #interestedIn',
        title: 'Step 3: Select Product',
        content: 'Choose the specific tool you want demonstrated (e.g. HRMS, Smart Attendance, AI Recruitment).',
        actionText: 'Next: Submit'
      },
      {
        targetPage: '/request-demo',
        targetSelector: 'button[type="submit"]',
        title: 'Step 4: Submit Request',
        content: 'Click submit! Our onboarding specialist will confirm your slot within 2 business hours.',
        actionText: 'Complete'
      }
    ]
  },
  {
    id: 'candidate-career-tour',
    title: '💼 Job Seeker & Careers Tour',
    description: 'Discover how to find job openings and apply with your resume.',
    steps: [
      {
        targetPage: '/careers',
        targetSelector: '.job-card, .career-listings',
        title: 'Step 1: Browse Open Positions',
        content: 'Review active roles across engineering, operations, and HR staffing.',
        actionText: 'Next: View Details'
      },
      {
        targetPage: '/careers',
        targetSelector: 'a[href*="/careers/"]',
        title: 'Step 2: Job Details & Qualifications',
        content: 'Click on any job to read prerequisites, responsibilities, and benefits.',
        actionText: 'Next: Portal Login'
      },
      {
        targetPage: '/login/choose',
        targetSelector: 'a[href="/candidate/login"]',
        title: 'Step 3: Candidate Portal',
        content: 'Register on the Candidate Portal to save applications, track review status, and receive interview alerts.',
        actionText: 'Finish'
      }
    ]
  }
];

const GENERAL_KNOWLEDGE_TOPICS = [
  {
    keywords: [
      'priority of working 7 modules',
      'priority of 7 modules',
      'priority of working',
      'priority of modules',
      'working priority',
      'priority sequence',
      'module priority',
      'working 7 modules',
      'priority order',
      'working sequence',
      'how do the 7 modules work together',
      'how do modules work together',
      'how the 7 modules work'
    ],
    title: '⚡ Priority of Working: 7 Core Modules of Ardhnarishwar',
    content: 'Ardhnarishwar integrates people-work and machine-work into one unified platform with a structured 7-step working priority:\n\n' +
      '1. **Priority 1: HRMS & Workforce Management (Organizational Foundation)** — Sets up employee records, company structures, leave rules, and role permissions.\n' +
      '2. **Priority 2: Smart Attendance System (Daily Operational Tracking)** — Face Recognition, GPS check-ins, and biometric hardware that convert daily presence into verified hours for HRMS payroll.\n' +
      '3. **Priority 3: Job Portal & Staffing (Talent Sourcing & Inflow)** — Job postings and candidate career portal bringing top talent into the company.\n' +
      '4. **Priority 4: AI Recruitment Cloud (Intelligent Screening & Selection)** — Automatically parses resumes, ranks candidates, and evaluates skills before interviews.\n' +
      '5. **Priority 5: HR Staffing Solutions (Workforce Deployment & Fulfillment)** — Coordinates permanent recruitment, flexible contract staffing, and executive headhunting to fulfill business hiring needs.\n' +
      '6. **Priority 6: AI Agents Network & Personal AI (Departmental Co-pilots)** — Department-specific AI assistants (HR, Sales, IT, Finance) for SOP queries and daily briefings.\n' +
      '7. **Priority 7: AI Robotics & Automation (Cross-Platform Autonomous Orchestration)** — Software bots and RPA eliminating repetitive cross-module tasks end-to-end.\n\n' +
      '🔄 *All module configurations automatically sync with our cloud database in real time.*',
    actionType: 'navigate',
    actionPayload: { targetUrl: '/how-it-works', label: '🧭 View System Architecture' },
    quickReplies: [
      '⭐ Explain Main 7 Modules',
      '🔄 Explain Latest Updates',
      'Explain HRMS & Attendance',
      'Explain AI Recruitment',
      'Explain HR Staffing Solutions'
    ]
  },
  {
    keywords: [
      'explain main 7 modules',
      'explain 7 modules',
      'main 7 modules',
      '7 modules',
      '7 main modules',
      'what are the 7 modules',
      'explain the 7 modules',
      'seven modules',
      'explain seven modules',
      '7 core modules',
      'core 7 modules',
      'main modules',
      'core modules'
    ],
    title: '⭐ The Main 7 Core Modules of Ardhnarishwar',
    content: 'Ardhnarishwar is powered by 7 core flagship enterprise modules:\n\n' +
      '1. 👥 **HRMS & Workforce Management** [Priority 1]: Full employee lifecycle, digital onboarding, department hierarchies, leave approvals, and payroll inputs.\n' +
      '2. ⏱️ **Smart Attendance System** [Priority 2]: Face recognition, GPS geo-fenced mobile check-ins, biometric hardware, and overtime calculations.\n' +
      '3. 💼 **Job Portal & Staffing** [Priority 3]: Candidate career portal, job listings, resume uploads, and flexible staffing management.\n' +
      '4. 🤖 **AI Recruitment Cloud** [Priority 4]: Resume intelligence, NLP skill-gap detection, AI candidate ranking, and interview questions.\n' +
      '5. 💼 **HR Staffing Solutions** [Priority 5]: Permanent and temporary contract staffing, bulk hiring, executive search, and candidate deployment.\n' +
      '6. 🧠 **AI Agents Network & Personal AI** [Priority 6]: Specialized AI co-pilots for HR, Sales, IT, and Finance teams with SOP document Q&A.\n' +
      '7. ⚙️ **AI Robotics & Automation** [Priority 7]: Autonomous workflow bots, RPA, document extraction, and smart approvals.\n\n' +
      '💡 Ask me: *"Priority of working 7 modules"* to learn how they sequence and operate together!',
    actionType: 'navigate',
    actionPayload: { targetUrl: '/services', label: '📂 Open Services Catalog' },
    quickReplies: [
      '⚡ Priority of Working 7 Modules',
      '🔄 Explain Latest Updates',
      'Explain Smart Attendance',
      'Explain AI Recruitment Cloud',
      'Explain HR Staffing Solutions'
    ]
  },
  {
    keywords: [
      'when all update explain it',
      'when all update',
      'explain updates',
      'what are the updates',
      'latest updates',
      'recent updates',
      'module updates',
      'website updates',
      'system updates',
      'automatically updates',
      'automatic updates',
      'live updates'
    ],
    title: '🔄 Real-Time System Updates & Live Synchronization',
    content: 'Our website and AI Helper Bot are **automatically synchronized with our MySQL cloud database in real time**:\n\n' +
      '• **Dynamic Knowledge Engine**: The AI Bot queries database records on every user prompt. When administrators update service descriptions, features, or priorities in the Admin Panel (`/admin/services`), the AI Bot immediately reflects those updates without requiring a code rebuild.\n' +
      '• **Continuous Health Monitoring**: Multi-tenant portals (Client, Candidate, and Admin) and biometric/AI pipelines are continuously validated.\n' +
      '• **Always-Current Priority Workflow**: The 7 main modules maintain an active priority sequence reflecting the live operational status of each tool.',
    actionType: 'navigate',
    actionPayload: { targetUrl: '/services', label: '📂 View Live Synced Modules' },
    quickReplies: [
      '⚡ Priority of Working 7 Modules',
      '⭐ Explain Main 7 Modules',
      'Take a guided tour',
      'Book a live demo'
    ]
  },
  {
    keywords: [
      'services',
      'service',
      'what services',
      'tell me about services',
      'show me all services',
      'show services',
      'our services',
      'available services',
      'all services',
      'what do you offer',
      'what does ardhnarishwar offer',
      'products and services',
      'solutions',
      'what do you provide',
      'offerings',
      'list of services',
      'service list',
      'services list',
      'what can you do'
    ],
    title: '🏢 Ardhnarishwar Enterprise Services & Solutions Suite',
    content: 'Ardhnarishwar delivers an integrated cloud ecosystem of live connected enterprise modules:\n\n1. 👥 **HR & Workforce Management**: HRMS, Smart Attendance (Face Recognition & GPS), Shift Scheduling & Automated Payroll Sync.\n2. 🤖 **AI & Autonomous Automation**: AI Recruitment Cloud, AI Robotics, Autonomous AI Agents Network, Personal AI Co-pilot & AI Answer System.\n3. 💼 **Staffing & Recruitment**: HR Staffing Solutions and interactive Job Portal for talent discovery.\n4. 📈 **Enterprise CRM & Operations**: CRM & Sales Cloud, Project Operations Management, Finance Intelligence & Advanced Analytics.\n5. 🔒 **Security & Custom Engineering**: Cyber Security Command Center, Global Marketplace, Smart City 5.0 & Bespoke Enterprise Software.\n\nClick below to open our interactive services catalog, or ask me about any specific service!',
    actionType: 'navigate',
    actionPayload: { targetUrl: '/services', label: '📂 Open Services Catalog (Live Modules)' },
    quickReplies: [
      'Explain Smart Attendance',
      'Explain AI Recruitment',
      'Explain HRMS & Payroll',
      'Explain CRM & Sales',
      'Book a Live Demo'
    ]
  },
  {
    keywords: ['who are you', 'what is this website', 'about company', 'company overview', 'ardhnarishwar'],
    title: 'About Ardhnarishwar Global Business Solutions',
    content: 'Ardhnarishwar Global Business Solutions is a modern enterprise technology and workforce solutions company. We provide integrated digital products including HRMS & Workforce Management, Smart Attendance with Face/Biometrics/GPS, AI Recruitment Cloud, CRM & Sales Cloud, Staffing Solutions, and Custom Enterprise Software.',
    actionType: 'navigate',
    actionPayload: { targetUrl: '/about', label: 'Learn More About Us' },
    quickReplies: ['What services do you offer?', 'Where should I click to book a demo?', 'Take a guided tour']
  },
  {
    keywords: ['hrms', 'human resource', 'workforce management', 'employee management', 'leave', 'payroll'],
    title: 'HRMS & Workforce Management',
    content: 'Our HRMS is a complete workforce operating system covering the full employee lifecycle: digital onboarding, department & org structures, leave & shift tracking, payroll inputs, appraisals, and employee self-service portals.',
    actionType: 'navigate',
    actionPayload: { targetUrl: '/services/hrms-workforce-management', label: 'View HRMS Details' },
    quickReplies: ['Where can I test HRMS?', 'How does attendance integrate?', 'Talk to sales']
  },
  {
    keywords: ['attendance', 'smart attendance', 'biometric', 'face recognition', 'gps check-in', 'clock in'],
    title: 'Smart Attendance System',
    content: 'Smart Attendance tracks attendance with Face Recognition, Biometric devices, QR codes, and GPS geo-fenced check-ins. It includes real-time dashboards, shift-based overtime calculation, and seamless payroll export.',
    actionType: 'navigate',
    actionPayload: { targetUrl: '/services/smart-attendance-system', label: 'Explore Smart Attendance' },
    quickReplies: ['How do I mark attendance?', 'Can I test a demo?', 'Request a quote']
  },
  {
    keywords: ['ai recruitment', 'screening', 'resume intelligence', 'hiring', 'applicant tracking'],
    title: 'AI Recruitment Cloud',
    content: 'The AI Recruitment Cloud leverages resume intelligence to match candidates against job descriptions, screen qualifications, detect skill gaps, and provide structured interview evaluations.',
    actionType: 'navigate',
    actionPayload: { targetUrl: '/services/ai-recruitment-cloud', label: 'View AI Recruitment' },
    quickReplies: ['Show me all services', 'Book a Demo', 'Job Portal']
  },
  {
    keywords: ['demo', 'request demo', 'book demo', 'see demo', 'test product', 'try it'],
    title: 'Book a Live Product Demonstration',
    content: 'To book a live demonstration of any product, open our Request Demo page, pick your service of interest, and our enterprise team will set up an interactive session.',
    actionType: 'navigate',
    actionPayload: { targetUrl: '/request-demo', targetSelector: '#demo-name-input', label: 'Open Request Demo Page' },
    quickReplies: ['Where do I click on the demo page?', 'What products can I test?', 'Start Demo Tour']
  },
  {
    keywords: ['contact', 'email', 'phone', 'support', 'sales enquiry', 'reach out'],
    title: 'Contact Our Enterprise Team',
    content: 'You can contact our advisors by filling out our Contact Form or by calling directly. We respond to all corporate inquiries within 2-4 business hours.',
    actionType: 'navigate',
    actionPayload: { targetUrl: '/contact', targetSelector: '#contact-form', label: 'Go to Contact Page' },
    quickReplies: ['Where is the contact form?', 'Request a Demo instead', 'View Pricing']
  },
  {
    keywords: ['pricing', 'cost', 'plan', 'subscription', 'how much'],
    title: 'Pricing & Enterprise Plans',
    content: 'We offer tiered subscription pricing suited for emerging startups, growth organizations, and custom enterprise deployments with dedicated hosting and SLA guarantees.',
    actionType: 'navigate',
    actionPayload: { targetUrl: '/pricing', label: 'View Pricing Table' },
    quickReplies: ['Is there a free trial?', 'Custom enterprise pricing', 'Contact sales']
  },
  {
    keywords: ['job', 'career', 'hiring', 'apply', 'openings', 'resume'],
    title: 'Careers & Job Openings',
    content: 'We are hiring across Engineering, AI development, Product Design, and Staffing. Visit our Careers page to browse openings and apply directly with your resume.',
    actionType: 'navigate',
    actionPayload: { targetUrl: '/careers', label: 'Browse Open Positions' },
    quickReplies: ['How do I apply?', 'Candidate Portal Login', 'Start Career Tour']
  },
  {
    keywords: ['login', 'sign in', 'portal', 'dashboard', 'access account'],
    title: 'Portal Access & Login',
    content: 'We have three dedicated portals: 1) Organization / Client Portal for enterprise workforce management, 2) Candidate Portal for job applicants, and 3) Admin Console for website management.',
    actionType: 'navigate',
    actionPayload: { targetUrl: '/login/choose', label: 'Select Your Portal' },
    quickReplies: ['Client Portal Login', 'Candidate Portal Login', 'Admin Console']
  }
];

/**
 * Match user inquiry against safe page context, interactive elements, knowledge base, and fallbacks.
 */
function processHelperBotQuery({ message, pageContext = {}, userRole = 'guest' }) {
  const query = (message || '').trim();
  const lower = query.toLowerCase();
  const currentPath = pageContext.path || '/';

  // Normalize path to base matching (longest match first)
  const sortedKeys = Object.keys(PAGE_CONTEXT_REGISTRY).sort((a, b) => b.length - a.length);
  let matchedPageKey = sortedKeys.find(k => {
    if (k === '/') return currentPath === '/';
    return currentPath === k || currentPath.startsWith(k + '/');
  }) || '/';

  const pageInfo = PAGE_CONTEXT_REGISTRY[matchedPageKey] || PAGE_CONTEXT_REGISTRY['/'];

  // Check 1: "Explain this page" / "What is this page?" / "Where am I?" / "Explain page"
  const isPageExplainQuery = 
    lower === 'explain page' ||
    lower === 'explain this page' ||
    lower === 'explain the page' ||
    lower === 'explain current page' ||
    lower === 'what is this page' ||
    lower === 'what page is this' ||
    lower === 'tell me about this page' ||
    lower === 'tell me about the page' ||
    lower === 'what can i do here' ||
    lower === 'what can i do on this page' ||
    lower === 'what is on this page' ||
    lower === 'where am i' ||
    lower === 'about this page' ||
    lower === 'page overview' ||
    lower === 'page details' ||
    lower === 'page explanation' ||
    lower === 'help with this page' ||
    lower.includes('explain this page') ||
    lower.includes('explain page') ||
    lower.includes('what is this page') ||
    lower.includes('tell me about this page') ||
    lower.includes('what page is this') ||
    lower.includes('where am i') ||
    lower.includes('what can i do here') ||
    (lower.includes('what is this') && (lower.includes('page') || lower.length < 25));

  if (isPageExplainQuery) {
    let elementsList = (pageInfo.keyElements || [])
      .map(el => `• **${el.name}**: ${el.purpose}`)
      .join('\n');

    return {
      text: `📄 **You are on the ${pageInfo.name} Page** (${pageInfo.title}).\n\n${pageInfo.summary}\n\n**Key features & interactive options on this page:**\n${elementsList}\n\n💡 *Ask me "Where should I click?" or click below to highlight key features!*`,
      action: pageInfo.keyElements?.[0]?.selector ? {
        type: 'highlight',
        selector: pageInfo.keyElements[0].selector,
        label: `🎯 Highlight ${pageInfo.keyElements[0].name}`
      } : null,
      quickReplies: pageInfo.quickReplies || ['Where should I click?', 'Take a guided tour', 'Show all services']
    };
  }

  // Check 2: "Where should I click?" / "Where do I click?"
  if (
    lower.includes('where should i click') ||
    lower.includes('where do i click') ||
    lower.includes('where to click') ||
    lower.includes('how do i navigate')
  ) {
    if (pageInfo.keyElements && pageInfo.keyElements.length > 0) {
      const primary = pageInfo.keyElements[0];
      return {
        text: `On the **${pageInfo.name}** page, here is where you should click:\n\n👉 Look for **"${primary.name}"** (${primary.purpose}). Click the button below and I will highlight it directly on your screen!`,
        action: {
          type: 'highlight',
          selector: primary.selector,
          label: `🎯 Highlight "${primary.name}"`
        },
        quickReplies: ['Explain this button', 'Take a Guided Tour', 'Go to Services']
      };
    }
  }

  // Check 3: "Explain button" or asking about a specific element
  for (const el of (pageInfo.keyElements || [])) {
    const elLower = el.name.toLowerCase();
    if (lower.includes(elLower) || (el.id && lower.includes(el.id))) {
      return {
        text: `**${el.name}**:\n${el.purpose}\n\nWould you like me to highlight it on your screen right now?`,
        action: {
          type: 'highlight',
          selector: el.selector,
          label: `🎯 Highlight "${el.name}"`
        },
        quickReplies: ['Where should I click next?', 'Explain this page', 'Take a tour']
      };
    }
  }

  // Check 4: Guided Tour request
  if (
    lower.includes('tour') ||
    lower.includes('guide me') ||
    lower.includes('walkthrough') ||
    lower.includes('show me around')
  ) {
    const tour = GUIDED_TOURS.find(t => t.steps.some(s => s.targetPage === currentPath)) || GUIDED_TOURS[0];
    return {
      text: `Let's take a guided tour! I'll walk you through each step of the interface interactively.\n\nTour: **${tour.title}**\n${tour.description}`,
      action: {
        type: 'tour',
        tourId: tour.id,
        label: `🧭 Start ${tour.title}`
      },
      quickReplies: ['Start Tour', 'Explain this page instead', 'Show me services']
    };
  }

  // Check 5: Match general knowledge topics (services, demo, pricing, contact, etc.)
  for (const item of GENERAL_KNOWLEDGE_TOPICS) {
    const matched = item.keywords.some(kw => lower.includes(kw));
    if (matched) {
      return {
        text: `**${item.title}**\n\n${item.content}`,
        action: item.actionType !== 'none' ? {
          type: item.actionType,
          url: item.actionPayload?.targetUrl,
          selector: item.actionPayload?.targetSelector,
          label: item.actionPayload?.label || 'Take Me There'
        } : null,
        quickReplies: item.quickReplies
      };
    }
  }

  // Check 6: Controlled Fallback (No hallucination, precise guidance)
  return {
    text: `I'm your **Website Helper Bot**. I can explain features, tell you where to click, guide you through pages, and show you around our enterprise software.\n\nI couldn't find an exact match for *"${query}"* in our official directory. Would you like help with one of these common topics?`,
    action: {
      type: 'navigate',
      url: '/services',
      label: 'Explore Services Catalog'
    },
    quickReplies: [
      'Explain this page',
      'Where should I click?',
      'Book a live demo',
      'Take a guided tour'
    ]
  };
}

module.exports = {
  PAGE_CONTEXT_REGISTRY,
  GUIDED_TOURS,
  GENERAL_KNOWLEDGE_TOPICS,
  processHelperBotQuery
};
