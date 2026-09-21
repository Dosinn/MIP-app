import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const springUrl = env.VITE_PROXY_SPRING_URL || env.VITE_SPRING_URL || 'http://localhost:8080';
  const fastapiUrl = env.VITE_PROXY_FASTAPI_URL || env.VITE_FASTAPI_URL || 'http://localhost:8000';

  return {

  server: {
    host: true,
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.trycloudflare.com'],
    proxy: {
      // FastAPI NLP & Similarity
      '^/(nlp|similarity|project)(/|$)': {
        target: fastapiUrl,
        changeOrigin: true,
      },
      // Spring Boot REST API
      '^/(auth|categories|files|lessons|notifications|projects|reviews|sections|teams|invites|users|actuator)(/|$)': {
        target: springUrl,
        changeOrigin: true,
      },
    },
  },


  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'MIP',
      short_name: 'MIP',
      description: 'mip',
      theme_color: '#1594C7',
      background_color: '#1594C7',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: '/pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      navigateFallback: '/index.html',
      navigateFallbackDenylist: [
        /^\/(auth|categories|files|lessons|notifications|projects|reviews|sections|teams|invites|users|actuator|nlp|similarity|project)(\/|$)/,
        /^\/up$/,
      ],
    },

    devOptions: {
      enabled: false,
    },
  })],
  };
});
