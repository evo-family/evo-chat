import { defineConfig, loadEnv, mergeRsbuildConfig } from '@rsbuild/core';

import { ProvidePlugin } from '@rspack/core';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import { composeChunkSplit } from './utils/chunkSplit.mjs';
import { composePathAlias } from './utils/pathAlias.mjs';
import path from 'node:path';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

const isDev = process.env.NODE_ENV === 'development';
const monorepoRoot = path.resolve(__dirname, '../../');

// transfer CRA env
const { rawPublicVars } = loadEnv({ prefixes: ['PUBLIC_', 'REACT_APP_', 'NODE_ENV'] });

// only for production
const PUBLIC_URL = process.env.PUBLIC_URL ?? '/';

const HOST = process.env.HOST ?? 'localhost';
const PORT = process.env.PORT ?? 5005;

export default function generateConfig({ projectCWD }) {
  const baseConfig = defineConfig({
    plugins: [
      pluginReact(),
      pluginSvgr({ mixedImport: true }),
      pluginLess(),
      pluginSass({
        sassLoaderOptions: {
          api: 'legacy',
          sassOptions: {
            silenceDeprecations: [
              'legacy-js-api',
              'import',
              'global-builtin',
              'color-functions',
              'mixed-decls',
            ],
          },
        },
      }),
    ],
    html: {
      template: path.resolve(projectCWD, './public/index.html'),
    },
    performance: {
      preload: {
        type: 'initial',
        exclude: [/.*\.(png|svg|jpg|jpeg|gif|woff|woff2|ttf|eot|ico|webp)$/],
      },
      preconnect: PUBLIC_URL.startsWith('http') ? [{ href: PUBLIC_URL, crossorigin: true }] : [],
      dnsPrefetch: [],
      // prefetch: true,
      removeMomentLocale: true,
    },
    dev: {
      // configs目录变更的时候重启rsbuild的server
      watchFiles: [
        {
          paths: [__dirname],
          type: 'reload-server',
        },
      ],
      hmr: false,
      liveReload: true,
    },
    server: {
      host: HOST,
      port: PORT,
      proxy: {},
    },
    tools: {
      rspack: (config, { appendPlugins }) => {
        appendPlugins(
          new ProvidePlugin({
            _: 'lodash',
          })
        );

        if (process.env.RSDOCTOR) {
          appendPlugins(
            new RsdoctorRspackPlugin({
              features: ['bundle', 'dependencies'],
              supports: {
                generateTileGraph: true,
              },
            })
          );
        }

        // 启用持久化缓存
        config.cache = true;
        config.experiments.cache = {
          type: 'persistent',
        };
      },
    },
    source: {
      define: {
        'process.env': JSON.stringify(rawPublicVars),
      },
    },
    output: {
      // only for production
      polyfill: isDev ? 'off' : 'entry',
      assetPrefix: PUBLIC_URL,
      distPath: {
        root: isDev ? 'dev_build' : 'build',
      },
    },
  });

  const composeConfigParams = {
    projectCWD,
    isDev,
    monorepoRoot,
  };

  const aliasConfig = composePathAlias(composeConfigParams);
  const chunkSplitConfig = composeChunkSplit(composeConfigParams);

  const mergedConfig = mergeRsbuildConfig(baseConfig, chunkSplitConfig, aliasConfig);

  return mergedConfig;
}
