import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['images/*.jpg'],
      workbox: { globPatterns: ['**/*.{js,css,html,jpg,png,svg}'] },
      manifest: {
        name: 'G1 Guru',
        short_name: 'G1 Guru',
        description: 'Ontario G1 practice questions, mock exams and road sign quizzes.',
        theme_color: '#0b5fff',
        background_color: '#f4f6fb',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  test: { environment: 'node' },
})
