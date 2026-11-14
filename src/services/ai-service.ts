import { Citation, Language, PageContext } from '../types';
import { getApiBaseUrl } from '../core/configuration';

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
  publicKey?: string
): Promise<AIResponse> {
  // 1. Try Cloud / Backend API if available
  try {
    const apiBase = getApiBaseUrl();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (publicKey) {
      headers['X-Public-Key'] = publicKey;
    }

    const res = await fetch(`${apiBase}/api/v1/chat/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: question,
        context: {
          page_type: context.pageType,
          url: context.url,
          title: context.title,
          content: context.visibleContent,
        },
        language,
        simple_mode: simpleMode,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const mappedCitations: Citation[] = (data.citations || []).map(
        (
          c: { title?: string; source_type?: string; snippet?: string; relevance_score?: number },
          idx: number
        ) => ({
          id: `cite-srv-${idx}-${Date.now()}`,
          title: c.title || 'Course Material',
          section: c.source_type || 'Lesson Reference',
          snippet: c.snippet || '',
          pageNumber: c.relevance_score ? `${Math.round(c.relevance_score * 100)}% Match` : undefined,
        })
      );

      return {
        answer: data.response || data.answer || '',
        citations: mappedCitations,
        source: data.provider_used === 'gemini' || data.provider_used === 'groq' ? 'cloud' : 'offline_faq',
      };
    }
  } catch {
    // Fall through to resilient local knowledge engine
  }

  // 2. Pluggable Offline / Local Knowledge Base Engine
  return generateKnowledgeBaseResponse(question, context, language, simpleMode);
}

function generateKnowledgeBaseResponse(
  query: string,
  context: PageContext,
  language: Language,
  simpleMode: boolean
): AIResponse {
  const q = query.toLowerCase();

  // ==========================================
  // --- 1. CAREER & APPLICATION CONTEXT ---
  // ==========================================
  if (context.pageType === 'job' || context.pageType === 'application') {
    // Qualifications match
    if (q.includes('qualif') || q.includes('ብቁ') || q.includes('match') || q.includes('skill')) {
      const skillsStr = (context.skills || ['Python', 'Django', 'React']).join(', ');
      if (language === 'am') {
        return {
          answer: simpleMode
            ? `ለዚህ "${context.jobTitle || 'ስራ'}" ${skillsStr} ያስፈልጋሉ። እነዚህን በአልኤክስ (ALX) ተምረዋቸዋል፣ ስለዚህ ጥሩ ብቃት አለዎት! ፕሮጀክት ሰርተው ፖርትፎሊዮዎን ቢያሳዩ ይመረጣል።`
            : `በገጹ ላይ ባለው ዝርዝር መሰረት ለ${context.jobTitle || 'ስራው'} የሚያስፈልጉት ክህሎቶች፡ ${skillsStr} ናቸው። እነዚህ በALX የትምህርት ካሪኩለም ውስጥ የተካተቱ በመሆናቸው ለስራው ተመጣጣኝ ብቃት አለዎት።`,
          citations: [
            {
              id: 'c-job-1',
              title: `${context.jobTitle || 'Job'} Requirements`,
              section: `Required Competencies: ${skillsStr}`,
              snippet: context.visibleContent.slice(0, 160),
            },
          ],
          source: 'offline_faq',
        };
      }
      return {
        answer: simpleMode
          ? `You have a strong match for this ${context.jobTitle || 'role'}! The position requires ${skillsStr}. You practiced these skills at ALX. Highlight your capstone project when applying!`
          : `Based on the job posting, the core competencies are: ${skillsStr}. Your ALX curriculum directly maps to these requirements.`,
        citations: [
          {
            id: 'c-job-1',
            title: `${context.jobTitle || 'Job'} Requirements`,
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
          answer:
            'ለዚህ ስራ ቃለ-መጠይቅ የአማርኛ አስተርጓሚ፣ ተጨማሪ የ50% ጊዜ ወይም በስልክ ብቻ የሚደረግ ቃለ-መጠይቅ መጠየቅ ይችላሉ። ከታች ያለውን "የቃለ መጠይቅ ድጋፍ ጠይቅ" የሚለውን ቁልፍ ይጫኑ።',
          citations: [
            {
              id: 'c-job-acc',
              title: 'Inclusive Employer Commitment',
              section: 'Interview Accommodations',
              snippet:
                'Accommodations are supported: Amharic translation, extended assessment time, or low-bandwidth audio interviews.',
            },
          ],
          source: 'offline_faq',
        };
      }
      return {
        answer:
          'You can request interview accommodations including an Amharic translator, 50% extra assessment time, or a phone-only interview. Click "Request accommodations" to submit your request.',
        citations: [
          {
            id: 'c-job-acc',
            title: 'Inclusive Employer Commitment',
            section: 'Interview Accommodations',
            snippet:
              'Accommodations are supported: Amharic translation, extended assessment time, or low-bandwidth audio interviews.',
          },
        ],
        source: 'offline_faq',
      };
    }

    // Mock Interview
    if (q.includes('interview') || q.includes('ቃለ መጠይቅ') || q.includes('mock')) {
      if (language === 'am') {
        return {
          answer: `ለ${context.jobTitle || 'ስራው'} ቃለ መጠይቅ ዝግጁ ነዎት? የመጀመሪያው ጥያቄ፡ "በዚህ መስክ የሰሩትን አንድ ትልቅ ፕሮጀክት እና ያጋጠመዎትን ፈተና እንዴት እንደፈቱ ያስረዱ?" ምላሽዎን በድምጽ ወይም በጽሁፍ ይንገሩኝ።`,
          citations: [],
          source: 'offline_faq',
        };
      }
      return {
        answer: `Let's start your mock interview for ${context.jobTitle || 'this role'}! Question 1: "Can you describe a challenging bug or requirement you encountered in your projects, and how you resolved it?"`,
        citations: [],
        source: 'offline_faq',
      };
    }

    // Default Job Response
    if (language === 'am') {
      return {
        answer: simpleMode
          ? `ይህ የስራ እድል ለ"${context.jobTitle || 'ቴክኖሎጂ'}" ነው። በኩባንያው ውስጥ የድረ-ገጽ ወይም የሶፍትዌር ስርዓቶችን ማበልጸግ እና ማስተዳደር ነው።`
          : `ይህ የስራ ማስታወቂያ ለ${context.jobTitle || 'የስራ መደብ'} በ${context.company || 'አጋር ድርጅት'} ውስጥ ነው። ዋና አላማው በዘመናዊ ቴክኖሎጂዎች የቢዝነስ እና የሶፍትዌር ስራዎችን ማሳለጥ ነው።`,
        citations: [
          {
            id: 'c-job-desc',
            title: context.jobTitle || 'Job Overview',
            section: 'Responsibilities',
            snippet: context.visibleContent.slice(0, 160),
          },
        ],
        source: 'offline_faq',
      };
    }

    return {
      answer: simpleMode
        ? `This job is for a ${context.jobTitle || 'Specialist'}. You will build and test digital services with team members across Africa.`
        : `This role is ${context.jobTitle || 'Role'} at ${context.company || 'Partner Company'}. Key duties include implementing reliable features and collaborating with cross-functional teams.`,
      citations: [
        {
          id: 'c-job-desc',
          title: context.jobTitle || 'Job Overview',
          section: 'Core Responsibilities',
          snippet: context.visibleContent.slice(0, 160),
        },
      ],
      source: 'offline_faq',
    };
  }

  // ==========================================
  // --- 2. ASSIGNMENT CONTEXT ---
  // ==========================================
  if (context.pageType === 'assignment') {
    if (language === 'am') {
      return {
        answer: simpleMode
          ? `በዚህ ምደባ ላይ ዋናው አላማ የተማሩትን በተግባር ማሳየት ነው። መስፈርቶቹን በጥንቃቄ አንብበው የተሰጡትን ፋይሎች በወቅቱ ያስረክቡ።`
          : `የዚህ የቤት ስራ/ፕሮጀክት መመሪያዎች በገጹ ላይ ተዘርዝረዋል። ዋና ዋና መስፈርቶቹን እና የውጤት መስጫ መስፈርቶችን አሟልተው ከማስረከቢያው ቀን በፊት ማጠናቀቅ ይኖርብዎታል።`,
        citations: [
          {
            id: 'c-assign-1',
            title: context.title || 'Assignment Details',
            section: 'Submission Requirements',
            snippet: context.visibleContent.slice(0, 160),
          },
        ],
        source: 'offline_faq',
      };
    }
    return {
      answer: simpleMode
        ? `For this assignment, your main goal is to put theory into practice. Follow the step-by-step instructions and test your deliverables before submitting.`
        : `This assignment outlines specific deliverables and grading criteria. Review each milestone carefully to ensure full rubric alignment before the deadline.`,
      citations: [
        {
          id: 'c-assign-1',
          title: context.title || 'Assignment Details',
          section: 'Submission Requirements',
          snippet: context.visibleContent.slice(0, 160),
        },
      ],
      source: 'offline_faq',
    };
  }

  // ==========================================
  // --- 3. COURSE DASHBOARDS ---
  // ==========================================
  if (context.pageType === 'course') {
    if (context.url.includes('paced') && !context.url.includes('self-paced')) {
      if (language === 'am') {
        return {
          answer: `በWR 100 ሳምንት 10 ላይ ነዎት። የውጤት ሁኔታዎ 59.56% ሲሆን፣ በዚህ ሳምንት የውይይት መድረክ እና የጽሁፍ ምልከታ ስራ ይጠበቅብዎታል።`,
          citations: [
            {
              id: 'c-wr100-deliv',
              title: 'WR 100 Dashboard',
              section: 'Immediate Deliverables',
              snippet: 'Peer review discussion and written reflection due Sunday midnight.',
            },
          ],
          source: 'offline_faq',
        };
      }
      return {
        answer: `You are on Week 10 of WR 100: Fundamentals of Effective Communication. Your current cohort progress is 59.56%. Immediate deliverables include your Peer Review Discussion and Written Reflection due this Sunday.`,
        citations: [
          {
            id: 'c-wr100-deliv',
            title: 'WR 100 Dashboard',
            section: 'Immediate Deliverables',
            snippet: 'Peer review discussion and written reflection due Sunday midnight.',
          },
        ],
        source: 'offline_faq',
      };
    } else {
      if (language === 'am') {
        return {
          answer: `በVA-1: Foundations ሞጁል 1ን አጠናቀዋል። አጠቃላይ እድገትዎ 16% ሲሆን፣ ቀጣዩ ደረጃ ሞጁል 2 (The Future of the VA Industry) ነው።`,
          citations: [
            {
              id: 'c-va1-dash',
              title: 'VA-1: Self-Paced Track',
              section: 'Course Progression Gauge',
              snippet: '16% toward 70% graduation threshold. Module 2 ready to launch.',
            },
          ],
          source: 'offline_faq',
        };
      }
      return {
        answer: `You are on VA-1: VA Foundations & Professional Identity. Module 1 is complete, placing you at 16% toward the 70% threshold. You are ready to start Module 2: The Future of the VA Industry.`,
        citations: [
          {
            id: 'c-va1-dash',
            title: 'VA-1: Self-Paced Track',
            section: 'Course Progression Gauge',
            snippet: '16% toward 70% graduation threshold. Module 2 ready to launch.',
          },
        ],
        source: 'offline_faq',
      };
    }
  }

  // ==========================================
  // --- 4. LESSON / CONCEPT CONTEXT ---
  // ==========================================
  if (q.includes('distinction') || q.includes('ልዩነት') || q.includes('specializ') || q.includes('general')) {
    if (language === 'am') {
      return {
        answer: simpleMode
          ? `ቀላል ምሳሌ፡ General VA እንደ ቤተሰብ ሀኪም ሁሉንም ትንሽ ትንሽ ያውቃል፤ Specialized VA ደግሞ እንደ የልብ ቀዶ-ጥገና ሀኪም በአንድ ነገር ላይ ብቻ በጣም የተካነ ነው። ልዩነታቸው ይሄ ነው!`
          : `በክፍል 2 ላይ እንደተገለጸው፡ General VA ሰፊ እና የተለያዩ የአስተዳደር ስራዎችን (ኢሜይል፣ የቀን መቁጠሪያ) ይሰራል፤ Specialized VA ግን በከፍተኛ የቴክኒክ ክህሎት (ዲጂታል ማርኬቲንግ፣ የሂሳብ አያያዝ፣ የድር ጣቢያ አስተዳደር) ላይ ያተኩራል።`,
        citations: [
          {
            id: 'c-lesson-dist',
            title: 'The Future of the VA Industry',
            section: 'Section 2: An Important Distinction',
            snippet:
              'A General VA handles broad administrative tasks, whereas a Specialized VA focuses on high-value niche skills like marketing or bookkeeping.',
          },
        ],
        source: 'offline_faq',
      };
    }
    return {
      answer: simpleMode
        ? `Think of it like a doctor: A General VA is like a family doctor who knows a bit of everything; a Specialized VA is like a heart surgeon who is an expert in one specific high-value area!`
        : `According to Section 2 of the lesson: A General VA handles broad routine administrative duties, whereas a Specialized VA brings deep technical expertise in niches like project management or automation.`,
      citations: [
        {
          id: 'c-lesson-dist',
          title: 'The Future of the VA Industry',
          section: 'Section 2: An Important Distinction',
          snippet:
            'A General VA handles broad administrative tasks, whereas a Specialized VA focuses on high-value niche skills like marketing or bookkeeping.',
        },
      ],
      source: 'offline_faq',
    };
  }

  // Default lesson explanation
  if (language === 'am') {
    return {
      answer: simpleMode
        ? `ይህ ትምህርት የቨርቹዋል ረዳት (VA) ስራ ወደፊት እንዴት እንደሚቀየር ያስረዳል። አርቴፊሻል ኢንተለጀንስ (AI) ቀላል ስራዎችን ሲሰራ፣ ሰዎች ደግሞ ውስብስብ በሆኑ ስራዎች ላይ ማተኮር አለባቸው።`
        : `ትምህርቱ የሚያተኩረው በVA ዘርፍ የወደፊት አቅጣጫዎች ላይ ነው። አውቶሜሽን እና AI ቀላል ስራዎችን ሲረከቡ፣ የሰው ልጆች ስልታዊ አስተሳሰብ እና የደንበኛ ግንኙነት ላይ ማተኮር ወሳኝ እንደሆነ ያስረዳል።`,
      citations: [
        {
          id: 'c-lesson-main',
          title: context.title || 'Course Lesson',
          section: 'Core Curriculum',
          snippet: context.visibleContent.slice(0, 160),
        },
      ],
      source: 'offline_faq',
    };
  }

  return {
    answer: simpleMode
      ? `This lesson explains how digital assistance is evolving. While AI takes over repetitive administrative tasks, human assistants who build specialized skills and emotional intelligence become much more valuable.`
      : `The lesson explores the evolution of the Virtual Assistant profession. As automation commoditizes routine tasks, specialization and high-leverage strategic skills define high-earning practitioners.`,
    citations: [
      {
        id: 'c-lesson-main',
        title: context.title || 'Course Lesson',
        section: 'Core Curriculum',
        snippet: context.visibleContent.slice(0, 160),
      },
    ],
    source: 'offline_faq',
  };
}
