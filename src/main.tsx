import { createRoot } from 'react-dom/client';
import { Widget } from './components/Widget';
import { fetchPlatformConfig, applyThemeVariables } from './core/configuration';
import widgetCss from './styles/widget.css?inline';

async function initMeri() {
  if (document.getElementById('meri-plugin-root')) {
    return; // Already initialized
  }

  // Find host script tag
  const scripts = Array.from(document.querySelectorAll('script'));
  const targetScript = scripts.find((s) => s.src.includes('meri.js') || s.hasAttribute('data-public-key'));
  const publicKey = targetScript?.getAttribute('data-public-key') || 'pk_live_savanna_sample_12345';

  // 1. Create host element
  const host = document.createElement('div');
  host.id = 'meri-plugin-root';
  document.body.appendChild(host);

  // 2. Attach Shadow DOM for style isolation from host website
  const shadowRoot = host.attachShadow({ mode: 'open' });

  // 3. Inject compiled CSS
  const styleEl = document.createElement('style');
  styleEl.textContent = widgetCss;
  shadowRoot.appendChild(styleEl);

  // 4. Fetch dynamic configuration
  let currentConfig = await fetchPlatformConfig(publicKey);
  applyThemeVariables(host, currentConfig);

  // 5. Mount React application inside Shadow DOM
  const mountPoint = document.createElement('div');
  mountPoint.id = 'meri-app-container';
  applyThemeVariables(mountPoint, currentConfig);
  shadowRoot.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  root.render(<Widget config={currentConfig} publicKey={publicKey} shadowRoot={shadowRoot} />);

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
  setInterval(syncConfig, 10000);

  console.log('[Meri] Assistant successfully initialized on host website with key:', publicKey);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMeri);
} else {
  initMeri();
}
