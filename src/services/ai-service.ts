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

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 15000) : null;

    console.log('[Meri] Sending message to backend:', `${apiBase}/api/v1/chat/messages`);
    const res = await fetch(`${apiBase}/api/v1/chat/messages`, {
      method: 'POST',
      headers,
      signal: controller?.signal,
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
    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      console.log('[Meri] Backend response received successfully. Provider:', data.provider_used);
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

      const responseText = data.response || data.answer || '';
      if (responseText.trim()) {
        return {
          answer: responseText,
          citations: mappedCitations,
          source: data.provider_used === 'gemini' || data.provider_used === 'groq' ? 'cloud' : 'offline_faq',
        };
      }
    } else {
      console.warn('[Meri] Backend returned non-200 status:', res.status);
    }
  } catch (err) {
    console.warn('[Meri] Backend fetch notice (using offline local knowledge):', err);
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
    const isAm = language === 'am';
    const isDeliverableQuery =
      q.includes('deliver') ||
      q.includes('assign') ||
      q.includes('graded') ||
      q.includes('due') ||
      q.includes('deadline') ||
      q.includes('task') ||
      q.includes('do') ||
      q.includes('ሥራ') ||
      q.includes('ተግባር') ||
      q.includes('ሳምንት') ||
      q.includes('week') ||
      q.includes('ምን');

    const isSummaryQuery =
      q.includes('summar') ||
      q.includes('explain') ||
      q.includes('what is') ||
      q.includes('about') ||
      q.includes('overview') ||
      q.includes('ማጠቃለያ') ||
      q.includes('አብራራ');

    // Extract lines that look like deliverables from visibleContent
    const lines = context.visibleContent.split('\n').map((l) => l.trim()).filter(Boolean);
    const delivLines = lines.filter(
      (l) =>
        l.includes('GRADED') ||
        l.includes('Intro to') ||
        l.includes('Deliverables') ||
        l.includes('writing clinic') ||
        l.includes('Peer Learning') ||
        l.startsWith('- ')
    );
    const delivText = delivLines.slice(0, 6).join('\n');

    if (isDeliverableQuery && delivText) {
      if (isAm) {
        return {
          answer: `በዚህ ሳምንት የሚጠበቁብዎት ዋና ዋና ተግባራትና ምደባዎች የሚከተሉት ናቸው፡\n\n${delivText}\n\nእባክዎን የተሰጡትን ስራዎች በተጠቀሰው የጊዜ ገደብ ውስጥ ያጠናቁ!`,
          citations: [
            {
              id: 'c-course-deliv',
              title: context.title || 'Course Dashboard',
              section: 'Immediate Deliverables',
              snippet: delivText.slice(0, 180),
            },
          ],
          source: 'offline_faq',
        };
      }
      return {
        answer: `Here are your key deliverables and tasks for **${context.courseName || 'this active section'}**:\n\n${delivText}\n\nPlease be sure to complete the graded components before the deadline!`,
        citations: [
          {
            id: 'c-course-deliv',
            title: context.title || 'Course Dashboard',
            section: 'Immediate Deliverables',
            snippet: delivText.slice(0, 180),
          },
        ],
        source: 'offline_faq',
      };
    }

    if (isSummaryQuery) {
      if (isAm) {
        return {
          answer: `ይህ ገጽ ለ**${context.courseName || 'ኮርሱ'}** የተዘጋጀ ንቁ የትምህርት ዳሽቦርድ ነው። በዚህ ሳምንት ዋና ዋና የትምህርት ርዕሶች እና የተገመገሙ ተግባራት ተዘርዝረዋል፡\n\n${delivText || context.visibleContent.slice(0, 200)}`,
          citations: [
            {
              id: 'c-course-sum',
              title: context.title || 'Course Dashboard',
              section: 'Section Overview',
              snippet: context.visibleContent.slice(0, 180),
            },
          ],
          source: 'offline_faq',
        };
      }
      return {
        answer: `**Overview of ${context.title || 'Current Section'}**:\n\nYou are on the active dashboard for **${context.courseName || 'your course'}**.\n\n${delivText ? `**Current Tasks & Deliverables:**\n${delivText}` : context.visibleContent.slice(0, 250)}`,
        citations: [
          {
            id: 'c-course-sum',
            title: context.title || 'Course Dashboard',
            section: 'Section Overview',
            snippet: context.visibleContent.slice(0, 180),
          },
        ],
        source: 'offline_faq',
      };
    }

    // Keyword matching fallback for any other course inquiry
    const queryWords = q.split(/\s+/).filter((w) => w.length > 3);
    const matched = lines.filter((l) => queryWords.some((w) => l.toLowerCase().includes(w)));
    if (matched.length > 0) {
      const snippet = matched.slice(0, 3).join('. ');
      return {
        answer: isAm
          ? `በገጹ ላይ ባለው መረጃ መሰረት፡ ${snippet}።`
          : `Based on your course page: ${snippet}.`,
        citations: [
          {
            id: 'c-course-match',
            title: context.title || 'Course Dashboard',
            section: 'Course Content',
            snippet: snippet.slice(0, 180),
          },
        ],
        source: 'offline_faq',
      };
    }

    // Default friendly response
    if (isAm) {
      return {
        answer: `በ${context.courseName || 'ኮርሱ'} ንቁ ገጽ ላይ ነዎት። ስለ ሳምንቱ ስራዎች፣ የቤት ስራዎች ወይም የትምህርት ርዕሶች መጠየቅ ይችላሉ።`,
        citations: [
          {
            id: 'c-course-def',
            title: context.title || 'Course Dashboard',
            section: 'General Info',
            snippet: context.visibleContent.slice(0, 150),
          },
        ],
        source: 'offline_faq',
      };
    }
    return {
      answer: `You are on the dashboard for **${context.courseName || 'your course'}**. You can ask about this week's assignments, deliverables, timelines, or course topics!`,
      citations: [
        {
          id: 'c-course-def',
          title: context.title || 'Course Dashboard',
          section: 'General Info',
          snippet: context.visibleContent.slice(0, 150),
        },
      ],
      source: 'offline_faq',
    };
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
