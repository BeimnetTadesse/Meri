import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, { recursive: true });
}

// Copy index.html to dist/index.html so Vercel can serve the sandbox & CDN documentation
if (fs.existsSync(path.join(root, 'index.html'))) {
  fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));
  console.log('✓ Copied index.html to dist/index.html for Vercel hosting');
}
