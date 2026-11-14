export type PageType = 'lesson' | 'course' | 'assignment' | 'job' | 'general';

export type Language = 'en' | 'am';

export type AssistantMode = 'course_tutor' | 'career_coach';

export interface Citation {
  id: string;
  title: string;
  section: string;
  snippet: string;
  pageNumber?: string | number;
  targetSelector?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  amharicText?: string;
  timestamp: string;
  syncSource?: string;
  citations?: Citation[];
  isAudioPlaying?: boolean;
}

export interface PageContext {
  pageType: PageType;
  url: string;
  title: string;
  courseName?: string;
  lessonName?: string;
  jobTitle?: string;
  company?: string;
  skills?: string[];
  headings: string[];
  visibleContent: string;
  estReadTime?: string;
}

export interface PlatformConfig {
  platform_name: string;
  theme: {
    primary: string;
    primaryHover: string;
    secondary: string;
    background: string;
    text: string;
  };
  branding: {
    logo_url?: string;
    assistant_name: string;
    subtitle: string;
  };
  language: Language;
  position: 'bottom-right' | 'bottom-left';
  features: {
    voice: boolean;
    human_support: boolean;
    simple_mode: boolean;
    job_assistance: boolean;
    low_bandwidth: boolean;
  };
}
