import { PlatformConfig } from '../types';

export const DEFAULT_CONFIG: PlatformConfig = {
  platform_name: 'Savanna',
  theme: {
    primary: '#16A34A',
    primaryHover: '#15803D',
    secondary: '#14532D',
    background: '#FFFFFF',
    text: '#0F172A',
  },
  branding: {
    assistant_name: 'Meri (መሪ)',
    subtitle: 'AI Guide • አስጠኚ',
  },
  language: 'en',
  position: 'bottom-right',
  features: {
    voice: true,
    human_support: true,
    simple_mode: true,
    job_assistance: true,
    low_bandwidth: true,
  },
};

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const script =
    document.querySelector('script[data-api-base]') ||
    document.querySelector('script[data-public-key]');
  const customBase =
    script?.getAttribute('data-api-base') || (window as unknown as { __MERI_API_BASE__?: string }).__MERI_API_BASE__;
  if (customBase) return customBase.replace(/\/+$/, '');
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
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      return {
        ...DEFAULT_CONFIG,
        platform_name: data.platform_name || DEFAULT_CONFIG.platform_name,
        theme: {
          ...DEFAULT_CONFIG.theme,
          ...(data.theme || {}),
        },
        branding: {
          ...DEFAULT_CONFIG.branding,
          ...(data.branding || {}),
        },
        language: data.language || DEFAULT_CONFIG.language,
        position: data.position || DEFAULT_CONFIG.position,
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
  element.style.setProperty('--meri-primary', config.theme.primary);
  element.style.setProperty('--meri-primary-hover', config.theme.primaryHover);
  element.style.setProperty('--meri-secondary', config.theme.secondary);
  element.style.setProperty('--meri-bg', config.theme.background);
  element.style.setProperty('--meri-text', config.theme.text);
}
