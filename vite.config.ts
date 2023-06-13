import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base : './',
  build: {
    outDir: 'dist',
    assetsDir: '',
    rollupOptions: {
      output: {
        entryFileNames: (assetInfo) => {
          if (assetInfo.type === 'chunk') {
            return 'js/[name].[hash].js';
          }
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'css/[name].[hash].css';
          }
          if (assetInfo.name && assetInfo.name.startsWith('img/')) {
            return '[name].[hash].[ext]';
          }
          return '[name].[hash].[ext]';
        },
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'css/[name].[hash][extname]';
          }
          if (assetInfo.name && assetInfo.name.endsWith('.png')) {
            return 'img/[name].[hash][extname]';
          }
          if (assetInfo.name && assetInfo.name.endsWith('.ico')) {
            return 'unpackage/[name].[hash][extname]';
          }
          return '[name].[hash][extname]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
