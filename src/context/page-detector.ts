import { PageType } from '../types';

export function detectPageType(): PageType {
  const path = window.location.pathname.toLowerCase();

  // 1. Check for Savanna Lesson / Concept page
  if (
    document.getElementById('curriculum_navigation_content') ||
    path.includes('concept') ||
    path.includes('lesson')
  ) {
    return 'lesson';
  }

  // 2. Check for Job Posting (Schema.org or URL)
  const hasJobSchema = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some(
    (script) => {
      try {
        const json = JSON.parse(script.textContent || '{}');
        return json['@type'] === 'JobPosting';
      } catch {
        return false;
      }
    }
  );

  if (hasJobSchema || path.includes('job') || path.includes('career') || document.querySelector('.job-detail')) {
    return 'job';
  }

  // 3. Check for Assignment
  if (path.includes('assignment') || document.querySelector('.assignment-container')) {
    return 'assignment';
  }

  // 4. Check for Course Dashboard
  if (document.getElementById('student-current-curriculum') || path.includes('homepage') || path.includes('course')) {
    return 'course';
  }

  return 'general';
}
