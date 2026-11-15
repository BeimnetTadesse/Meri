import { createRoot } from 'react-dom/client';
import { Widget } from './components/Widget';
import { fetchPlatformConfig, applyThemeVariables, DEFAULT_CONFIG } from './core/configuration';
import widgetCss from './styles/widget.css?inline';

async function initMeri() {
  if (document.getElementById('meri-plugin-root')) {
    return; // Already initialized
  }

  // Ensure body is ready
  if (!document.body) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initMeri());
    } else {
      setTimeout(initMeri, 30);
    }
    return;
  }

  // Find host script tag or global config
  const scripts = Array.from(document.querySelectorAll('script'));
  const targetScript =
    document.querySelector('script[data-public-key]') ||
    scripts.find((s) => s.src && s.src.includes('meri.js'));
  const publicKey =
    targetScript?.getAttribute('data-public-key') ||
    (window as unknown as { __MERI_CONFIG__?: { publicKey?: string } }).__MERI_CONFIG__?.publicKey ||
    'pk_live_savanna_sample_12345';

  // 1. Create host element
  const host = document.createElement('div');
  host.id = 'meri-plugin-root';
  host.style.position = 'relative';
  host.style.zIndex = '999999';
  document.body.appendChild(host);

  // 2. Attach Shadow DOM for style isolation from host website
  const shadowRoot = host.attachShadow({ mode: 'open' });

  // 3. Inject compiled CSS
  const styleEl = document.createElement('style');
  styleEl.textContent = widgetCss;
  shadowRoot.appendChild(styleEl);

  // 4. Mount React application inside Shadow DOM IMMEDIATELY with defaults (0ms UI lag)
  let currentConfig = DEFAULT_CONFIG;
  const mountPoint = document.createElement('div');
  mountPoint.id = 'meri-app-container';
  applyThemeVariables(host, currentConfig);
  applyThemeVariables(mountPoint, currentConfig);
  shadowRoot.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  root.render(<Widget config={currentConfig} publicKey={publicKey} shadowRoot={shadowRoot} />);

  // 5. In parallel / background, fetch dynamic platform configuration from backend
  fetchPlatformConfig(publicKey)
    .then((freshConfig) => {
      currentConfig = freshConfig;
      applyThemeVariables(host, freshConfig);
      applyThemeVariables(mountPoint, freshConfig);
      root.render(<Widget config={freshConfig} publicKey={publicKey} shadowRoot={shadowRoot} />);
      window.dispatchEvent(new CustomEvent('meri:config-updated', { detail: freshConfig }));
    })
    .catch((err) => {
      console.warn('[Meri] Dynamic config notice:', err);
    });

  // 6. Live Auto-Sync: Re-fetch configuration on window focus and periodic interval
  const syncConfig = async () => {
    try {
      const freshConfig = await fetchPlatformConfig(publicKey);
      currentConfig = freshConfig;
      applyThemeVariables(host, freshConfig);
      applyThemeVariables(mountPoint, freshConfig);
      window.dispatchEvent(new CustomEvent('meri:config-updated', { detail: freshConfig }));
    } catch {
      // Ignore background sync errors
    }
  };

  window.addEventListener('focus', syncConfig);
  setInterval(syncConfig, 15000);

  console.log('[Meri] Assistant successfully initialized on host website with key:', publicKey);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMeri);
} else {
  initMeri();
}
