import { Citation, Language, PageContext } from '../types';

export interface AIResponse {
  answer: string;
  citations: Citation[];
  source: 'cloud' | 'local_model' | 'offline_faq';
}

export async function askMeriAI(
  question: string,
  context: PageContext,
  language: Language,
  simpleMode: boolean,
  mode: 'course_tutor' | 'career_coach'
): Promise<AIResponse> {
  // 1. Try Cloud / Backend API if configured
  try {
    const res = await fetch('/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        pageContext: context,
        language,
        simpleMode,
        mode,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        answer: data.answer,
        citations: data.citations || [],
        source: 'cloud',
      };
    }
  } catch {
    // Fall through to resilient local knowledge engine
  }

  // 2. Pluggable Offline / Local Knowledge Base Engine
  return generateKnowledgeBaseResponse(question, context, language, simpleMode, mode);
}

function generateKnowledgeBaseResponse(
  query: string,
  context: PageContext,
  language: Language,
  simpleMode: boolean,
  mode: 'course_tutor' | 'career_coach'
): AIResponse {
  const q = query.toLowerCase();

  // --- CAREER COACH MODE ---
  if (mode === 'career_coach') {
    if (q.includes('qualif') || q.includes('ብቁ') || q.includes('match')) {
      if (language === 'am') {
        return {
          answer: simpleMode
            ? 'ለዚህ ስራ Python፣ Django እና React ያስፈልጋሉ። እነዚህን በአልኤክስ (ALX) ተምረዋቸዋል፣ ስለዚህ በደንብ ያሟላሉ! ተጨማሪ የREST API ልምምድ ቢያደርጉ ይመረጣል።'
            : 'በገጹ ላይ ባሉት መስፈርቶች መሰረት፣ እጩው Python፣ Django፣ React እና REST APIs ማወቅ አለበት። እነዚህ በሶፍትዌር ምህንድስና ስርአተ ትምህርት ውስጥ የተካተቱ በመሆናቸው ለስራው ጥሩ ብቃት አለዎት።',
          citations: [
            {
              id: 'c-job-1',
              title: 'Job Requirements',
              section: 'Required Skills: Python, Django, React',
              snippet: 'Develop and maintain web applications with Python & Django.',
            },
          ],
          source: 'offline_faq',
        };
      }
      return {
        answer: simpleMode
          ? 'Yes! You match this job well. It needs Python, Django, and React, which you studied at ALX. Keep practicing building simple APIs to be fully ready!'
          : 'Based on the job posting, the core qualifications are Python, Django, React, and REST APIs. Your ALX curriculum directly maps to these competencies.',
        citations: [
          {
            id: 'c-job-1',
            title: 'Job Requirements',
            section: 'Required Skills: Python, Django, React',
            snippet: 'Develop and maintain web applications with Python & Django.',
          },
        ],
        source: 'offline_faq',
      };
    }

    if (q.includes('accommodat') || q.includes('ድጋፍ') || q.includes('help')) {
      if (language === 'am') {
        return {
          answer: 'ለቃለ-መጠይቁ የአማርኛ አስተርጓሚ፣ ተጨማሪ ጊዜ ወይም በስልክ ብቻ የሚደረግ ቃለ-መጠይቅ መጠየቅ ይችላሉ። ከላይ ያለውን "የቃለ-መጠይቅ ድጋፍ ጠይቅ" የሚለውን በመጫን ማመልከት ይችላሉ።',
          citations: [],
          source: 'offline_faq',
        };
      }
      return {
        answer: 'You can request interview accommodations including an Amharic translator, extended pacing, or phone-based interviews using our Career Gateway modal.',
        citations: [],
        source: 'offline_faq',
      };
    }

    // Default Job Response
    if (language === 'am') {
      return {
        answer: simpleMode
          ? `ይህ ስራ ${context.jobTitle || 'የሶፍትዌር ሰሪ'} የስራ መደብ ነው። በድርጅቱ ውስጥ የድረ-ገጾችን እና የቴክኖሎጂ አሰራሮችን ማበልጸግ ነው።`
          : `ይህ የስራ ማስታወቂያ ለ${context.jobTitle || 'Junior Python Developer'} ነው። ዋና ተግባራቱ በ${context.company || 'ኩባንያው'} ውስጥ የሶፍትዌር ስርዓቶችን ማጎልበት እና የውሂብ አስተዳደርን ማከናወን ነው።`,
        citations: [{ id: 'c-job-desc', title: 'Job Overview', section: 'Responsibilities', snippet: context.visibleContent.slice(0, 140) }],
        source: 'offline_faq',
      };
    }

    return {
      answer: simpleMode
        ? `This job is for a ${context.jobTitle || 'Junior Developer'}. You will build and test web tools using Python and React.`
        : `This role is ${context.jobTitle || 'Junior Python Developer'} at ${context.company || 'Partner Company'}. Key duties include creating backend APIs and collaborating on frontend integration.`,
      citations: [{ id: 'c-job-desc', title: 'Job Overview', section: 'Responsibilities', snippet: context.visibleContent.slice(0, 140) }],
      source: 'offline_faq',
    };
  }

  // --- COURSE TUTOR MODE (Savanna) ---
  // Query matches Section 2: General vs Specialized VA
  if (q.includes('section 2') || q.includes('distinction') || q.includes('specializ') || q.includes('ልዩነት')) {
    if (language === 'am') {
      return {
        answer: simpleMode
          ? 'በትምህርቱ ክፍል 2 መሰረት፣ አጠቃላይ ረዳት (General VA) የቀን መቁጠሪያ ማስተካከልና ኢሜይል መመለስን የመሳሰሉ መደበኛ ስራዎችን ይሰራል። ልዩ ረዳት (Specialized VA) ግን ከፍተኛ የቴክኖሎጂ አሰራርንና የንግድ አስተዳደርን በጥልቀት ያከናውናል።'
          : 'በትምህርቱ ክፍል 2 ("An Important Distinction") መሰረት፣ በጠቅላላ እና በልዩ ምናባዊ ረዳት መካከል ያለው መለያየት የስራው ስፋት እና የክህሎት ጥልቀት ነው። ጠቅላላ ረዳቶች መደበኛ የቢሮ ድጋፍ ሲሰጡ፣ ልዩ ረዳቶች ደግሞ በስራ አስፈጻሚ አውቶሜሽን እና በደንበኞች ውሂብ ትንተና ላይ ያተኩራሉ።',
        citations: [
          {
            id: 'c-1',
            title: 'Section 2: An Important Distinction',
            section: 'General vs Specialized Virtual Assistants',
            snippet: 'While General Virtual Assistants handle broad administrative, scheduling, and email triage workloads, Specialized Virtual Assistants focus on domain niches...',
            pageNumber: '2',
            targetSelector: '#what-is-shaping-the-future-of-va-work',
          },
        ],
        source: 'offline_faq',
      };
    }

    return {
      answer: simpleMode
        ? 'According to Section 2 of this lesson, a General Virtual Assistant takes care of everyday tasks like calendar management and emails. A Specialized VA focuses on deeper skills like executive automation and analytics.'
        : 'According to the lesson, the core separation comes down to scope, domain ownership, and hourly value. General VAs handle broad administrative tasks, calendar curation, and inbox management, whereas Specialized VAs focus on executive automation, data analysis, and domain-specific operations.',
      citations: [
        {
          id: 'c-1',
          title: 'Section 2: An Important Distinction',
          section: 'General Track vs Specialized Track',
          snippet: 'While General Virtual Assistants handle broad administrative, scheduling, and email triage workloads, Specialized Virtual Assistants focus on domain niches such as Executive Operations...',
          pageNumber: '2',
          targetSelector: '#what-is-shaping-the-future-of-va-work',
        },
      ],
      source: 'offline_faq',
    };
  }

  // General Explanation of Lesson
  if (q.includes('explain') || q.includes('summar') || q.includes('አስረዳ') || q.includes('አጠቃልል')) {
    if (language === 'am') {
      return {
        answer: simpleMode
          ? 'ይህ ትምህርት "The Future of the VA Industry" ይባላል። ትምህርቱ እንደሚያሳየው፣ ቴክኖሎጂና አርቴፊሻል ኢንተለጀንስ የረዳቶችን ስራ አያጠፉም፤ ይልቁንም ረዳቶች በቴክኖሎጂ ታግዘው የተሻለ ስራ እንዲሰሩ ያግዛሉ።'
          : 'ትምህርቱ "The Future of the VA Industry" የርቀት ስራ እድገትን እና የሰው ባለሙያዎች ከአርቴፊሻል ኢንተለጀንስ (AI) ጋር ተቀናጅተው የሚሰሩበትን መንገድ ያብራራል። አዳዲስ ቴክኖሎጂዎች የድጋፍ ስራዎች እንዴት እንደሚከናወኑ እና ደንበኞች በዋናነት ምን እንደሚፈልጉ እየቀየሩ ነው።',
        citations: [
          {
            id: 'c-overview',
            title: 'Overview',
            section: 'The Future of the VA Industry',
            snippet: 'The Virtual Assistant profession is not shrinking. It is evolving. As businesses become more digital...',
            pageNumber: '1',
          },
        ],
        source: 'offline_faq',
      };
    }

    return {
      answer: simpleMode
        ? 'This lesson is called "The Future of the VA Industry". It explains that remote virtual assistance is growing, and learning to work with AI will make you much more valuable to clients.'
        : 'This lesson covers the rapid evolution of remote assistance. As businesses digitize, the demand for support professionals continues to expand. AI is not replacing assistants—it is reshaping how they deliver high-value support.',
      citations: [
        {
          id: 'c-overview',
          title: 'Lesson Overview',
          section: 'The Virtual Assistant profession is not shrinking. It is evolving.',
          snippet: 'As businesses become more digital, more global, and more comfortable with remote collaboration, the need for skilled support professionals continues to grow.',
          pageNumber: '1',
        },
      ],
      source: 'offline_faq',
    };
  }

  // Default Course Tutor Response
  if (language === 'am') {
    return {
      answer: simpleMode
        ? `በትምህርቱ ገጽ "${context.title}" መሰረት፣ ዋናው ሃሳብ በክህሎት ማደግና ለደንበኞች ጠቃሚ እሴት መስጠት ነው።`
        : `በዚህ ትምህርት ገጽ ላይ በተመለከተው መሰረት፡ "${context.visibleContent.slice(0, 200)}..." ለተጨማሪ ዝርዝር የትኛውን ክፍል ማብራራት እንዳለብኝ ይጠይቁኝ።`,
      citations: [
        {
          id: 'c-default',
          title: context.title,
          section: context.headings[0] || 'Core Concept',
          snippet: context.visibleContent.slice(0, 160),
        },
      ],
      source: 'offline_faq',
    };
  }

  return {
    answer: simpleMode
      ? `Based on the lesson "${context.title}", the main point is growing your practical skills and understanding what clients need most.`
      : `Based on "${context.title}", the content highlights: ${context.visibleContent.slice(0, 220)}... Feel free to ask about any specific section!`,
    citations: [
      {
        id: 'c-default',
        title: context.title,
        section: context.headings[0] || 'Core Section',
        snippet: context.visibleContent.slice(0, 160),
      },
    ],
    source: 'offline_faq',
  };
}
