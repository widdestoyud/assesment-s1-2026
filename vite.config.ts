import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import mkCert from 'vite-plugin-mkcert';
import { configDefaults } from 'vitest/config';

const viteConfig = ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, './src'),
        '@core': path.resolve(__dirname, './src/@core'),
        '@di': path.resolve(__dirname, './src/infrastructure/di'),
        '@controllers': path.resolve(__dirname, './src/controllers'),
        '@components': path.resolve(__dirname, './src/presentation/components'),
        '@pages': path.resolve(__dirname, './src/presentation/pages'),
        '@home': path.resolve(__dirname, './src/presentation/pages/(home)'),
        '@register': path.resolve(
          __dirname,
          './src/presentation/pages/(register)'
        ),
        '@status': path.resolve(__dirname, './src/presentation/pages/(status)'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@routes': path.resolve(__dirname, './src/routes'),
        '@images': path.resolve(__dirname, './src/assets/images'),
      },
    },
    plugins: [
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      ...(process.env.NODE_ENV === 'development' ? [mkCert()] : []),
    ],
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      reporters: [
        'junit',
        [
          'default',
          {
            summary: false,
          },
        ],
      ],
      outputFile: {
        junit: './junit.xml',
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov', 'cobertura'],
        exclude: [
          ...configDefaults.exclude,
          '**/{tailwind,postcss,commitlint}.config.*',
          '__mocks__/**',
          'src/translation/**',
          'src/routes/**',
          'src/routeTree.gen.ts',
          'src/vite-env.d.ts',
          'src/@core/protocols/**',
          'types/**',
          'i18nConfig.ts',
          'src/main.tsx',
          'src/infrastructure/**',
          'src/assets/**',
          'src/utils/helpers/index.ts',
        ],
      },
      // For React 19 specific features
      environmentOptions: {
        happyDOM: {
          settings: {
            // Enable experimental React 19 features
            disableErrorCapturing: false,
            // Additional React 19 specific options
          },
        },
      },
      css: {
        modules: {
          classNameStrategy: 'non-scoped',
        },
      },
      exclude: [
        ...configDefaults.exclude,
        '**/{tailwind,postcss,commitlint}.config.*',
        'src/translation/**',
        'src/routes/**',
        'src/routeTree.gen.ts',
        'src/vite-env.d.ts',
        'src/@core/protocols/**',
        'types/**',
        'i18nConfig.ts',
        'src/main.tsx',
        'src/infrastructure/**',
        'src/assets/**',
      ],
    },
    server: {
      port: 3000,
      host: 'localhost',
      allowedHosts: ['localhost', 'tdwpreweb.telkomsel.com'],
    },
    base: process.env.VITE_BASE_PATH ?? '/',
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
          'process.browser': 'true',
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@src/global.css";`,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Customize asset filenames
          assetFileNames: assetInfo => {
            // Get file extension
            const ext = assetInfo.names[0].split('.').pop()?.toLowerCase();

            // Check if it's a font file
            const fontExtensions = ['woff', 'woff2', 'eot', 'ttf', 'otf'];
            if (fontExtensions.includes(ext as string)) {
              // Font files: keep original name without hash
              return `assets/[name].[ext]`;
            }

            // Other assets: use default hashed name
            return `assets/[name]-[hash].[ext]`;
          },
        },
      },
      outDir: path.resolve(__dirname, './build'),
      emptyOutDir: true,
    },
  });
};

export default viteConfig;
