import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getPlatformAccess, getCandidateAccess, getToken, getSuperAdminAccess } from '../api/client';

const PageContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function PageContextProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isBotOpen, setIsBotOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'page_guide' | 'tours' | 'faqs'
  const [highlightedTarget, setHighlightedTarget] = useState(null);
  const [highlightTooltip, setHighlightTooltip] = useState(null);
  const [inspectMode, setInspectMode] = useState(false);
  const [activeTour, setActiveTour] = useState(null);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [toursList, setToursList] = useState([]);
  const [pageKnowledge, setPageKnowledge] = useState(null);

  // Compute safe user role from tokens
  const userRole = useMemo(() => {
    if (getSuperAdminAccess() || getToken()) return 'admin';
    if (getPlatformAccess()) return 'organization';
    if (getCandidateAccess()) return 'candidate';
    return 'guest';
  }, [location.pathname]);

  // Derive human-readable page name and metadata from path
  const pageMeta = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return { name: 'Home', title: 'Main Overview & Solutions', path };
    if (path.startsWith('/services')) return { name: 'Services Catalog', title: 'Live Enterprise Modules', path };
    if (path === '/request-demo') return { name: 'Request Demo', title: 'Book Live Product Walkthrough', path };
    if (path === '/contact') return { name: 'Contact Us', title: 'Sales & Enterprise Support', path };
    if (path === '/pricing') return { name: 'Pricing Plans', title: 'Subscription & Enterprise Tiers', path };
    if (path.startsWith('/careers')) return { name: 'Careers', title: 'Open Job Opportunities', path };
    if (path.startsWith('/blog')) return { name: 'Blog & Insights', title: 'Tech Articles & Updates', path };
    if (path === '/about') return { name: 'About Us', title: 'Company Vision & Leadership', path };
    if (path === '/why-ardhnarishwar') return { name: 'Why Us', title: 'Enterprise Advantage', path };
    if (path === '/how-it-works') return { name: 'How It Works', title: 'Architecture & Integrations', path };
    if (path === '/faq') return { name: 'FAQ', title: 'Frequently Asked Questions', path };
    if (path === '/industries') return { name: 'Industries', title: 'Vertical Solutions', path };
    if (path === '/login/choose') return { name: 'Portal Selection', title: 'Choose Your Portal', path };
    if (path.startsWith('/portal')) return { name: 'Client Portal', title: 'Organization Workspace', path };
    if (path.startsWith('/candidate')) return { name: 'Candidate Portal', title: 'Job Seeker Dashboard', path };
    if (path.startsWith('/admin')) return { name: 'Admin Console', title: 'CMS & CRM Management', path };
    return { name: 'Website', title: 'Ardhnarishwar Solutions', path };
  }, [location.pathname]);

  // Load contextual knowledge for current page
  useEffect(() => {
    let isMounted = true;
    axios.get(`${API_BASE}/helper-bot/page-context?path=${encodeURIComponent(location.pathname)}`)
      .then(res => {
        if (isMounted && res.data?.context) {
          setPageKnowledge(res.data.context);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [location.pathname]);

  // Fetch available tours
  useEffect(() => {
    let isMounted = true;
    axios.get(`${API_BASE}/helper-bot/tours`)
      .then(res => {
        if (isMounted && res.data?.tours) {
          setToursList(res.data.tours);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // Smooth scroll and highlight specific element with glowing spotlight ring
  const highlightElement = useCallback((selector, tooltipText = 'Look here!') => {
    if (!selector) return false;

    // Support comma-separated selectors fallback
    const selectors = selector.split(',').map(s => s.trim());
    let targetEl = null;
    for (const sel of selectors) {
      try {
        const found = document.querySelector(sel);
        if (found) {
          targetEl = found;
          break;
        }
      } catch (e) {
        // Skip invalid CSS syntax
      }
    }

    // Smart fallback if on solutions or services page
    if (!targetEl && (window.location.pathname.startsWith('/services') || window.location.hash === '#solutions')) {
      targetEl = document.querySelector(
        '#first-solution-card, .solution-card, #solutions-filter-tabs, .insight-filters, #solutions-grid, .solution-grid, #solutions-header, #solutions, #services'
      );
    }

    if (!targetEl) {
      console.warn('Helper bot: element not found for selector', selector);
      return false;
    }

    // Scroll element into view smoothly - use 'start' for large sections so headers are visible
    const isLargeSection = targetEl.offsetHeight > 450;
    targetEl.scrollIntoView({
      behavior: 'smooth',
      block: isLargeSection ? 'start' : 'center',
    });

    // Calculate position for floating pointer
    const updateTargetCoords = () => {
      const rect = targetEl.getBoundingClientRect();
      setHighlightedTarget({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    };

    updateTargetCoords();
    // Re-check after smooth scrolling finishes
    const scrollFollowTimer = setTimeout(updateTargetCoords, 400);

    setHighlightTooltip(tooltipText);

    // Add glowing spotlight animation class
    targetEl.classList.add('helper-bot-spotlight');

    // Auto-remove highlight after 8 seconds
    const timer = setTimeout(() => {
      targetEl.classList.remove('helper-bot-spotlight');
      setHighlightedTarget(null);
      setHighlightTooltip(null);
    }, 8000);

    return () => {
      clearTimeout(scrollFollowTimer);
      clearTimeout(timer);
      targetEl.classList.remove('helper-bot-spotlight');
      setHighlightedTarget(null);
      setHighlightTooltip(null);
    };
  }, []);

  // Clear active highlight
  const clearHighlight = useCallback(() => {
    document.querySelectorAll('.helper-bot-spotlight').forEach(el => {
      el.classList.remove('helper-bot-spotlight');
    });
    setHighlightedTarget(null);
    setHighlightTooltip(null);
  }, []);

  // Guided Tour controllers
  const startTour = useCallback((tourId) => {
    const tour = toursList.find(t => t.id === tourId) || toursList[0];
    if (!tour || !tour.steps || tour.steps.length === 0) return;

    setActiveTour(tour);
    setTourStepIndex(0);
    setIsBotOpen(false); // Minimize bot during tour to let spotlight shine

    const step = tour.steps[0];
    if (step.targetPage && location.pathname !== step.targetPage) {
      navigate(step.targetPage);
    }

    setTimeout(() => {
      highlightElement(step.targetSelector, step.title);
    }, 400);
  }, [toursList, location.pathname, navigate, highlightElement]);

  const nextTourStep = useCallback(() => {
    if (!activeTour) return;
    const nextIdx = tourStepIndex + 1;
    if (nextIdx >= activeTour.steps.length) {
      // Tour completed
      endTour();
      setIsBotOpen(true);
      return;
    }

    setTourStepIndex(nextIdx);
    const step = activeTour.steps[nextIdx];
    if (step.targetPage && location.pathname !== step.targetPage) {
      navigate(step.targetPage);
    }

    setTimeout(() => {
      highlightElement(step.targetSelector, step.title);
    }, 400);
  }, [activeTour, tourStepIndex, location.pathname, navigate, highlightElement]);

  const prevTourStep = useCallback(() => {
    if (!activeTour || tourStepIndex <= 0) return;
    const prevIdx = tourStepIndex - 1;
    setTourStepIndex(prevIdx);

    const step = activeTour.steps[prevIdx];
    if (step.targetPage && location.pathname !== step.targetPage) {
      navigate(step.targetPage);
    }

    setTimeout(() => {
      highlightElement(step.targetSelector, step.title);
    }, 400);
  }, [activeTour, tourStepIndex, location.pathname, navigate, highlightElement]);

  const endTour = useCallback(() => {
    clearHighlight();
    setActiveTour(null);
    setTourStepIndex(0);
  }, [clearHighlight]);

  // Inspect Element Mode: click any element on the page to ask bot what it does
  useEffect(() => {
    if (!inspectMode) return;

    const handleInspectHover = (e) => {
      e.target.classList.add('helper-inspect-hover');
    };

    const handleInspectLeave = (e) => {
      e.target.classList.remove('helper-inspect-hover');
    };

    const handleInspectClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const el = e.target;
      const elText = el.innerText?.slice(0, 40) || el.getAttribute('aria-label') || el.tagName;
      const elPurpose = el.getAttribute('data-purpose') || el.title || `Element: ${el.tagName.toLowerCase()} with text "${elText}"`;

      setInspectMode(false);
      setIsBotOpen(true);
      setActiveTab('chat');

      // Trigger synthetic question in bot
      window.dispatchEvent(new CustomEvent('helper-bot-ask', {
        detail: {
          query: `What does this button/element do: "${elText}"?`,
          elementInfo: { text: elText, purpose: elPurpose }
        }
      }));
    };

    document.addEventListener('mouseover', handleInspectHover);
    document.addEventListener('mouseout', handleInspectLeave);
    document.addEventListener('click', handleInspectClick, true);

    return () => {
      document.removeEventListener('mouseover', handleInspectHover);
      document.removeEventListener('mouseout', handleInspectLeave);
      document.removeEventListener('click', handleInspectClick, true);
      document.querySelectorAll('.helper-inspect-hover').forEach(el => el.classList.remove('helper-inspect-hover'));
    };
  }, [inspectMode]);

  const openExplainWebsite = useCallback(() => {
    setIsBotOpen(true);
    setActiveTab('explain');
  }, []);

  const openFeatureExplainer = useCallback((featureName) => {
    setIsBotOpen(true);
    setActiveTab('chat');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('helper-bot-ask', {
        detail: { query: `Explain ${featureName}` }
      }));
    }, 150);
  }, []);

  const value = {
    location,
    pageMeta,
    pageKnowledge,
    userRole,
    isBotOpen,
    setIsBotOpen,
    activeTab,
    setActiveTab,
    highlightElement,
    clearHighlight,
    highlightedTarget,
    highlightTooltip,
    activeTour,
    tourStepIndex,
    toursList,
    startTour,
    nextTourStep,
    prevTourStep,
    endTour,
    inspectMode,
    setInspectMode,
    openExplainWebsite,
    openFeatureExplainer
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  const ctx = useContext(PageContext);
  if (!ctx) {
    throw new Error('usePageContext must be used within a PageContextProvider');
  }
  return ctx;
}
