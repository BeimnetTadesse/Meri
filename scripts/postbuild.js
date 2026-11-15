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
  let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  // In production distribution on Vercel, replace the dev main.tsx reference with the compiled bundle
  html = html.replace(/src=["'](\/|\.\/)?src\/main\.tsx["']/g, 'src="./meri.js"');
  fs.writeFileSync(path.join(dist, 'index.html'), html, 'utf8');
  console.log('✓ Copied index.html to dist/index.html and updated script src to ./meri.js for Vercel hosting');
}
