// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
      plugins: [tailwindcss()],
      // vite.config.js



          server: {
              host: true,              // listen on all addresses, so phone can connect
              port: 4321,
              strictPort: true,        // avoid auto-changing ports
              allowedHosts: ['.loca.lt', '.ngrok-free.app'], // allow your tunnel domains
          }


  },

  integrations: [react()],
});