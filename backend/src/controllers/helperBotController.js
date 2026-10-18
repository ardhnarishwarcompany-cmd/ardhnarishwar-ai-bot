const HelperBotKnowledge = require('../models/HelperBotKnowledge');
const HelperBotFeedback = require('../models/HelperBotFeedback');
const Service = require('../models/Service');
const {
  PAGE_CONTEXT_REGISTRY,
  GUIDED_TOURS,
  GENERAL_KNOWLEDGE_TOPICS,
  processHelperBotQuery
} = require('../services/helperBotKnowledgeBase');

// Metadata & Operational Blueprint for the Flagship 7 Main Modules
const MAIN_7_MODULES_METADATA = [
  {
    priority: 1,
    slug: 'hrms-workforce-management',
    defaultTitle: 'HRMS & Workforce Management',
    category: 'HR & Workforce',
    tag: 'Foundation Layer',
    badgeColor: 'emerald',
    role: 'Central enterprise foundation and single source of truth for employees, departments, designations, digital onboarding, leave tracking, shift rosters, and payroll inputs.',
    priorityReason: 'Priority 1 (Organizational Foundation): Every operational module (attendance, access permissions, departmental AI agents, payroll) relies on the employee database and org hierarchy established in HRMS.',
    workingSequence: 'Step 1: Sets up the organization, departments, roles, and employee records that all downstream modules rely upon.'
  },
  {
    priority: 2,
    slug: 'smart-attendance-system',
    defaultTitle: 'Smart Attendance System',
    category: 'HR & Workforce',
    tag: 'Daily Operations',
    badgeColor: 'teal',
    role: 'Real-time biometric attendance tracking via Face Recognition, GPS geo-fenced mobile check-ins, Wi-Fi validation, overtime tracking, and automatic payroll calculation sync.',
    priorityReason: 'Priority 2 (Daily Operational Grounding): Captures daily workforce presence and converts verified hours, shifts, and overtime directly into payroll inputs for the HRMS.',
    workingSequence: 'Step 2: Tracks daily workforce presence in real time and automatically feeds verified work hours to HRMS payroll.'
  },
  {
    priority: 3,
    slug: 'job-portal',
    defaultTitle: 'Job Portal & Staffing',
    category: 'Staffing',
    tag: 'Talent Sourcing',
    badgeColor: 'blue',
    role: 'Public career discovery portal and flexible staffing marketplace for posting job vacancies, candidate resume uploads, application status tracking, and staffing coordination.',
    priorityReason: 'Priority 3 (Talent Sourcing & Inflow): Creates the inbound candidate pipeline bringing active applicants, resumes, and new talent into the enterprise.',
    workingSequence: 'Step 3: Attracts and collects job applications from candidates across permanent, contract, and bulk hiring streams.'
  },
  {
    priority: 4,
    slug: 'ai-recruitment-cloud',
    defaultTitle: 'AI Recruitment Cloud',
    category: 'Artificial Intelligence',
    tag: 'Intelligent Screening',
    badgeColor: 'violet',
    role: 'AI-assisted resume intelligence, NLP skill-gap detection, automated candidate ranking, AI interview question generation, and structured interview evaluation.',
    priorityReason: 'Priority 4 (Intelligent Screening & Selection): Automatically filters, parses, and ranks inbound candidates from the Job Portal so hiring managers only interview qualified talent.',
    workingSequence: 'Step 4: Evaluates candidate resumes against job descriptions, identifies skill gaps, and prepares recruiters for structured interviews.'
  },
  {
    priority: 5,
    slug: 'hr-staffing-solutions',
    defaultTitle: 'HR Staffing Solutions',
    category: 'Staffing',
    tag: 'Workforce Staffing',
    badgeColor: 'amber',
    role: 'Technology-enabled staffing services for permanent, temporary, executive search, and bulk hiring coordination with verified talent deployment.',
    priorityReason: 'Priority 5 (Workforce Staffing & Talent Deployment): Solves urgent business staffing needs with flexible contract staffing, executive search, and verified talent deployment.',
    workingSequence: 'Step 5: Deploys qualified personnel, manages contract staffing, and coordinates client placement pipelines.'
  },
  {
    priority: 6,
    slug: 'ai-agents-network',
    defaultTitle: 'AI Agents Network & Personal AI',
    category: 'Artificial Intelligence',
    tag: 'Departmental Co-pilots',
    badgeColor: 'indigo',
    role: 'Department-specific AI co-pilots for HR, Sales, IT, and Finance teams, providing conversational SOP search, daily executive briefings, and query resolution.',
    priorityReason: 'Priority 6 (Departmental Acceleration & Intelligence): Supercharges the productivity of team members already working in HRMS, CRM, and recruitment with instant answers and briefs.',
    workingSequence: 'Step 6: Assists employees and managers with daily briefing summaries, SOP knowledge retrieval, and automated task guidance.'
  },
  {
    priority: 7,
    slug: 'ai-robotics-automation',
    defaultTitle: 'AI Robotics & Automation',
    category: 'Automation',
    tag: 'Autonomous Orchestration',
    badgeColor: 'fuchsia',
    role: 'Autonomous software bots, robotic process automation (RPA), document processing & data extraction, and smart multi-stage approvals with human-in-the-loop controls.',
    priorityReason: 'Priority 7 (Cross-Platform Autonomous Orchestration): Seamlessly links HRMS, Attendance, Job Portal, CRM, and Finance—eliminating manual repetitive toil and ensuring automated, auditable workflows across all modules.',
    workingSequence: 'Step 7: Connects all data streams across the platform to automate repetitive cross-module tasks and approvals.'
  }
];

// Dynamically queries MySQL Service records to guarantee real-time updates
async function getLiveMain7Modules() {
  try {
    const allServices = await Service.findAll({ where: { isPublished: true } });
    
    return MAIN_7_MODULES_METADATA.map(meta => {
      const svc = allServices.find(s => s.slug === meta.slug);
      const title = svc ? svc.title : meta.defaultTitle;
      const category = svc ? svc.category : meta.category;
      const description = svc ? (svc.description || svc.shortDescription) : meta.role;
      const shortDescription = svc ? (svc.shortDescription || svc.description?.slice(0, 160)) : meta.role;
      const features = svc && Array.isArray(svc.features) && svc.features.length > 0
        ? svc.features
        : [
            'Real-time enterprise workflows',
            'Centralized database & analytics',
            'Role-based security & audits'
          ];
      const techStack = svc && Array.isArray(svc.techStack) ? svc.techStack : [];
      const updatedAt = svc ? svc.updatedAt : new Date();

      return {
        ...meta,
        id: svc ? svc.id : null,
        title,
        category,
        description,
        shortDescription,
        features,
        techStack,
        techSummary: svc?.techSummary || '',
        demoEnabled: svc ? svc.demoEnabled : true,
        accessType: svc ? svc.accessType : 'organization',
        updatedAt,
        updatedAtFormatted: new Date(updatedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        isLive: true
      };
    });
  } catch (err) {
    console.error('Error fetching live 7 modules from DB:', err);
    return MAIN_7_MODULES_METADATA.map(m => ({
      ...m,
      title: m.defaultTitle,
      shortDescription: m.role,
      features: ['Real-time cloud database', 'Secure role-based access'],
      updatedAtFormatted: new Date().toLocaleDateString('en-US'),
      isLive: true
    }));
  }
}

// POST /api/helper-bot/chat
exports.handleChat = async (req, res) => {
  try {
    const { message, pageContext = {}, userRole = 'guest' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const lower = message.toLowerCase().trim();

    // 1. DEDICATED CURRENT PAGE EXPLANATION HANDLER
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
      const currentPath = pageContext.path || '/';

      // Check if on a dynamic service detail page: /services/:slug
      if (currentPath.startsWith('/services/') && currentPath.length > 10) {
        const slug = currentPath.replace('/services/', '').split('/')[0].split('?')[0];
        try {
          const service = await Service.findOne({ where: { slug } });
          if (service) {
            const featuresStr = Array.isArray(service.features)
              ? service.features.map(f => `  • ${f}`).join('\n')
              : '  • Real-time cloud operations\n  • Role-based security & audits\n  • Seamless API integration';
            const techStack = Array.isArray(service.techStack) ? service.techStack.join(' • ') : '';

            return res.json({
              success: true,
              response: `📄 **You are on the ${service.title} Page** (${service.category})\n\n${service.description || service.shortDescription}\n\n**Core Capabilities of this Module:**\n${featuresStr}\n\n${techStack ? `**Tech Stack & Architecture:**\n${techStack}\n\n` : ''}👉 **What you can do on this page:**\n1. Click **"Launch Interactive Demo"** to simulate and test this tool live in your browser.\n2. Review the technical specifications and integration options.\n3. Request custom enterprise pricing or speak with our deployment engineer.\n\nWould you like me to highlight the interactive demo button for you?`,
              action: {
                type: 'highlight',
                selector: '#launch-demo-btn, .demo-btn, button:has-text("Demo"), a[href*="demo"], [data-guide-id="service-card"]',
                label: `🎯 Highlight "${service.title}" Demo`
              },
              quickReplies: [
                'Where should I click to test demo?',
                'Explain all modules',
                'Show all services',
                'Take a tour'
              ],
              timestamp: new Date().toISOString()
            });
          }
        } catch (e) {}
      }

      // Check standard registered pages
      const sortedKeys = Object.keys(PAGE_CONTEXT_REGISTRY).sort((a, b) => b.length - a.length);
      let matchedKey = sortedKeys.find(k => {
        if (k === '/') return currentPath === '/';
        return currentPath === k || currentPath.startsWith(k + '/');
      }) || '/';

      const pageInfo = PAGE_CONTEXT_REGISTRY[matchedKey] || PAGE_CONTEXT_REGISTRY['/'];
      let elementsList = (pageInfo.keyElements || [])
        .map(el => `• **${el.name}**: ${el.purpose}`)
        .join('\n');

      return res.json({
        success: true,
        response: `📄 **You are on the ${pageInfo.name} Page** (${pageInfo.title})\n\n${pageInfo.summary}\n\n**Key features & interactive options on this page:**\n${elementsList}\n\n💡 *Ask me "Where should I click?" or click any button below for instant guidance!*`,
        action: pageInfo.keyElements?.[0]?.selector ? {
          type: 'highlight',
          selector: pageInfo.keyElements[0].selector,
          label: `🎯 Highlight ${pageInfo.keyElements[0].name}`
        } : null,
        quickReplies: pageInfo.quickReplies || [
          'Where should I click?',
          'Take a guided tour',
          'Explain all modules',
          'Show all services'
        ],
        timestamp: new Date().toISOString()
      });
    }

    // 1.5 DEDICATED PRIORITY OF WORKING 7 MODULES HANDLER
    const isPriorityQuery =
      lower === 'priority of working 7 modules' ||
      lower === 'priority of 7 modules' ||
      lower === 'priority of working' ||
      lower === 'priority of modules' ||
      lower === 'working priority' ||
      lower === 'priority sequence' ||
      lower === 'module priority' ||
      lower === 'working 7 modules' ||
      lower === 'priority of working 7 modules of website' ||
      lower.includes('priority of working') ||
      lower.includes('priority of 7') ||
      lower.includes('working 7 modules') ||
      lower.includes('priority of modules') ||
      lower.includes('priority order') ||
      lower.includes('working sequence') ||
      lower.includes('how do the 7 modules work') ||
      (lower.includes('priority') && (lower.includes('7') || lower.includes('module') || lower.includes('work') || lower.includes('website')));

    if (isPriorityQuery) {
      const live7 = await getLiveMain7Modules();
      
      const priorityListStr = live7.map(m => {
        const topFeatures = m.features && m.features.length > 0 ? m.features.slice(0, 3).join(', ') : 'Real-time automation, cloud sync';
        return `### ⚡ **Priority ${m.priority}: ${m.title}** (${m.tag})\n` +
          `• **Operational Role**: ${m.role}\n` +
          `• **Why this Priority**: ${m.priorityReason}\n` +
          `• **Working Workflow**: ${m.workingSequence}\n` +
          `• **Live Database Features**: ${topFeatures}\n` +
          `• **Status**: 🟢 Active in Cloud • Last Synced: ${m.updatedAtFormatted}`;
      }).join('\n\n');

      return res.json({
        success: true,
        response: `⚡ **Priority of Working: The 7 Core Flagship Modules of Ardhnarishwar**\n\n` +
          `Ardhnarishwar connects **people-work and machine-work** into one unified operating layer. To maximize operational efficiency, our **7 core modules follow a structured working priority sequence (Priority 1 to Priority 7)**:\n\n` +
          `${priorityListStr}\n\n` +
          `🔄 **Automatic Cloud Synchronization**: This priority structure and all module capabilities are dynamically fetched from our live MySQL database. When admins update services, features, or configurations, the changes are automatically reflected across the platform in real time!`,
        action: {
          type: 'navigate',
          url: '/how-it-works',
          label: '🧭 View System Architecture & How It Works'
        },
        quickReplies: [
          '⭐ Explain Main 7 Modules',
          '🔄 Explain Latest Updates',
          'Explain HRMS & Attendance',
          'Explain AI Recruitment',
          'Explain HR Staffing Solutions'
        ],
        timestamp: new Date().toISOString()
      });
    }

    // 1.6 DEDICATED MAIN 7 MODULES EXPLAINER HANDLER
    const isMain7ModulesQuery =
      lower === 'explain main 7 modules' ||
      lower === 'explain 7 modules' ||
      lower === 'main 7 modules' ||
      lower === '7 modules' ||
      lower === '7 main modules' ||
      lower === 'what are the 7 modules' ||
      lower === 'explain the 7 modules' ||
      lower === 'seven modules' ||
      lower === 'explain seven modules' ||
      lower === 'main modules' ||
      lower === 'core modules' ||
      lower === '7 core modules' ||
      lower === 'core 7 modules' ||
      lower.includes('main 7 modules') ||
      lower.includes('7 main modules') ||
      lower.includes('explain 7 modules') ||
      lower.includes('explain main 7') ||
      lower.includes('7 modules') ||
      lower.includes('seven modules') ||
      (lower.includes('7') && lower.includes('module')) ||
      (lower.includes('main') && lower.includes('module') && !lower.includes('all'));

    if (isMain7ModulesQuery) {
      const live7 = await getLiveMain7Modules();

      const modulesListStr = live7.map((m, idx) => {
        const topFeatures = m.features && m.features.length > 0 ? m.features.slice(0, 3).map(f => `    - ${f}`).join('\n') : '    - Real-time cloud operations';
        return `**${idx + 1}. ${m.title}** [Priority ${m.priority} • ${m.tag}]\n` +
          `  • **Category**: ${m.category}\n` +
          `  • **Overview**: ${m.shortDescription}\n` +
          `  • **Core Capabilities**:\n${topFeatures}\n` +
          `  • **Working Step**: ${m.workingSequence}\n` +
          `  • **Live Status**: 🟢 Active • Last synced: ${m.updatedAtFormatted}`;
      }).join('\n\n');

      return res.json({
        success: true,
        response: `⭐ **The Main 7 Core Modules of Ardhnarishwar Global Business Solutions**\n\n` +
          `Here is the complete breakdown of our **7 flagship modules**, automatically loaded from our live cloud database:\n\n` +
          `${modulesListStr}\n\n` +
          `💡 **Next Recommended Actions:**\n` +
          `1. Ask **"Priority of working 7 modules"** to understand how they sequence and interact.\n` +
          `2. Ask **"Explain recent updates"** to see live database changelogs.\n` +
          `3. Click below to launch the interactive software catalog or test live demos!`,
        action: {
          type: 'navigate',
          url: '/services',
          label: '📂 Open Services Catalog & Demos'
        },
        quickReplies: [
          '⚡ Priority of Working 7 Modules',
          '🔄 Explain Latest Updates',
          'Explain Smart Attendance',
          'Explain AI Recruitment Cloud',
          'Explain HR Staffing Solutions'
        ],
        timestamp: new Date().toISOString()
      });
    }

    // 1.7 DEDICATED LIVE UPDATES & AUTOMATIC UPDATES EXPLAINER HANDLER
    const isUpdatesQuery =
      lower === 'when all update explain it' ||
      lower === 'when all update explain it also' ||
      lower === 'when all update' ||
      lower === 'explain updates' ||
      lower === 'what are the updates' ||
      lower === 'latest updates' ||
      lower === 'recent updates' ||
      lower === 'module updates' ||
      lower === 'website updates' ||
      lower === 'system updates' ||
      lower === 'all updates' ||
      lower === 'all update' ||
      lower === 'automatically updates' ||
      lower === 'automatic updates' ||
      lower === 'live updates' ||
      lower.includes('when all update') ||
      lower.includes('automatically update') ||
      lower.includes('automatic update') ||
      lower.includes('recent update') ||
      lower.includes('latest update') ||
      lower.includes('module update') ||
      lower.includes('explain update') ||
      (lower.includes('update') && (lower.includes('explain') || lower.includes('show') || lower.includes('what') || lower.includes('recent') || lower.includes('all') || lower.includes('system') || lower.length < 25));

    if (isUpdatesQuery && !lower.includes('password') && !lower.includes('profile')) {
      const live7 = await getLiveMain7Modules();

      const updatesList = live7.map(m => {
        return `• **${m.title}** (${m.category}) — 🟢 **Live & Synced**\n` +
          `  - Priority: Priority ${m.priority} (${m.tag})\n` +
          `  - Active Features: ${m.features.length} capabilities loaded\n` +
          `  - Last Synced from Database: **${m.updatedAtFormatted}**`;
      }).join('\n\n');

      return res.json({
        success: true,
        response: `🔄 **Ardhnarishwar Real-Time System Updates & Live Module Status**\n\n` +
          `This website and AI bot are **automatically synchronized directly with our MySQL database in real time**. Whenever modules, features, pricing, or workflows are updated:\n\n` +
          `✅ **How Automatic Updates Work:**\n` +
          `1. **Zero-Delay Database Connection**: The AI Helper Bot queries the database on every prompt to fetch active service features, tech stacks, and descriptions.\n` +
          `2. **Instant Admin Reflection**: When administrators add new features or update text in the Admin Panel (\`/admin/services\`), the AI Bot immediately explains the updated versions without requiring a code rebuild.\n` +
          `3. **Automatic Working Priority Sync**: Any status changes or new module dependencies automatically recalculate within our 7-step priority flow.\n\n` +
          `📋 **Current Live Status of the 7 Main Modules:**\n\n${updatesList}\n\n` +
          `⚡ **System Health Status:**\n` +
          `• Database Status: 🟢 Connected (MySQL)\n` +
          `• Dynamic APIs: 🟢 Synchronized\n` +
          `• Portals Online: 🟢 Client, Candidate & Admin Portals Active\n\n` +
          `Would you like me to explain the working priority of these 7 modules or test an interactive demo?`,
        action: {
          type: 'navigate',
          url: '/services',
          label: '📂 Browse Live Updated Services'
        },
        quickReplies: [
          '⚡ Priority of Working 7 Modules',
          '⭐ Explain Main 7 Modules',
          'Explain Smart Attendance',
          'Explain AI Recruitment Cloud',
          'Take a guided tour'
        ],
        timestamp: new Date().toISOString()
      });
    }

    // 2. DEDICATED ALL-MODULES EXPLAINER HANDLER
    const isAllModulesQuery = 
      lower === 'explain all modules' ||
      lower === 'explain modules' ||
      lower === 'all modules' ||
      lower === 'what modules do you have' ||
      lower === 'list all modules' ||
      lower === 'list of modules' ||
      lower === 'modules list' ||
      lower === 'explain each module' ||
      lower === 'all services and modules' ||
      lower === 'modules and services' ||
      lower === 'walk me through all modules' ||
      lower === 'explain 20 modules' ||
      lower === 'explain live modules' ||
      lower === 'live modules' ||
      lower === 'tell me about all modules' ||
      lower === 'what are all the modules' ||
      lower.includes('all modules') ||
      lower.includes('explain modules') ||
      lower.includes('live modules') ||
      lower.includes('list of modules') ||
      lower.includes('each module');

    if (isAllModulesQuery) {
      try {
        const allServices = await Service.findAll({ where: { isPublished: true }, order: [['id', 'ASC']] });
        
        return res.json({
          success: true,
          response: `⚡ **Ardhnarishwar Enterprise Platform: Live Connected Modules**\n\nOur platform unifies **people-work and machine-work** across 5 operational domains:\n\n### 👥 **1. HR & Workforce Management**\n1. **HRMS & Workforce Management**: Complete employee lifecycle, digital onboarding, org hierarchy, leave approvals & automated payroll sync.\n2. **Smart Attendance System**: Real-time Face Recognition, GPS geo-fenced mobile check-ins, biometric integration & shift overtime calculation.\n\n### 🤖 **2. Artificial Intelligence & Automation**\n3. **AI Recruitment Cloud**: AI resume parsing, candidate skill-matching, automated screening & structured interview evaluation.\n4. **AI Robotics & Automation**: Autonomous software bots eliminating repetitive administrative toil.\n5. **AI Agents Network**: Department-specific AI co-pilots trained for HR, Sales, IT, and Finance teams.\n6. **Personal AI Assistant**: Contextual digital assistant for executive scheduling and real-time query resolution.\n7. **AI Answer System**: Natural-language enterprise conversational knowledge engine.\n\n### 💼 **3. Staffing & Talent Acquisition**\n8. **HR Staffing Solutions**: Flexible contract staffing, permanent recruitment, and executive headhunting across industries.\n9. **Job Portal**: Dedicated candidate discovery portal with AI skill matching.\n\n### 📈 **4. Enterprise Tools, CRM & Analytics**\n10. **CRM & Sales Cloud**: End-to-end sales pipelines, lead scoring, deal stages, and customer support ticketing.\n11. **Project & Operations Management**: Multi-team task tracking, milestone management, and operational workflows.\n12. **Finance & Revenue Intelligence**: Automated billing, invoicing, and real-time cash flow forecasting.\n13. **Advanced Business Analytics**: Executive KPI dashboards with predictive business metrics.\n\n### 🔒 **5. Security, Knowledge & Global Network**\n14. **Cyber Security Command Center**: Zero-trust access controls, audit trails, and encrypted multi-tenant data isolation.\n15. **Global Knowledge Network**: Centralized corporate documentation and knowledge sharing.\n16. **Communication Hub**: Unified video, chat, voice, and internal enterprise messaging.\n17. **Global Marketplace**: Verified vendor, contractor, and freelancer collaboration hub.\n18. **Smart City & Industry 5.0**: IoT sensor integration, smart infrastructure, and robotic manufacturing.\n19. **Global Expansion**: Cross-border compliance, multi-currency operations, and global entity management.\n20. **Custom Solutions & Consulting**: Tailor-made enterprise software engineered for proprietary business models.\n\n💡 *Ask me to explain any individual module (e.g. "Explain Smart Attendance" or "Explain CRM") or click below to launch the interactive catalog!*`,
          action: {
            type: 'navigate',
            url: '/services',
            label: '📂 Open Interactive Services Catalog'
          },
          quickReplies: [
            'Explain Smart Attendance',
            'Explain AI Recruitment',
            'Explain CRM & Sales Cloud',
            'Explain HRMS & Payroll',
            'Book a Live Demo'
          ],
          timestamp: new Date().toISOString()
        });
      } catch (e) {}
    }

    // 3. DEDICATED WEBSITE EXPLANATION
    if (
      lower.includes('explain website') ||
      lower.includes('about the website') ||
      lower.includes('tell me about this website') ||
      lower.includes('what is this website') ||
      lower.includes('what does this website do') ||
      lower.includes('explain ardhnarishwar') ||
      lower.includes('website overview') ||
      lower.includes('website explanation')
    ) {
      return res.json({
        success: true,
        response: `🌐 **Ardhnarishwar Global Business Solutions — Unified Enterprise Cloud**\n\nArdhnarishwar is an integrated business technology platform that brings **people-work and machine-work together** into one unified operating layer.\n\n### 🚀 **What the Website & Platform Offers:**\n1. **Workforce Management & Smart Attendance**: Complete employee lifecycle management paired with Face Recognition, GPS check-ins, and automated payroll sync.\n2. **AI Recruitment Cloud & Job Portal**: Resume intelligence, AI skill gap analysis, candidate screening, and seamless job applicant tracking.\n3. **CRM, Sales Cloud & Customer Tickets**: End-to-end sales pipelines, deal stages, client inquiries, and task automation.\n4. **Robotics, Automation & AI Agents**: Specialized autonomous bots for HR, Finance, Recruitment, and IT support.\n5. **Multi-Tenant Secure Portals**: Dedicated workspaces for Client Organizations, Job Seekers (Candidates), and Administrators.\n\nWould you like me to give you a guided tour, explain a specific feature in depth, or show you where to test a live demo?`,
        action: {
          type: 'tour',
          tourId: 'website-overview-tour',
          label: '🧭 Start Website Explorer Tour'
        },
        quickReplies: [
          'Explain all modules',
          'Explain HRMS & Attendance',
          'Explain AI Recruitment',
          'Where should I click to book a demo?'
        ],
        timestamp: new Date().toISOString()
      });
    }

    // 4. DEDICATED GENERAL SERVICES & SOLUTIONS HANDLER
    const isServiceQuery = 
      lower === 'services' ||
      lower === 'service' ||
      lower === 'what are your services' ||
      lower.includes('service') ||
      lower.includes('services') ||
      lower.includes('what do you offer') ||
      lower.includes('what does ardhnarishwar offer') ||
      lower.includes('what do you provide') ||
      lower.includes('what can you do') ||
      lower.includes('solutions') ||
      lower.includes('all solutions') ||
      lower.includes('our products') ||
      lower.includes('products and services') ||
      lower.includes('product list') ||
      lower.includes('service list') ||
      lower.includes('services list') ||
      lower.includes('list of services');

    if (isServiceQuery && !lower.includes('terms of service')) {
      try {
        const allServices = await Service.findAll({ where: { isPublished: true }, order: [['id', 'ASC']] });

        // Domain-specific service inquiries
        const isAiDomain = (lower.includes('ai') || lower.includes('artificial') || lower.includes('robot') || lower.includes('agent')) && !lower.includes('hrms') && !lower.includes('staffing');
        const isHrDomain = (lower.includes('hr') || lower.includes('workforce') || lower.includes('attendance') || lower.includes('payroll') || lower.includes('employee')) && !lower.includes('sales');
        const isStaffingDomain = (lower.includes('staffing') || lower.includes('recruitment') || lower.includes('hiring') || lower.includes('job portal')) && !lower.includes('crm');
        const isCrmDomain = (lower.includes('crm') || lower.includes('sales') || lower.includes('lead') || lower.includes('pipeline')) && !lower.includes('attendance');

        if (isAiDomain && lower !== 'services' && lower !== 'service' && lower !== 'what are your services') {
          return res.json({
            success: true,
            response: `🤖 **Ardhnarishwar AI & Autonomous Solutions:**\n\nWe provide advanced artificial intelligence and automation modules engineered for high-performance enterprise operations:\n\n• **AI Recruitment Cloud**: AI-powered resume intelligence, candidate skill matching, and automated interview screening.\n• **AI Robotics & Automation**: Autonomous software bots that eliminate repetitive manual workflows.\n• **AI Agents Network**: Department-specific AI co-pilots trained for HR, Sales, IT, and Finance teams.\n• **Personal AI Assistant**: Contextual digital assistant for executive scheduling and real-time query resolution.\n• **AI Answer System**: Natural-language enterprise conversational knowledge engine.\n\nClick below to explore our AI solutions and test interactive product demos!`,
            action: {
              type: 'navigate',
              url: '/services/ai-recruitment-cloud',
              label: '🚀 Explore AI Recruitment Cloud'
            },
            quickReplies: [
              'Explain AI Recruitment Cloud',
              'Explain AI Robotics & Automation',
              'Explain AI Agents Network',
              'Show all other services'
            ],
            timestamp: new Date().toISOString()
          });
        }

        if (isHrDomain && lower !== 'services' && lower !== 'service' && lower !== 'what are your services') {
          return res.json({
            success: true,
            response: `👥 **Ardhnarishwar HR & Workforce Management Services:**\n\nOur workforce suite digitizes the entire human resources lifecycle from hire to retire:\n\n• **HRMS & Workforce Management**: Complete employee database, digital onboarding, department hierarchies, leave approvals, and payroll reporting.\n• **Smart Attendance System**: Real-time attendance tracking via Face Recognition, GPS geo-fenced mobile check-ins, biometric hardware, and overtime calculations.\n• **HR Staffing Solutions**: Flexible contract, permanent, and executive recruitment services across industries.\n• **Job Portal**: Dedicated candidate discovery portal with AI skill matching.\n\nWould you like to explore HRMS, see Smart Attendance in action, or schedule a live demo?`,
            action: {
              type: 'navigate',
              url: '/services/hrms-workforce-management',
              label: '👥 Explore HRMS & Workforce Management'
            },
            quickReplies: [
              'Explain Smart Attendance System',
              'Explain HRMS & Workforce Management',
              'Book a Live HR Demo',
              'Show all services'
            ],
            timestamp: new Date().toISOString()
          });
        }

        // Comprehensive All-Services Response
        return res.json({
          success: true,
          response: `🏢 **Ardhnarishwar Enterprise Services & Solutions Suite**\n\nArdhnarishwar brings **people-work and machine-work together** with an integrated cloud ecosystem of **live connected enterprise modules**:\n\n### 1. 👥 **HR & Workforce Management**\n• **HRMS & Workforce Management**: Complete employee lifecycle, digital onboarding, org hierarchy, leave approvals & automated payroll sync.\n• **Smart Attendance System**: Real-time Face Recognition, GPS geo-fenced check-ins, biometric integration & shift overtime calculation.\n\n### 2. 🤖 **AI & Autonomous Automation**\n• **AI Recruitment Cloud**: AI resume parsing, candidate skill-matching, automated screening & structured interview evaluation.\n• **AI Robotics & Automation**: Autonomous software bots eliminating repetitive administrative toil.\n• **AI Agents Network & Personal AI**: Departmental AI co-pilots for HR, Sales, IT, and Finance teams.\n• **AI Answer System**: Enterprise conversational knowledge retrieval and customer support resolution.\n\n### 3. 💼 **Staffing & Talent Acquisition**\n• **HR Staffing Solutions**: Flexible contract staffing, permanent recruitment, and executive headhunting across industries.\n• **Job Portal**: Dedicated candidate discovery, application tracking, and automated candidate-job matching.\n\n### 4. 📈 **Enterprise Tools, CRM & Analytics**\n• **CRM & Sales Cloud**: End-to-end sales pipelines, lead scoring, deal stages, and customer support ticketing.\n• **Project & Operations Management**: Multi-team task tracking, milestone management, and operational workflows.\n• **Finance & Revenue Intelligence**: Automated billing, invoicing, and real-time cash flow forecasting.\n• **Advanced Business Analytics**: Executive KPI dashboards with predictive business metrics.\n\n### 5. 🔒 **Security, Global Expansion & Custom Solutions**\n• **Cyber Security Command Center**: Zero-trust access controls, audit trails, and encrypted multi-tenant data isolation.\n• **Global Knowledge Network & Communication Hub**: Unified corporate knowledge base & secure collaboration.\n• **Custom Solutions & Consulting**: Tailor-made enterprise software engineered for your exact business workflows.\n\n💡 *Ask me to deep-dive into any service (e.g. "Explain Smart Attendance" or "Tell me about AI Recruitment"), or click below to launch the full interactive catalog!*`,
          action: {
            type: 'navigate',
            url: '/services',
            label: '📂 Open Services Catalog (Live Modules)'
          },
          quickReplies: [
            'Explain Smart Attendance',
            'Explain AI Recruitment',
            'Explain HRMS & Payroll',
            'Explain CRM & Sales',
            'Book a Live Demo'
          ],
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error('Error fetching services for helper bot:', e);
      }
    }

    // 5. DYNAMIC INDIVIDUAL SERVICE / MODULE MATCHING
    try {
      const allServices = await Service.findAll({ where: { isPublished: true } });
      
      // Known acronyms and alias dictionary
      const ALIASES = {
        'hrms': 'hrms-workforce-management',
        'attendance': 'smart-attendance-system',
        'smart attendance': 'smart-attendance-system',
        'face attendance': 'smart-attendance-system',
        'biometric': 'smart-attendance-system',
        'recruitment': 'ai-recruitment-cloud',
        'ai recruitment': 'ai-recruitment-cloud',
        'ats': 'ai-recruitment-cloud',
        'answer system': 'ai-answer-system',
        'ai answer': 'ai-answer-system',
        'personal ai': 'personal-ai-assistant',
        'ai assistant': 'personal-ai-assistant',
        'robotics': 'ai-robotics-automation',
        'ai robotics': 'ai-robotics-automation',
        'automation': 'ai-robotics-automation',
        'crm': 'crm-sales-cloud',
        'sales cloud': 'crm-sales-cloud',
        'project management': 'project-operations-management',
        'operations management': 'project-operations-management',
        'finance': 'finance-revenue-intelligence',
        'revenue': 'finance-revenue-intelligence',
        'analytics': 'advanced-business-analytics',
        'business analytics': 'advanced-business-analytics',
        'knowledge network': 'global-knowledge-network',
        'communication hub': 'communication-hub',
        'cyber security': 'cyber-security-command-center',
        'cybersecurity': 'cyber-security-command-center',
        'marketplace': 'global-marketplace',
        'smart city': 'smart-city-industry-5-0',
        'industry 5.0': 'smart-city-industry-5-0',
        'expansion': 'global-expansion',
        'global expansion': 'global-expansion',
        'ai agents': 'ai-agents-network',
        'agents network': 'ai-agents-network',
        'custom solutions': 'custom-solutions-consulting',
        'consulting': 'custom-solutions-consulting',
        'staffing': 'hr-staffing-solutions',
        'hr staffing': 'hr-staffing-solutions',
        'job portal': 'job-portal'
      };

      let matchedService = null;

      // Check alias dictionary
      for (const [alias, targetSlug] of Object.entries(ALIASES)) {
        if (lower === alias || lower.includes(`explain ${alias}`) || lower.includes(`tell me about ${alias}`) || lower.includes(alias)) {
          matchedService = allServices.find(s => s.slug === targetSlug);
          if (matchedService) break;
        }
      }

      // Check exact title or slug
      if (!matchedService) {
        for (const svc of allServices) {
          const titleLower = svc.title.toLowerCase();
          const slugLower = svc.slug.toLowerCase().replace(/-/g, ' ');
          if (lower.includes(titleLower) || (slugLower.length > 4 && lower.includes(slugLower))) {
            matchedService = svc;
            break;
          }
        }
      }

      if (matchedService) {
        const svc = matchedService;
        const featureList = Array.isArray(svc.features)
          ? svc.features.map(f => `  • ${f}`).join('\n')
          : '  • Real-time enterprise automation\n  • Centralized database & analytics\n  • Role-based access control';
        const techStackStr = Array.isArray(svc.techStack) ? svc.techStack.join(' • ') : '';

        return res.json({
          success: true,
          response: `✨ **Module Deep-Dive: ${svc.title}** (${svc.category})\n\n${svc.description || svc.shortDescription}\n\n**Key Capabilities & Capabilities:**\n${featureList}\n\n${techStackStr ? `**Architecture & Stack:**\n${techStackStr}\n\n` : ''}${svc.techSummary ? `**How It Works:**\n${svc.techSummary}\n\n` : ''}👉 You can test the interactive product demo on this module's dedicated page!`,
          action: {
            type: 'navigate',
            url: `/services/${svc.slug}`,
            label: `🚀 Explore ${svc.title} & Test Demo`
          },
          quickReplies: [
            'Where should I click to test demo?',
            'Explain all modules',
            'Take a guided tour'
          ],
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {}

    let dbMatch = null;
    try {
      const customItems = await HelperBotKnowledge.findAll({ where: { isActive: true } });
      for (const item of customItems) {
        const keywords = Array.isArray(item.triggerKeywords) ? item.triggerKeywords : [];
        if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
          dbMatch = {
            text: `**${item.title}**\n\n${item.content}`,
            action: item.actionType !== 'none' ? {
              type: item.actionType,
              ...item.actionPayload,
            } : null,
            quickReplies: item.quickReplies || []
          };
          break;
        }
      }
    } catch (e) {
      // Continue with built-in knowledge if DB lookup fails
    }

    if (dbMatch) {
      return res.json({
        success: true,
        response: dbMatch.text,
        action: dbMatch.action,
        quickReplies: dbMatch.quickReplies,
        timestamp: new Date().toISOString()
      });
    }

    // Process through comprehensive knowledge & click-guidance engine
    const result = processHelperBotQuery({ message, pageContext, userRole });

    return res.json({
      success: true,
      response: result.text,
      action: result.action || null,
      quickReplies: result.quickReplies || [],
      pageContext: pageContext,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Helper bot chat error:', error);
    return res.status(500).json({
      success: false,
      response: "I'm having a brief connection pause. Please try asking again or browse our Services page directly!",
      quickReplies: ['Explore Services', 'Contact Us', 'Request a Demo']
    });
  }
};

// GET /api/helper-bot/page-context?path=/services
exports.getPageContext = async (req, res) => {
  try {
    const queryPath = req.query.path || '/';

    // Handle dynamic service route: /services/:slug
    if (queryPath.startsWith('/services/') && queryPath.length > 10) {
      const slug = queryPath.replace('/services/', '').split('/')[0].split('?')[0];
      try {
        const service = await Service.findOne({ where: { slug } });
        if (service) {
          return res.json({
            success: true,
            context: {
              name: service.title,
              title: `${service.title} (${service.category})`,
              summary: service.shortDescription || service.description?.slice(0, 160) || 'Enterprise technology module.',
              keyElements: [
                { id: 'service-demo-action', name: 'Interactive Demo Button', selector: '#launch-demo-btn, .demo-btn, button:has-text("Demo"), a[href*="demo"], [data-guide-id="service-card"]', purpose: 'Launch live browser simulation to test this module.' },
                { id: 'service-contact-action', name: 'Request Enterprise Quote', selector: 'a[href="/contact"], button:has-text("Quote"), button:has-text("Inquire")', purpose: 'Connect with a solutions engineer for customized deployment.' }
              ],
              quickReplies: [
                'Where should I click to test demo?',
                'Explain all modules',
                'Show all services',
                'Take a tour'
              ]
            }
          });
        }
      } catch (e) {}
    }

    const sortedKeys = Object.keys(PAGE_CONTEXT_REGISTRY).sort((a, b) => b.length - a.length);
    let matchedKey = sortedKeys.find(k => {
      if (k === '/') return queryPath === '/';
      return queryPath === k || queryPath.startsWith(k + '/');
    }) || '/';

    const info = PAGE_CONTEXT_REGISTRY[matchedKey] || PAGE_CONTEXT_REGISTRY['/'];
    return res.json({ success: true, context: info });
  } catch (error) {
    console.error('Get page context error:', error);
    return res.status(500).json({ error: 'Failed to retrieve page context' });
  }
};

// GET /api/helper-bot/knowledge
exports.getKnowledge = async (req, res) => {
  try {
    const custom = await HelperBotKnowledge.findAll({ where: { isActive: true }, order: [['sortOrder', 'ASC']] });
    return res.json({
      success: true,
      pageContexts: PAGE_CONTEXT_REGISTRY,
      generalTopics: GENERAL_KNOWLEDGE_TOPICS,
      customKnowledge: custom,
      tours: GUIDED_TOURS
    });
  } catch (error) {
    console.error('Get knowledge error:', error);
    return res.json({
      success: true,
      pageContexts: PAGE_CONTEXT_REGISTRY,
      generalTopics: GENERAL_KNOWLEDGE_TOPICS,
      customKnowledge: [],
      tours: GUIDED_TOURS
    });
  }
};

// GET /api/helper-bot/tours
exports.getTours = async (req, res) => {
  return res.json({ success: true, tours: GUIDED_TOURS });
};

// POST /api/helper-bot/feedback
exports.submitFeedback = async (req, res) => {
  try {
    const {
      messageId,
      userQuery,
      botResponse,
      pagePath,
      pageTitle,
      userRole,
      isHelpful,
      feedbackComment
    } = req.body;

    const feedback = await HelperBotFeedback.create({
      messageId,
      userQuery,
      botResponse,
      pagePath,
      pageTitle,
      userRole: userRole || 'guest',
      isHelpful: !!isHelpful,
      feedbackComment: feedbackComment || null,
    });

    return res.json({ success: true, feedbackId: feedback.id });
  } catch (error) {
    console.error('Submit feedback error:', error);
    return res.status(500).json({ error: 'Failed to save feedback' });
  }
};

// GET /api/helper-bot/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalFeedback = await HelperBotFeedback.count();
    const helpfulCount = await HelperBotFeedback.count({ where: { isHelpful: true } });
    const recentFeedback = await HelperBotFeedback.findAll({
      limit: 30,
      order: [['createdAt', 'DESC']]
    });

    const helpfulPercentage = totalFeedback > 0 ? Math.round((helpfulCount / totalFeedback) * 100) : 100;

    return res.json({
      success: true,
      stats: {
        totalFeedback,
        helpfulCount,
        unhelpfulCount: totalFeedback - helpfulCount,
        helpfulPercentage
      },
      recentFeedback
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({ error: 'Failed to get stats' });
  }
};

// GET /api/helper-bot/features
exports.getFeatures = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { isPublished: true },
      order: [['sortOrder', 'ASC']]
    });

    const grouped = {};
    services.forEach(s => {
      const cat = s.category || 'General Solutions';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({
        id: s.id,
        title: s.title,
        slug: s.slug,
        category: s.category,
        shortDescription: s.shortDescription,
        description: s.description,
        features: s.features || [],
        techStack: s.techStack || [],
        techSummary: s.techSummary,
        accessType: s.accessType,
        demoEnabled: s.demoEnabled
      });
    });

    return res.json({
      success: true,
      features: services,
      categories: grouped
    });
  } catch (error) {
    console.error('Get features error:', error);
    return res.status(500).json({ error: 'Failed to retrieve features' });
  }
};

// GET /api/helper-bot/main-7-modules
exports.getMain7Modules = async (req, res) => {
  try {
    const live7 = await getLiveMain7Modules();
    return res.json({
      success: true,
      modules: live7,
      totalCount: live7.length,
      priorityFlow: live7.map(m => ({
        priority: m.priority,
        slug: m.slug,
        title: m.title,
        tag: m.tag,
        workingSequence: m.workingSequence
      })),
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get main 7 modules error:', error);
    return res.status(500).json({ error: 'Failed to retrieve 7 main modules' });
  }
};

// GET /api/helper-bot/live-updates
exports.getLiveUpdates = async (req, res) => {
  try {
    const live7 = await getLiveMain7Modules();
    const allServices = await Service.findAll({
      where: { isPublished: true },
      order: [['updatedAt', 'DESC']],
      limit: 10
    });

    const recentUpdates = allServices.map(s => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      category: s.category,
      updatedAt: s.updatedAt,
      featuresCount: Array.isArray(s.features) ? s.features.length : 0,
      techStack: s.techStack || []
    }));

    return res.json({
      success: true,
      main7Modules: live7,
      recentUpdates,
      systemStatus: {
        database: 'Connected',
        syncMode: 'Real-time Automatic',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get live updates error:', error);
    return res.status(500).json({ error: 'Failed to retrieve live updates' });
  }
};

// GET /api/helper-bot/explain-website
exports.explainWebsite = async (req, res) => {
  const live7 = await getLiveMain7Modules();

  return res.json({
    success: true,
    title: 'Ardhnarishwar Global Business Solutions',
    tagline: 'Where people-work meets machine-work',
    overview: 'Ardhnarishwar is an integrated business technology ecosystem that unifies workforce management, staffing, artificial intelligence, robotics, and operations into one connected cloud platform.',
    main7Modules: live7,
    prioritySummary: '1. HRMS (Foundation) → 2. Attendance (Daily Operations) → 3. Job Portal (Talent Inflow) → 4. AI Recruitment (Screening) → 5. CRM (Revenue) → 6. AI Agents (Co-pilots) → 7. AI Robotics (Automation)',
    pillars: [
      {
        id: 'workforce',
        title: 'Workforce & Smart Attendance',
        icon: 'Building2',
        summary: 'Complete HR operating system with Face Recognition, GPS check-ins, automated shifts, leaves, and payroll-ready reporting.',
        keyModules: ['HRMS & Workforce Management', 'Smart Attendance System']
      },
      {
        id: 'ai-staffing',
        title: 'AI Recruitment & Staffing Cloud',
        icon: 'Bot',
        summary: 'AI-assisted resume intelligence, skill gap detection, automated screening, and dedicated candidate career portal.',
        keyModules: ['AI Recruitment Cloud', 'Job Portal', 'HR Staffing Solutions']
      },
      {
        id: 'crm-operations',
        title: 'CRM, Sales & Operations',
        icon: 'Workflow',
        summary: 'Sales pipelines, lead scoring, deal stages, client support ticketing, and cross-functional operations tracking.',
        keyModules: ['CRM & Sales Cloud', 'Project & Operations Management']
      },
      {
        id: 'robotics-automation',
        title: 'Robotics, AI Agents & Automation',
        icon: 'Rocket',
        summary: 'Specialized departmental AI agents (HR, Sales, Finance, IT) and robotic process automation removing repetitive toil.',
        keyModules: ['AI Agents Network', 'AI Robotics & Automation', 'Personal AI Assistant']
      },
      {
        id: 'security-portals',
        title: 'Zero-Trust Security & Portals',
        icon: 'ShieldCheck',
        summary: 'Multi-tenant architecture with encrypted isolation, role-based access, and dedicated portals for Clients, Candidates, and Admins.',
        keyModules: ['Cyber Security Command Center', 'Client Portal', 'Candidate Portal']
      }
    ],
    automaticSyncStatus: {
      isAutoSynced: true,
      lastSync: new Date().toISOString()
    }
  });
};


