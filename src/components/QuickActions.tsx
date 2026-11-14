import React from 'react';
import {
  Lightbulb,
  Briefcase,
  CheckCircle,
  Mic,
  Accessibility,
  BookOpen,
  Calendar,
  FileText,
  Send,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { Language, PageType } from '../types';

interface QuickActionsProps {
  pageType: PageType;
  language: Language;
  onSelectAction: (query: string) => void;
  onOpenAccommodations: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  pageType,
  language,
  onSelectAction,
  onOpenAccommodations,
}) => {
  // 1. Job / Career Opportunities
  if (pageType === 'job') {
    return (
      <div className="py-2 select-none">
        <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
          <span>⚡</span>
          <span>{language === 'am' ? 'የስራ ፈጣን ጥያቄዎች፡' : 'Quick actions for this role:'}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'ይህ ስራ ምን እንደሚፈልግ እና ኃላፊነቶቹን በአጭሩ አስረዳኝ'
                  : 'Explain this job and its core responsibilities.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'am' ? 'ይህን ስራ አስረዳኝ' : 'Explain role'}</span>
          </button>

          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'ለዚህ ስራ በክህሎቴ ብቁ ነኝ ወይ? የሚፈለጉትን ክህሎቶች ገምግምልኝ'
                  : 'Am I qualified for this role based on the listed skills?'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'am' ? 'ብቁ ነኝ?' : 'Check qualifications'}</span>
          </button>

          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'ለዚህ ስራ የተለመዱ የቃለ መጠይቅ ጥያቄዎችን አዘጋጅተህ ጠይቀኝ'
                  : 'Start a mock interview preparation for this role.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <Mic className="w-3.5 h-3.5 text-purple-600" />
            <span>{language === 'am' ? 'የቃለ መጠይቅ ልምምድ' : 'Mock interview'}</span>
          </button>

          <button
            onClick={onOpenAccommodations}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all shadow-2xs"
          >
            <Accessibility className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'am' ? 'የቃለ መጠይቅ ድጋፍ ጠይቅ' : 'Request accommodations'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Assignment / Project Deliverables
  if (pageType === 'assignment') {
    return (
      <div className="py-2 select-none">
        <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
          <span>⚡</span>
          <span>{language === 'am' ? 'የስራ ምደባ ጥያቄዎች፡' : 'Assignment quick actions:'}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'የዚህን ፕሮጀክት ወይም የቤት ስራ መመሪያዎች በግልጽ አስረዳኝ'
                  : 'Explain the assignment instructions and expectations clearly.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'am' ? 'መመሪያዎችን አስረዳኝ' : 'Explain instructions'}</span>
          </button>

          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'ይህን ስራ ለማጠናቀቅ የሚያስፈልጉ መስፈርቶችና የውጤት መስጫ ነጥቦች ምንድን ናቸው?'
                  : 'What are the core requirements and grading rubric for this assignment?'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'am' ? 'መስፈርቶች' : 'Key requirements'}</span>
          </button>

          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'የማስረከቢያ ቀንና የመጨረሻ ገደቦች መቼ ናቸው?'
                  : 'When is the submission deadline and what deliverables are required?'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'am' ? 'የማስረከቢያ ቀን' : 'Due dates & deliverables'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Application Process
  if (pageType === 'application') {
    return (
      <div className="py-2 select-none">
        <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
          <span>⚡</span>
          <span>{language === 'am' ? 'የማመልከቻ ድጋፍ፡' : 'Application guidance:'}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'ለዚህ ማመልከቻ ጠንካራ የሽፋን ደብዳቤ (Cover Letter) እንዴት ላዘጋጅ?'
                  : 'How do I draft a compelling cover letter for this position?'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'am' ? 'የሽፋን ደብዳቤ ረዳት' : 'Cover letter tips'}</span>
          </button>

          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'ከማመልከቴ በፊት ማረጋገጥ ያለብኝ ዋና ዋና ነገሮች ምንድን ናቸው?'
                  : 'What is the pre-submission checklist for this application?'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'am' ? 'የማመልከቻ ማረጋገጫ' : 'Application checklist'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Course Overview / Dashboard
  if (pageType === 'course') {
    return (
      <div className="py-2 select-none">
        <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
          <span>⚡</span>
          <span>{language === 'am' ? 'የኮርስ ፈጣን ጥያቄዎች፡' : 'Course overview actions:'}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'በዚህ ሳምንት ምን ምን ስራዎች እንዳሉብኝ አሳየኝ'
                  : 'What immediate deliverables and upcoming tasks do I have this week?'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'am' ? 'የሳምንቱ ስራዎች' : 'Upcoming deliverables'}</span>
          </button>

          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'የትምህርት ጉዞዬን እና ያጠናቀቅኩትን መቶኛ አስረዳኝ'
                  : 'Explain my current course completion percentage and pacing status.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'am' ? 'የኮርስ ውጤት / ጉዞ' : 'Progress & pacing'}</span>
          </button>

          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'የዚህን ኮርስ አጠቃላይ ይዘት በአጭሩ አስረዳኝ'
                  : 'Summarize the core syllabus and key outcomes for this course.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'am' ? 'የኮርሱ ይዘት' : 'Syllabus summary'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 5. Lesson / Concept (Default Learning Context)
  if (pageType === 'lesson') {
    return (
      <div className="py-2 select-none">
        <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
          <span>⚡</span>
          <span>{language === 'am' ? 'ለዚህ ትምህርት ፈጣን ጥያቄዎች፡' : 'Quick questions for this lesson:'}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'ይህ ትምህርት ስለ ምንድን ነው የሚያስረዳው?'
                  : 'Explain this lesson in clear detail.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'am' ? '💡 ይህን ትምህርት አስረዳኝ' : '💡 Explain this lesson'}</span>
          </button>

          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'ይህን ትምህርት በጣም በቀላል ቃላት አጠቃልለህ ንገረኝ'
                  : 'Summarize the core takeaways simply.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>{language === 'am' ? '📝 ዋና ነጥቦች' : '📝 Core takeaways'}</span>
          </button>

          <button
            onClick={() =>
              onSelectAction(
                language === 'am'
                  ? 'ከዚህ ትምህርት ውስጥ 3 የፈተና ጥያቄዎችን አዘጋጅተህ ጠይቀኝ'
                  : 'Quiz me on this lesson with 3 quick questions.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
            <span>{language === 'am' ? '❓ ፈትነኝ' : '❓ Quiz me'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 6. General Platform Page
  return (
    <div className="py-2 select-none">
      <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
        <span>⚡</span>
        <span>{language === 'am' ? 'ፈጣን ድጋፍ፡' : 'Contextual quick actions:'}</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() =>
            onSelectAction(
              language === 'am'
                ? 'በዚህ ገጽ ላይ ያለውን መረጃ አጠቃልለህ ንገረኝ'
                : 'Summarize the available content on this page.'
            )
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'am' ? 'ይህንን ገጽ አጠቃልል' : 'Summarize page'}</span>
        </button>

        <button
          onClick={() =>
            onSelectAction(
              language === 'am'
                ? 'በዚህ ገጽ ላይ እንዴት መመላለስ እንዳለብኝ አሳየኝ'
                : 'How do I navigate and use the features on this page?'
            )
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
          <span>{language === 'am' ? 'የገጽ አጠቃቀም' : 'Navigation help'}</span>
        </button>
      </div>
    </div>
  );
};
