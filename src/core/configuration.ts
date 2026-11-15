import { PlatformConfig } from '../types';

export const DEFAULT_CONFIG: PlatformConfig = {
  platform_name: 'Savanna',
  theme: {
    primary: '#16A34A',
    primaryHover: '#15803D',
    secondary: '#14532D',
    background: '#FFFFFF',
    text: '#0F172A',
    chat_button: '#16A34A',
  },
  branding: {
    assistant_name: 'Meri (መሪ)',
    subtitle: 'AI Guide • አስጠኚ',
  },
  welcome_message: 'Welcome to Savanna! How can I assist your studies or career today?',
  language: 'en',
  position: 'bottom-right',
  features: {
    voice: true,
    human_support: true,
    simple_mode: true,
    job_assistance: true,
    low_bandwidth: true,
    course_assistant: true,
  },
};

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';

  // 1. Explicit data-api-base on script tag or global window variable
  const script =
    document.querySelector('script[data-api-base]') ||
    document.querySelector('script[data-public-key]');
  const customBase =
    script?.getAttribute('data-api-base') ||
    (window as unknown as { __MERI_API_BASE__?: string }).__MERI_API_BASE__;
  if (customBase) return customBase.replace(/\/+$/, '');

  // 2. Build-time Vite environment variable (e.g. VITE_API_BASE_URL on Vercel)
  const envBase = (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } })?.env?.VITE_API_BASE_URL;
  if (envBase) return envBase.replace(/\/+$/, '');

  // 3. Localhost fallback
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }

  return '';
}

export async function fetchPlatformConfig(publicKey?: string): Promise<PlatformConfig> {
  if (!publicKey || publicKey === 'LOCAL_DEV') {
    return DEFAULT_CONFIG;
  }

  const apiBase = getApiBaseUrl();
  const url = `${apiBase}/api/v1/plugin/config/${encodeURIComponent(publicKey)}`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        ...DEFAULT_CONFIG,
        platform_name: data.platform_name || DEFAULT_CONFIG.platform_name,
        theme: {
          ...DEFAULT_CONFIG.theme,
          ...(data.theme || {}),
          primaryHover: data.theme?.primaryHover || data.theme?.primary || DEFAULT_CONFIG.theme.primaryHover,
          chat_button: data.theme?.chat_button || data.theme?.primary || DEFAULT_CONFIG.theme.chat_button,
        },
        branding: {
          ...DEFAULT_CONFIG.branding,
          ...(data.branding || {}),
          assistant_name: data.branding?.assistant_name || `${data.platform_name || DEFAULT_CONFIG.platform_name} Assistant`,
        },
        welcome_message: data.welcome_message || DEFAULT_CONFIG.welcome_message,
        language: data.language || DEFAULT_CONFIG.language,
        position: data.position || DEFAULT_CONFIG.position,
        size: data.size || DEFAULT_CONFIG.size,
        features: {
          ...DEFAULT_CONFIG.features,
          ...(data.features || {}),
        },
      };
    }
  } catch (err) {
    console.warn('[Meri] Using fallback default configuration:', err);
  }

  return DEFAULT_CONFIG;
}

export function applyThemeVariables(element: HTMLElement, config: PlatformConfig) {
  const primary = config.theme.primary || '#16A34A';
  const primaryHover = config.theme.primaryHover || primary;
  const secondary = config.theme.secondary || '#14532D';
  const bg = config.theme.background || '#FFFFFF';
  const text = config.theme.text || '#0F172A';
  const chatBtn = config.theme.chat_button || primary;

  element.style.setProperty('--meri-primary', primary);
  element.style.setProperty('--meri-primary-hover', primaryHover);
  element.style.setProperty('--meri-secondary', secondary);
  element.style.setProperty('--meri-bg', bg);
  element.style.setProperty('--meri-text', text);
  element.style.setProperty('--meri-chat-button', chatBtn);
  element.style.setProperty('--meri-chat-btn', chatBtn);
  element.style.setProperty('--meri-accent', primary);
}
