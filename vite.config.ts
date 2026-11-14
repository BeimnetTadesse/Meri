import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isLibrary = mode === 'production' || process.env.BUILD_LIB === 'true';

  return {
    plugins: [react()],
    build: isLibrary
      ? {
          lib: {
            entry: resolve(__dirname, 'src/main.tsx'),
            name: 'Meri',
            fileName: () => 'meri.js',
            formats: ['iife'],
          },
          outDir: 'dist',
          emptyOutDir: true,
          rollupOptions: {
            // Self-contained standalone distribution
          },
        }
      : {
          outDir: 'dist-dev',
        },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },
  };
});
