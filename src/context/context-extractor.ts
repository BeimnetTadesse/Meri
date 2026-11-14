import { PageContext } from '../types';
import { detectPageType } from './page-detector';

export function extractPageContext(): PageContext {
  const pageType = detectPageType();
  const url = window.location.pathname;

  // 1. Lesson Page Extraction (Savanna concept-with-navigation.html)
  if (pageType === 'lesson') {
    const lessonContainer = document.getElementById('curriculum_navigation_content');
    if (lessonContainer) {
      const title =
        lessonContainer.querySelector('h1')?.textContent?.trim() ||
        'The Future of the VA Industry';

      const courseName =
        document.getElementById('student-switch-curriculum')?.textContent?.trim() ||
        'VA-1: VA Foundations & Professional Identity (Module 2)';

      const headingElements = lessonContainer.querySelectorAll('h2, h3, h4, .callout-content p, mark');
      const headings = Array.from(headingElements)
        .map((el) => el.textContent?.trim() || '')
        .filter((text) => text.length > 0);

      const cleanText = cleanVisibleContent(lessonContainer);
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

  // 2. Course Dashboards (Paced or Self-Paced)
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

  // 3. Job Page / Job Portal (Career Gateway)
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
    const domSkills = Array.from(document.querySelectorAll('#detail-skills span')).map((s) => s.textContent?.trim() || '');

    const title = domTitle || jsonLd?.title || 'Tech Opportunity';
    const company = domCompany || jsonLd?.hiringOrganization?.name || 'Partner Tech Employer';
    const skills = domSkills.length > 0 ? domSkills : jsonLd?.skills || ['Python', 'Django', 'React', 'REST APIs'];

    const detailSummary = document.getElementById('detail-summary')?.textContent?.trim() || jsonLd?.description || '';

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

  // 4. Fallback Hub Page
  const mainContent = document.querySelector('main') || document.body;
  return {
    pageType,
    url,
    title: document.title || 'Savanna Platform',
    headings: Array.from(mainContent.querySelectorAll('h1, h2, h3')).map((h) => h.textContent?.trim() || ''),
    visibleContent: cleanVisibleContent(mainContent).slice(0, 3000),
    estReadTime: 'Savanna Hub',
  };
}

function cleanVisibleContent(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  const unneeded = clone.querySelectorAll(
    'nav, header, footer, script, style, noscript, svg, form, input, button, .dropdown-menu, #curriculum_navigation_menu'
  );
  unneeded.forEach((el) => el.remove());
  return (clone.textContent || '').replace(/\s+/g, ' ').trim();
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
