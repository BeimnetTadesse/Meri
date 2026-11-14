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

  // 4. Course Dashboards
  if (pageType === 'course') {
    const isPaced = url.includes('paced') && !url.includes('self-paced');

    if (isPaced) {
      return {
        pageType: 'course',
        url,
        title: 'WR 100: Fundamentals of Effective Communication',
        courseName: 'WR 100 (Week 10 of 15 • Cohort F26-SEM-16W)',
        headings: ['Week 10 Strip', 'Immediate Deliverables', 'Period Progress: 59.56%', 'Upcoming Events'],
        visibleContent:
          'Learner: Björn Sibanda. Course: WR 100: Fundamentals of Effective Communication. Week 10 of 15. Overall score: 59.56% (slightly behind). Deliverables: Peer review discussion and written reflection due this week.',
        estReadTime: 'Active Dashboard',
      };
    } else {
      return {
        pageType: 'course',
        url,
        title: 'VA-1: VA Foundations & Professional Identity',
        courseName: 'VA-1: VA Foundations (Module 1 of 3)',
        headings: ['Course Progression: 16%', 'Module 1 Complete', 'Module 2: The Future of the VA Industry', 'Pacing Boost'],
        visibleContent:
          'Learner: Amara Nwosu. Course: VA-1: VA Foundations & Professional Identity. Progress: 1 of 3 modules complete (16% towards 70% threshold). Pacing boost: 11 days remaining.',
        estReadTime: 'Active Dashboard',
      };
    }
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
  const mainContent = document.querySelector('main') || document.body;
  return {
    pageType: 'general',
    url,
    title: document.title || 'Platform Overview',
    headings: Array.from(mainContent.querySelectorAll('h1, h2, h3')).map((h) => h.textContent?.trim() || ''),
    visibleContent: cleanAndSanitizeContent(mainContent).slice(0, 3000),
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
 * Initializes continuous SPA URL change detection and debounced DOM observation.
 */
export function initSpaContextTracking(onContextChange: (ctx: PageContext) => void) {
  if (typeof window === 'undefined') return;

  let lastUrl = window.location.href;

  const checkUrlChange = () => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      const ctx = extractPageContext();
      onContextChange(ctx);
    }
  };

  // Monkey-patch history API for SPA router transitions
  const origPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    const res = origPushState.apply(this, args);
    setTimeout(checkUrlChange, 50);
    return res;
  };

  const origReplaceState = window.history.replaceState;
  window.history.replaceState = function (...args) {
    const res = origReplaceState.apply(this, args);
    setTimeout(checkUrlChange, 50);
    return res;
  };

  window.addEventListener('popstate', checkUrlChange);
  window.addEventListener('hashchange', checkUrlChange);
  window.addEventListener('meri-context-changed', () => {
    const ctx = extractPageContext();
    onContextChange(ctx);
  });

  // Debounced MutationObserver for dynamic single page apps
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const observer = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      checkUrlChange();
    }, 350);
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
