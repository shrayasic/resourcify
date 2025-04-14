import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'; // Official Vite plugin

export default defineConfig({
  plugins: [tailwindcss()],
});
