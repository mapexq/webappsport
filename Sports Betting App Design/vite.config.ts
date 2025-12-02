
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'BETPRO - Sports Betting App',
        short_name: 'BETPRO',
        description: 'Лучшие бонусы, прогнозы и новости от топовых букмекеров',
        theme_color: '#4ade80',
        background_color: '#09090b',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'figma:asset/ffc9d3aade4326b0c8a2229ba78f563086f8b1d3.png': path.resolve(__dirname, './src/assets/ffc9d3aade4326b0c8a2229ba78f563086f8b1d3.png'),
        'figma:asset/ff03a49e58d99ea263b44492a657d8f8a102fd37.png': path.resolve(__dirname, './src/assets/ff03a49e58d99ea263b44492a657d8f8a102fd37.png'),
        'figma:asset/eadd68338a1836c8882d99a00020ab22178df278.png': path.resolve(__dirname, './src/assets/eadd68338a1836c8882d99a00020ab22178df278.png'),
        'figma:asset/d5f6e2a54d59fbdf604fa5f548a11e632a42d3bb.png': path.resolve(__dirname, './src/assets/d5f6e2a54d59fbdf604fa5f548a11e632a42d3bb.png'),
        'figma:asset/cd63b9d71bf80f99da220730e2da2673c51aca65.png': path.resolve(__dirname, './src/assets/cd63b9d71bf80f99da220730e2da2673c51aca65.png'),
        'figma:asset/876f925dde3fe8d16f1d2ea7730ecf71984ed308.png': path.resolve(__dirname, './src/assets/876f925dde3fe8d16f1d2ea7730ecf71984ed308.png'),
        'figma:asset/5a58907bd1c0a85a50111916d1b41e528bd68503.png': path.resolve(__dirname, './src/assets/5a58907bd1c0a85a50111916d1b41e528bd68503.png'),
        'figma:asset/3bc1eb74c46ec574d7315a990f6fceb4adc3890f.png': path.resolve(__dirname, './src/assets/3bc1eb74c46ec574d7315a990f6fceb4adc3890f.png'),
        'figma:asset/3b56f5d213635bf6ff3ccb28b441710973364831.png': path.resolve(__dirname, './src/assets/3b56f5d213635bf6ff3ccb28b441710973364831.png'),
        'figma:asset/2872bb2c2135d0987d3464fff4b02318446ae333.png': path.resolve(__dirname, './src/assets/2872bb2c2135d0987d3464fff4b02318446ae333.png'),
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  });