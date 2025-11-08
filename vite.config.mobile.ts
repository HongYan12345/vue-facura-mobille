import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    proxy: {
      '/identitytoolkit': 'https://www.googleapis.com',
      '/v1': 'https://identitytoolkit.googleapis.com',
    },
  },
  build: {
    outDir: 'dist-mobile',
    assetsDir: '',
    rollupOptions: {
      output: {
        entryFileNames: (assetInfo) => {
          if (assetInfo.type === 'chunk') {
            return 'js/[name].[hash].js'
          }
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'css/[name].[hash].css'
          }
          if (assetInfo.name && assetInfo.name.startsWith('img/')) {
            return 'img/[name].[hash].[ext]'
          }
          return '[name].[hash].[ext]'
        },
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'css/[name].[hash][extname]'
          }
          if (assetInfo.name && assetInfo.name.endsWith('.png')) {
            return 'img/[name].[hash][extname]'
          }
          if (assetInfo.name && assetInfo.name.endsWith('.ico')) {
            return 'unpackage/[name].[hash][extname]'
          }
          return '[name].[hash][extname]'
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: false,
    manifest: false,
    lib: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})