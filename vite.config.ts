import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// For GitHub Pages, set base to '/<repo-name>/'
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    watch: {
      ignored: ['**/*.pdf', '**/*.zip', '**/pictures/**', '**/public/**', '**/dist/**'],
    },
  },
});
