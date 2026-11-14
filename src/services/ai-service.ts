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

  // ==========================================
  // --- 1. CAREER COACH MODE (Job Portal) ---
  // ==========================================
  if (mode === 'career_coach') {
    // Qualifications match
    if (q.includes('qualif') || q.includes('ብቁ') || q.includes('match') || q.includes('skill')) {
      const skillsStr = (context.skills || ['Python', 'Django', 'React']).join(', ');
      if (language === 'am') {
        return {
          answer: simpleMode
            ? `ለዚህ "${context.jobTitle}" ስራ ${skillsStr} ያስፈልጋሉ። እነዚህን በአልኤክስ (ALX) ተምረዋቸዋል፣ ስለዚህ ጥሩ ብቃት አለዎት! ፕሮጀክት ሰርተው ፖርትፎሊዮዎን ቢያሳዩ ይመረጣል።`
            : `በገጹ ላይ ባለው ዝርዝር መሰረት ለ${context.jobTitle} የሚያስፈልጉት ክህሎቶች፡ ${skillsStr} ናቸው። እነዚህ በALX የትምህርት ካሪኩለም ውስጥ የተካተቱ በመሆናቸው ለስራው ተመጣጣኝ ብቃት አለዎት።`,
          citations: [
            {
              id: 'c-job-1',
              title: `${context.jobTitle} Requirements`,
              section: `Required Competencies: ${skillsStr}`,
              snippet: context.visibleContent.slice(0, 160),
            },
          ],
          source: 'offline_faq',
        };
      }
      return {
        answer: simpleMode
          ? `You have a strong match for this ${context.jobTitle} position! The role requires ${skillsStr}. You practiced these at ALX. Highlight your capstone project when applying!`
          : `Based on the job posting, the core competencies are: ${skillsStr}. Your ALX curriculum directly maps to these requirements.`,
        citations: [
          {
            id: 'c-job-1',
            title: `${context.jobTitle} Requirements`,
            section: `Required Competencies: ${skillsStr}`,
            snippet: context.visibleContent.slice(0, 160),
          },
        ],
        source: 'offline_faq',
      };
    }

    // Interview Accommodations
    if (q.includes('accommodat') || q.includes('ድጋፍ') || q.includes('help') || q.includes('request')) {
      if (language === 'am') {
        return {
          answer: 'ለዚህ ስራ ቃለ-መጠይቅ የአማርኛ አስተርጓሚ፣ ተጨማሪ የ50% ጊዜ ወይም በስልክ ብቻ የሚደረግ ቃለ-መጠይቅ መጠየቅ ይችላሉ። ከታች ያለውን "የቃለ መጠይቅ ድጋፍ ጠይቅ" የሚለውን ቁልፍ ይጫኑ።',
          citations: [
            {
              id: 'c-job-acc',
              title: 'Inclusive Employer Commitment',
              section: 'Interview Accommodations',
              snippet: 'Accommodations are supported: Amharic translation, extended assessment time, or low-bandwidth audio interviews.',
            },
          ],
          source: 'offline_faq',
        };
      }
      return {
        answer: 'You can request interview accommodations including an Amharic translator, 50% extra assessment time, or a phone-only interview. Click "Request accommodations" to submit your request.',
        citations: [
          {
            id: 'c-job-acc',
            title: 'Inclusive Employer Commitment',
            section: 'Interview Accommodations',
            snippet: 'Accommodations are supported: Amharic translation, extended assessment time, or low-bandwidth audio interviews.',
          },
        ],
        source: 'offline_faq',
      };
    }

    // Mock Interview
    if (q.includes('interview') || q.includes('ቃለ መጠይቅ') || q.includes('mock')) {
      if (language === 'am') {
        return {
          answer: `ለ${context.jobTitle} ቃለ መጠይቅ ዝግጁ ነዎት? የመጀመሪያው ጥያቄ፡ "በPython እና React የሰሩትን አንድ ትልቅ ፕሮጀክት እና ያጋጠመዎትን ፈተና እንዴት እንደፈቱ ያስረዱ?" ምላሽዎን በድምጽ ወይም በጽሁፍ ይንገሩኝ።`,
          citations: [],
          source: 'offline_faq',
        };
      }
      return {
        answer: `Let's start your mock interview for ${context.jobTitle}! Question 1: "Can you describe a challenging bug you encountered while building a REST API or React component, and how you resolved it?"`,
        citations: [],
        source: 'offline_faq',
      };
    }

    // Default Job Response
    if (language === 'am') {
      return {
        answer: simpleMode
          ? `ይህ የስራ እድል ለ"${context.jobTitle}" ነው። በኩባንያው ውስጥ የድረ-ገጽ ወይም የሶፍትዌር ስርዓቶችን ማበልጸግ እና ማስተዳደር ነው።`
          : `ይህ የስራ ማስታወቂያ ለ${context.jobTitle} በ${context.company || 'አጋር ድርጅት'} ውስጥ ነው። ዋና አላማው በዘመናዊ ቴክኖሎጂዎች የቢዝነስ እና የሶፍትዌር ስራዎችን ማሳለጥ ነው።`,
        citations: [{ id: 'c-job-desc', title: context.jobTitle || 'Job Overview', section: 'Responsibilities', snippet: context.visibleContent.slice(0, 160) }],
        source: 'offline_faq',
      };
    }

    return {
      answer: simpleMode
        ? `This job is for a ${context.jobTitle}. You will build and test digital services with team members across Africa.`
        : `This role is ${context.jobTitle} at ${context.company || 'Partner Company'}. Key duties include implementing reliable features and collaborating with cross-functional teams.`,
      citations: [{ id: 'c-job-desc', title: context.jobTitle || 'Job Overview', section: 'Core Responsibilities', snippet: context.visibleContent.slice(0, 160) }],
      source: 'offline_faq',
    };
  }

  // ==========================================
  // --- 2. COURSE TUTOR MODE (Savanna) ---
  // ==========================================

  // A. Paced Homepage (Björn Sibanda, WR 100, Week 10)
  if (context.url.includes('paced') && !context.url.includes('self-paced')) {
    if (q.includes('deliverable') || q.includes('due') || q.includes('ስራዎች') || q.includes('ቀነ ገደብ')) {
      if (language === 'am') {
        return {
          answer: 'ለሳምንት 10 የWR 100 ትምህርት፡ አሁን የሚጠበቅብዎት የስራ ባልደረባ ግምገማ (Peer Review Discussion) እና የጽሁፍ ማጠቃለያ (Written Reflection) ናቸው። የሳምንቱ ማጠናቀቂያ ቀን ከመድረሱ በፊት ቢያስገቡ ይመረጣል።',
          citations: [
            {
              id: 'c-paced-1',
              title: 'Week 10 Deliverables',
              section: 'Immediate Deliverables',
              snippet: 'Peer review discussion and written reflection due for Week 10 of 15.',
            },
          ],
          source: 'offline_faq',
        };
      }
      return {
        answer: 'For Week 10 of WR 100, your immediate deliverables are the Peer Review Discussion and the Written Reflection. Submit them before the week period closes!',
        citations: [
          {
            id: 'c-paced-1',
            title: 'Week 10 Deliverables',
            section: 'Immediate Deliverables',
            snippet: 'Peer review discussion and written reflection due for Week 10 of 15.',
          },
        ],
        source: 'offline_faq',
      };
    }

    if (q.includes('score') || q.includes('progress') || q.includes('ውጤት')) {
      if (language === 'am') {
        return {
          answer: 'አሁን ያለዎት አጠቃላይ ውጤት 59.56% ነው። በሳምንት 10 ላይ በመሆናችሁ ሳምንታዊ ስራዎችን በሰአቱ በማስረከብ ውጤትዎን ወደ 70%+ የማለፊያ ነጥብ ማሳደግ ይችላሉ።',
          citations: [{ id: 'c-score', title: 'Period Progress', section: 'Overall Score: 59.56%', snippet: 'Current course score slightly behind target.' }],
          source: 'offline_faq',
        };
      }
      return {
        answer: 'Your overall score is currently 59.56% ("slightly behind"). Submitting the remaining deliverables for Weeks 10 through 15 will comfortably bring you above the graduation threshold.',
        citations: [{ id: 'c-score', title: 'Period Progress', section: 'Overall Score: 59.56%', snippet: 'Current course score slightly behind target.' }],
        source: 'offline_faq',
      };
    }
  }

  // B. Self-Paced Homepage (Amara Nwosu, VA-1)
  if (context.url.includes('self-paced')) {
    if (q.includes('progress') || q.includes('gauge') || q.includes('threshold') || q.includes('እድገት')) {
      if (language === 'am') {
        return {
          answer: 'እስካሁን ከ3ቱ ሞጁሎች 1ኛውን አጠናቀዋል (16% እድገት)። የማለፊያ ነጥቡ 70% ነው። የ11 ቀናት የፍጥነት ማበረታቻ (Pacing Boost) ስላለዎት ሞጁል 2ን አሁን መጀመር ይመረጣል።',
          citations: [{ id: 'c-self-1', title: 'Course Progression Gauge', section: '16% of 70% threshold', snippet: '1 of 3 modules complete, 11 days pacing boost remaining.' }],
          source: 'offline_faq',
        };
      }
      return {
        answer: 'You have completed Module 1 of 3 (16% progression towards the 70% graduation threshold). You have 11 days left on your pacing boost to tackle Module 2!',
        citations: [{ id: 'c-self-1', title: 'Course Progression Gauge', section: '16% of 70% threshold', snippet: '1 of 3 modules complete, 11 days pacing boost remaining.' }],
        source: 'offline_faq',
      };
    }
  }

  // C. Concept Page (The Future of the VA Industry)
  if (q.includes('section 2') || q.includes('distinction') || q.includes('specializ') || q.includes('ልዩነት')) {
    if (language === 'am') {
      return {
        answer: simpleMode
          ? 'በትምህርቱ ክፍል 2 መሰረት፣ አጠቃላይ ረዳት (General VA) እንደ ቀጠሮ ማስተካከልና ኢሜይል መመለስ ያሉ መደበኛ ስራዎችን ይሰራል። ልዩ ረዳት (Specialized VA) ግን ከፍተኛ የቴክኖሎጂ አውቶሜሽን እና የደንበኞች ውሂብ ትንተና ላይ ያተኩራል።'
          : 'በትምህርቱ ክፍል 2 ("An Important Distinction") መሰረት፣ በጠቅላላ እና በልዩ ምናባዊ ረዳት መካከል ያለው መለያየት የስራው ስፋት እና የክህሎት ጥልቀት ነው። ጠቅላላ ረዳቶች መደበኛ የቢሮ ድጋፍ ሲሰጡ፣ ልዩ ረዳቶች ደግሞ በስራ አስፈጻሚ አውቶሜሽን እና በደንበኞች ውሂብ ትንተና ላይ ያተኩራሉ።',
        citations: [
          {
            id: 'c-1',
            title: 'Section 2: An Important Distinction',
            section: 'General Track vs Specialized Track',
            snippet: 'While General Virtual Assistants handle broad administrative, scheduling, and email triage workloads, Specialized Virtual Assistants focus on domain niches...',
            pageNumber: '2',
            targetSelector: '#section-2-an-important-distinction',
          },
        ],
        source: 'offline_faq',
      };
    }

    return {
      answer: simpleMode
        ? 'According to Section 2, General Virtual Assistants manage everyday routine tasks like calendars and emails. Specialized Virtual Assistants focus on deeper skills like executive automation and analytics.'
        : 'According to the lesson, the core separation comes down to scope, domain ownership, and hourly value. General VAs handle broad administrative tasks, calendar curation, and inbox management, whereas Specialized VAs focus on executive automation, data analysis, and domain-specific operations.',
      citations: [
        {
          id: 'c-1',
          title: 'Section 2: An Important Distinction',
          section: 'General Track vs Specialized Track',
          snippet: 'While General Virtual Assistants handle broad administrative, scheduling, and email triage workloads, Specialized Virtual Assistants focus on domain niches such as Executive Operations...',
          pageNumber: '2',
          targetSelector: '#section-2-an-important-distinction',
        },
      ],
      source: 'offline_faq',
    };
  }

  // General Explanation
  if (q.includes('explain') || q.includes('summar') || q.includes('አስረዳ') || q.includes('አጠቃልል')) {
    if (language === 'am') {
      return {
        answer: simpleMode
          ? `ይህ ትምህርት "${context.title}" ይባላል። ዋናው ነጥብ አዳዲስ ቴክኖሎጂዎችንና ክህሎቶችን በመማር ለስራ ገበያው የተሻለ ዋጋ መስጠት ነው።`
          : `ትምህርቱ "${context.title}" የሚያስረዳው፡ ${context.visibleContent.slice(0, 220)}... ለተጨማሪ ጥያቄ ክፍል 2ን ወይም አስቸጋሪ ቃላትን ይጠይቁኝ።`,
        citations: [
          {
            id: 'c-overview',
            title: context.title,
            section: context.headings[0] || 'Core Section',
            snippet: context.visibleContent.slice(0, 160),
            pageNumber: '1',
          },
        ],
        source: 'offline_faq',
      };
    }

    return {
      answer: simpleMode
        ? `This content covers "${context.title}". The main takeaway is adapting to modern digital tools and delivering high-value support.`
        : `Based on "${context.title}": ${context.visibleContent.slice(0, 240)}... Ask me about any specific section or term!`,
      citations: [
        {
          id: 'c-overview',
          title: context.title,
          section: context.headings[0] || 'Core Section',
          snippet: context.visibleContent.slice(0, 160),
          pageNumber: '1',
        },
      ],
      source: 'offline_faq',
    };
  }

  // Default Course Response
  if (language === 'am') {
    return {
      answer: simpleMode
        ? `በትምህርቱ ገጽ "${context.title}" መሰረት፣ ዋናው ሃሳብ በክህሎት ማደግና የተሻለ ስራ መስራት ነው።`
        : `በዚህ ገጽ ላይ በተመለከተው መሰረት፡ "${context.visibleContent.slice(0, 180)}..." ምን ላብራራልዎት?`,
      citations: [
        {
          id: 'c-default',
          title: context.title,
          section: context.headings[0] || 'Core Section',
          snippet: context.visibleContent.slice(0, 140),
        },
      ],
      source: 'offline_faq',
    };
  }

  return {
    answer: simpleMode
      ? `Based on "${context.title}", the key focus is practical mastery and understanding core concepts.`
      : `Based on "${context.title}": ${context.visibleContent.slice(0, 200)}... Let me know which part you want to explore!`,
    citations: [
      {
        id: 'c-default',
        title: context.title,
        section: context.headings[0] || 'Core Section',
        snippet: context.visibleContent.slice(0, 140),
      },
    ],
    source: 'offline_faq',
  };
}
