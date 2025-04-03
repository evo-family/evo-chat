import { defineConfig, loadEnv } from 'vite';

import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import _ from 'lodash';
import assert from 'node:assert';
import chalk from 'chalk';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import { fileURLToPath } from 'node:url';
import libAssets from '@laynezh/vite-plugin-lib-assets';
import path from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';

// https://antfu.me/posts/isomorphic-dirname
const _dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const rootPath = path.resolve(_dirname, '../');

const viteBaseConfig = (options) => {
  const { mode } = options.configEnv;

  const env = loadEnv(mode, rootPath);
  const ANALYZER = env.VITE_ANALYZER === 'true';
  const pkgRoot = options.pkgRoot;
  const pkgName = pkgRoot.split(path.sep).pop();
  const plugins = [];

  // auto add rollupOptions.external
  plugins.push(
    externalizeDeps({
      include: ['react/jsx-runtime'],
      except: [/.*\.(css|scss|less)$/],
      useFile: path.resolve(pkgRoot, 'package.json'),
    })
  );

  plugins.push(react());

  plugins.push(
    libAssets({
      name: '[name].[contenthash:8].[ext]',
    })
  );

  plugins.push(ViteImageOptimizer());

  ANALYZER &&
    plugins.push(
      visualizer({
        filename: `${rootPath}/node_modules/.cache/visualizer/${pkgName}_stats.html`,
        open: true,
        gzipSize: true,
        brotliSize: true,
      })
    );

  return defineConfig({
    plugins,
    resolve: {
      alias: [{ find: '@', replacement: path.resolve(pkgRoot, './src') }],
    },
    build: {
      lib: {
        entry: {
          index: 'src/index.ts',
        },
        formats: ['es'],
      },
      target: ['esnext'],
      minify: false,
      sourcemap: false,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          minifyInternalExports: true,
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // https://github.com/vitejs/vite/discussions/5079
          charset: false,
          // https://github.com/sass/sass/blob/6034b31/js-api-doc/deprecations.d.ts
          silenceDeprecations: [
            'legacy-js-api',
            'import',
            'global-builtin',
            'color-functions',
            'mixed-decls',
          ],
        },
        less: { javascriptEnabled: true },
      },
      modules: {
        localsConvention: 'camelCase',
      },
    },
  });
};

export default viteBaseConfig;
