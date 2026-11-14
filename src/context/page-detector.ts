import { PageType } from '../types';

export function detectPageType(): PageType {
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const fullUrl = path + search;

  // 1. Check for Application Page
  if (
    fullUrl.includes('apply') ||
    fullUrl.includes('application') ||
    document.querySelector('form[action*="apply"], [data-page-type="application"], .application-form')
  ) {
    return 'application';
  }

  // 2. Check for Assignment Page
  if (
    fullUrl.includes('assignment') ||
    fullUrl.includes('deliverable') ||
    fullUrl.includes('project') ||
    fullUrl.includes('quiz') ||
    document.querySelector('.assignment-container, #assignment-details, [data-page-type="assignment"]')
  ) {
    return 'assignment';
  }

  // 3. Check for Lesson / Concept Content
  if (
    document.getElementById('curriculum_navigation_content') ||
    fullUrl.includes('concept') ||
    fullUrl.includes('lesson') ||
    fullUrl.includes('lecture') ||
    document.querySelector('article.lesson-content, .concept-content, [data-page-type="lesson"]')
  ) {
    return 'lesson';
  }

  // 4. Check for Job Opportunity (Schema.org, Career Gateway, or URL)
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

  if (
    hasJobSchema ||
    fullUrl.includes('job') ||
    fullUrl.includes('career') ||
    fullUrl.includes('vacancy') ||
    document.querySelector('.job-detail, #detail-summary, [data-page-type="job"]')
  ) {
    return 'job';
  }

  // 5. Check for Course Dashboard
  if (
    document.getElementById('student-current-curriculum') ||
    fullUrl.includes('homepage') ||
    fullUrl.includes('course') ||
    fullUrl.includes('curriculum') ||
    document.querySelector('.course-dashboard, [data-page-type="course"]')
  ) {
    return 'course';
  }

  return 'general';
}
