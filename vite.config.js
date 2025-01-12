import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures your project works with relative paths
  server: {
    open: true, // Opens the browser when the dev server starts
  },
});