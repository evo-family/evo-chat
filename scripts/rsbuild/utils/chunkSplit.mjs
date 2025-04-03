import { defineConfig } from '@rsbuild/core';

const commonModules = [
  'react',
  'react-dom',
  'react-redux',
  'lodash',
  'jquery',
  'ahooks',
  'rxjs',
  'js-cookie',
  'immer',
  'events',
  'dayjs',
  'axios',
  'classnames',
  'use-context-selector',
  'dexie',
];

const testFactory = (tests) => {
  const prefix = `[\\/]node_modules[\\/]`;
  const regMap = tests.map((item) => {
    return new RegExp(
      prefix + (item instanceof RegExp ? item.toString().slice(1, -1) : item + '\\/')
    );
  });

  return (module) => {
    return regMap.some((reg) => reg.test(module.request));
  };
};

export const composeChunkSplit = (params) => {
  return {};

  const { isDev } = params;

  if (isDev) return {};

  return defineConfig({
    performance: {
      chunkSplit: {
        strategy: 'split-by-experience',
        override: {
          // minSize: 100 * 1024,
          cacheGroups: {
            basic: {
              test: testFactory(commonModules),
              name: 'basic-chunk',
              priority: 40,
              chunks: 'initial',
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        },
      },
    },
  });
};
