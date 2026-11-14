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
        document.title.replace(' | G-School Intranet', '').trim() ||
        'Lesson';

      // Course/Module from Savanna curriculum bar
      const courseName =
        document.getElementById('student-switch-curriculum')?.textContent?.trim() ||
        'Virtual Assistant Mastery Track';

      // Collect headings
      const headingElements = lessonContainer.querySelectorAll('h2, h3, h4, .callout-content p');
      const headings = Array.from(headingElements)
        .map((el) => el.textContent?.trim() || '')
        .filter((text) => text.length > 0);

      // Clean text
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

  // 2. Job Page Extraction (Schema.org or Job container)
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

    if (jsonLd) {
      const skills = Array.isArray(jsonLd.skills)
        ? jsonLd.skills
        : typeof jsonLd.skills === 'string'
        ? jsonLd.skills.split(',').map((s: string) => s.trim())
        : ['Python', 'Django', 'React', 'REST APIs'];

      return {
        pageType: 'job',
        url,
        title: jsonLd.title || 'Job Opportunity',
        jobTitle: jsonLd.title || 'Junior Python Developer',
        company: jsonLd.hiringOrganization?.name || 'Safaricom Tech / Example Partner',
        skills,
        headings: ['Job Description', 'Responsibilities', 'Required Skills', 'Application Steps'],
        visibleContent: `${jsonLd.description || ''} Requirements: ${skills.join(', ')}`,
        estReadTime: 'Est. 4 mins read',
      };
    }
  }

  // 3. Fallback General / Course Page
  const mainContent =
    document.querySelector('main') ||
    document.querySelector('article') ||
    document.body;

  const title = document.title || 'Savanna Platform';
  const cleanText = cleanVisibleContent(mainContent);

  return {
    pageType,
    url,
    title,
    headings: Array.from(mainContent.querySelectorAll('h1, h2, h3')).map((h) => h.textContent?.trim() || ''),
    visibleContent: cleanText.slice(0, 3500),
    estReadTime: 'Est. 5 mins read',
  };
}

function cleanVisibleContent(root: HTMLElement): string {
  // Clone element to avoid modifying actual DOM
  const clone = root.cloneNode(true) as HTMLElement;

  // Remove junk: nav, script, style, form, password, noscript, svg
  const unneeded = clone.querySelectorAll(
    'nav, header, footer, script, style, noscript, svg, form, input, button, .dropdown-menu, #curriculum_navigation_menu'
  );
  unneeded.forEach((el) => el.remove());

  // Return clean trimmed text
  return (clone.textContent || '').replace(/\s+/g, ' ').trim();
}

export function highlightHostSection(headingOrKeyword: string): boolean {
  try {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, .callout'));
    const target = headings.find((el) =>
      el.textContent?.toLowerCase().includes(headingOrKeyword.toLowerCase())
    );

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const originalBg = (target as HTMLElement).style.backgroundColor;
      (target as HTMLElement).style.backgroundColor = '#FEF08A'; // Yellow flash
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
