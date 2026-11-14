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

export async function fetchPlatformConfig(publicKey?: string): Promise<PlatformConfig> {
  if (!publicKey || publicKey === 'LOCAL_DEV' || publicKey === 'savanna-dev-01') {
    return DEFAULT_CONFIG;
  }

  try {
    const res = await fetch(`/api/v1/platforms/config?key=${encodeURIComponent(publicKey)}`);
    if (res.ok) {
      const data = await res.json();
      return { ...DEFAULT_CONFIG, ...data };
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
