import { PageContext } from '../types';
import { detectPageType } from './page-detector';

export function extractPageContext(): PageContext {
  const pageType = detectPageType();
  const url = window.location.pathname + window.location.search;

  // 1. Lesson Page Extraction
  if (pageType === 'lesson') {
    const lessonContainer =
      document.getElementById('curriculum_navigation_content') ||
      document.querySelector('article.lesson-content, .concept-content, main');
    if (lessonContainer) {
      const title =
        lessonContainer.querySelector('h1')?.textContent?.trim() ||
        document.title ||
        'Course Lesson';

      const courseName =
        document.getElementById('student-switch-curriculum')?.textContent?.trim() ||
        document.querySelector('.course-title, [data-course-name]')?.textContent?.trim() ||
        'Active Course';

      const headingElements = lessonContainer.querySelectorAll('h2, h3, h4, .callout-content p, mark');
      const headings = Array.from(headingElements)
        .map((el) => el.textContent?.trim() || '')
        .filter((text) => text.length > 0);

      const cleanText = cleanAndSanitizeContent(lessonContainer);
      const wordCount = cleanText.split(/\s+/).length;
      const estReadTime = `Est. ${Math.max(1, Math.round(wordCount / 180))} mins read`;

      return {
        pageType: 'lesson',
        url,
        title,
        lessonName: title,
        courseName,
        headings,
        visibleContent: cleanText,
        estReadTime,
      };
    }
  }

  // 2. Assignment Page Extraction
  if (pageType === 'assignment') {
    const assignContainer =
      document.querySelector('.assignment-container, #assignment-details, [data-page-type="assignment"], main') ||
      document.body;

    const title =
      assignContainer.querySelector('h1, h2')?.textContent?.trim() ||
      document.title ||
      'Course Assignment';

    const headings = Array.from(assignContainer.querySelectorAll('h2, h3, h4')).map(
      (h) => h.textContent?.trim() || ''
    );
    const cleanText = cleanAndSanitizeContent(assignContainer);

    return {
      pageType: 'assignment',
      url,
      title,
      headings,
      visibleContent: cleanText,
      estReadTime: 'Assignment Requirements',
    };
  }

  // 3. Application Page Extraction
  if (pageType === 'application') {
    const appContainer = document.querySelector('form, main, .application-container') || document.body;
    const title = document.querySelector('h1, h2')?.textContent?.trim() || 'Job Application';
    const headings = Array.from(appContainer.querySelectorAll('h2, h3, label')).map(
      (el) => el.textContent?.trim() || ''
    );
    const cleanText = cleanAndSanitizeContent(appContainer);

    return {
      pageType: 'application',
      url,
      title,
      headings,
      visibleContent: cleanText,
      estReadTime: 'Application Portal',
    };
  }

  // 4. Course Dashboards (e.g. homepage-v1-paced.html, homepage-v1-self-paced.html)
  if (pageType === 'course') {
    // 4.1 Detect Course Title dynamically
    const courseTitleEl =
      document.querySelector('#student-current-curriculum, .curriculum-title, [data-course-name], .fs-4.fw-semibold') ||
      document.querySelector('header h1, .header-course-title');
    const courseName =
      courseTitleEl?.textContent?.replace(/\s+/g, ' ').trim() ||
      document.title?.split('|')[0]?.trim() ||
      'Active Course';

    // 4.2 Detect Active Tab / Week / Module
    const activeTab = document.querySelector(
      '.homepage-nav .nav-link.active, .nav-link.active, [aria-current="page"], button[data-section-index].fw-semibold, button[data-section-index].active, .tab-pane.active, [role="tab"][aria-selected="true"]'
    );
    const activeTabLabel = activeTab?.textContent?.replace(/\s+/g, ' ').trim() || '';

    // 4.3 Detect Learner Name if visible
    let learnerName = '';
    const bodyText = document.body.innerText || '';
    const matchGreeting = bodyText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*👋/);
    if (matchGreeting) {
      learnerName = matchGreeting[1];
    } else {
      const learnerEl = document.querySelector('.header-right, .user-name, [data-user-name], .greeting');
      if (learnerEl) learnerName = learnerEl.textContent?.trim() || '';
    }

    // 4.4 Find Active Content Host Container (e.g. #static-track-host for current week)
    const activeContentHost =
      document.getElementById('static-track-host') ||
      document.querySelector('[data-section-host]') ||
      document.getElementById('curriculum_navigation_content') ||
      document.querySelector('.tab-content, main, article, .content-container') ||
      document.body;

    const headings = Array.from(
      activeContentHost.querySelectorAll('h1, h2, h3, h4, h5, .card-header, strong.title')
    )
      .map((h) => h.textContent?.replace(/\s+/g, ' ').trim() || '')
      .filter((h) => h.length > 2 && h.length < 100);

    // Extract clean content from the active host
    let hostCleanText = cleanAndSanitizeContent(activeContentHost);

    // Also include any active cards on the dashboard (e.g. deliverables, upcoming deadlines)
    const cards = Array.from(document.querySelectorAll('.card, .homepage-card'))
      .map((c) => cleanAndSanitizeContent(c))
      .filter((t) => t.length > 20 && !hostCleanText.includes(t.slice(0, 40)))
      .slice(0, 4)
      .join('\n');

    if (cards) {
      hostCleanText = `${hostCleanText}\n\nDashboard Cards & Immediate Deliverables:\n${cards}`;
    }

    // Limit to 4000 characters for token efficiency
    const sanitizedText = hostCleanText.slice(0, 4000);

    const displayTitle = activeTabLabel
      ? `${courseName} - ${activeTabLabel}`
      : courseName;

    const visibleContent = `Active Course: ${courseName}
Active Section/Week: ${activeTabLabel || 'Overview'}
${learnerName ? `Learner: ${learnerName}` : ''}
Page URL: ${url}
Active Headings for this section: ${headings.slice(0, 8).join(' | ')}

--- CURRENT ACTIVE PAGE & WEEK CONTENT ---
${sanitizedText}
--- END ACTIVE PAGE CONTENT ---`;

    return {
      pageType: 'course',
      url,
      title: displayTitle,
      courseName: activeTabLabel ? `${courseName} (${activeTabLabel})` : courseName,
      headings: headings.length > 0 ? headings.slice(0, 10) : ['Course Dashboard', activeTabLabel || 'Overview'],
      visibleContent,
      estReadTime: activeTabLabel || 'Active Dashboard',
    };
  }

  // 5. Job Page / Job Portal (Career Gateway)
  if (pageType === 'job') {
    const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map((s) => {
        try {
          return JSON.parse(s.textContent || '{}');
        } catch {
          return null;
        }
      })
      .find((j) => j && j['@type'] === 'JobPosting');

    const domTitle = document.getElementById('detail-title')?.textContent?.trim();
    const domCompany = document.getElementById('detail-company')?.textContent?.trim();
    const domSkills = Array.from(document.querySelectorAll('#detail-skills span')).map(
      (s) => s.textContent?.trim() || ''
    );

    const title = domTitle || jsonLd?.title || 'Tech Opportunity';
    const company = domCompany || jsonLd?.hiringOrganization?.name || 'Partner Tech Employer';
    const skills =
      domSkills.length > 0 ? domSkills : jsonLd?.skills || ['Python', 'Django', 'React', 'REST APIs'];

    const detailSummary =
      document.getElementById('detail-summary')?.textContent?.trim() || jsonLd?.description || '';

    return {
      pageType: 'job',
      url,
      title,
      jobTitle: title,
      company,
      skills: Array.isArray(skills) ? skills : [skills],
      headings: ['Job Description', 'Core Responsibilities', 'Required Competencies', 'Inclusive Accommodations'],
      visibleContent: `${title} at ${company}. ${detailSummary} Skills: ${skills.join(', ')}`,
      estReadTime: 'Full-time Opportunity',
    };
  }

  // 6. General Fallback
  const mainContent =
    document.querySelector('main, article, .content-container, #content, .container') ||
    document.body;
  const headings = Array.from(mainContent.querySelectorAll('h1, h2, h3, h4'))
    .map((h) => h.textContent?.replace(/\s+/g, ' ').trim() || '')
    .filter(Boolean);
  const cleanText = cleanAndSanitizeContent(mainContent).slice(0, 4000);

  return {
    pageType: 'general',
    url,
    title: document.title || 'Platform Overview',
    headings: headings.length > 0 ? headings.slice(0, 8) : ['Page Overview'],
    visibleContent: `Page Title: ${document.title} (${url})
Page Headings: ${headings.slice(0, 8).join(' | ')}
Page Content:
${cleanText}`,
    estReadTime: 'General Page',
  };
}

function cleanAndSanitizeContent(root: Element): string {
  const clone = root.cloneNode(true) as HTMLElement;

  // Remove non-content elements and sensitive input fields
  const unneeded = clone.querySelectorAll(
    'nav, header, footer, script, style, noscript, svg, input[type="password"], input[type="hidden"], [data-private], .token, .secret'
  );
  unneeded.forEach((el) => el.remove());

  let text = (clone.textContent || '').replace(/\s+/g, ' ').trim();

  // Scrub potential PII, tokens, and credit card patterns
  text = text.replace(/bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi, '[AUTH_TOKEN]');
  text = text.replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '[PAYMENT_INFO]');
  text = text.replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[EMAIL_REDACTED]');

  return text;
}

/**
 * Initializes continuous SPA URL change detection, tab/week click tracking, and debounced DOM observation.
 */
export function initSpaContextTracking(onContextChange: (ctx: PageContext) => void) {
  if (typeof window === 'undefined') return;

  let lastUrl = window.location.href;
  let lastContextSummary = '';

  const checkContextChange = (force = false) => {
    const currentUrl = window.location.href;
    const ctx = extractPageContext();
    const summary = `${ctx.pageType}|${ctx.title}|${ctx.visibleContent.slice(0, 150)}`;

    if (force || currentUrl !== lastUrl || summary !== lastContextSummary) {
      lastUrl = currentUrl;
      lastContextSummary = summary;
      onContextChange(ctx);
    }
  };

  // Monkey-patch history API for SPA router transitions
  const origPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    const res = origPushState.apply(this, args);
    setTimeout(() => checkContextChange(true), 50);
    return res;
  };

  const origReplaceState = window.history.replaceState;
  window.history.replaceState = function (...args) {
    const res = origReplaceState.apply(this, args);
    setTimeout(() => checkContextChange(true), 50);
    return res;
  };

  window.addEventListener('popstate', () => checkContextChange(true));
  window.addEventListener('hashchange', () => checkContextChange(true));

  // Listen to tab / week / module / accordion clicks in the host document
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null;
      const isTabOrNav = target?.closest(
        'a.nav-link, button[data-section-index], [data-track-id], .tab, [role="tab"], .scroll-region__item, .dropdown-item, .accordion-button'
      );
      if (isTabOrNav) {
        // Wait for host script to replace panel DOM
        setTimeout(() => checkContextChange(true), 100);
        setTimeout(() => checkContextChange(true), 350);
      }
    },
    { passive: true }
  );

  window.addEventListener('meri-context-changed', () => {
    checkContextChange(true);
  });

  // Debounced MutationObserver for dynamic single page apps
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const observer = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      checkContextChange(false);
    }, 250);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

export function highlightHostSection(headingOrKeyword: string): boolean {
  try {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, .callout, mark'));
    const target = headings.find((el) =>
      el.textContent?.toLowerCase().includes(headingOrKeyword.toLowerCase())
    );

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const originalBg = (target as HTMLElement).style.backgroundColor;
      (target as HTMLElement).style.backgroundColor = '#FEF08A';
      (target as HTMLElement).style.transition = 'background-color 0.4s ease';

      setTimeout(() => {
        (target as HTMLElement).style.backgroundColor = originalBg;
      }, 2500);
      return true;
    }
  } catch (err) {
    console.warn('[Meri] Could not highlight host section:', err);
  }
  return false;
}
