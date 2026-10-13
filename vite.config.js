import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Konfigurasi standar yang kompatibel dengan Vercel (framework preset: Vite, output: dist).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1400, // chunk 3D (three.js) memang besar, tetapi dimuat lazy.
  },
});
