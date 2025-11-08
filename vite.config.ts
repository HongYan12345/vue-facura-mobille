import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { rmSync } from 'node:fs';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isServe = command === 'serve';
  const isBuild = command === 'build';

  rmSync('dist-electron', { recursive: true, force: true });

  return {
    plugins: [
      vue(),
      electron([
        {
          entry: 'electron/main/index.ts',
          onstart: isServe ? (options) => options.startup() : undefined,
          vite: {
            build: {
              minify: isBuild,
              outDir: 'dist-electron/main',
            },
          },
        },
        {
          entry: 'electron/preload/index.ts',
          onstart: isServe ? (options) => options.reload() : undefined,
          vite: {
            build: {
              minify: isBuild,
              outDir: 'dist-electron/preload',
            },
          },
        },
      ]),
      renderer(),
    ],
    base: './',
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
  };
});
