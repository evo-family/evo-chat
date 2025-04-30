// 需要先安装 electron-vite 依赖: npm install electron-vite --save-dev
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: [
          '@evo/types',
          '@evo/utils',
          '@evo/demo',
          '@evo/pglite-manager',
          '@evo/knowledge-service',
          '@evo/mcp-service',
          '@llm-tools/embedjs',
          '@llm-tools/embedjs-openai',
          '@llm-tools/embedjs-loader-web',
          '@llm-tools/embedjs-loader-markdown',
          '@llm-tools/embedjs-loader-msoffice',
          '@llm-tools/embedjs-loader-csv',
          '@llm-tools/embedjs-loader-xml',
          '@llm-tools/embedjs-loader-pdf',
          '@llm-tools/embedjs-loader-sitemap',
          '@llm-tools/embedjs-libsql',
          '@llm-tools/embedjs-loader-image',
          '@llm-tools/embedjs-interfaces',
        ],
      }),
    ],
    resolve: {
      alias: {
        '@evo/pglite-manager': resolve('../../packages/pglite-manager/src'),
        '@evo/knowledge-service': resolve('../../packages/knowledge-service/src'),
        '@evo/mcp-service': resolve('../../packages/mcp-service/src'),
        '@evo/types': resolve('../../packages/types/src'),
        '@evo/utils': resolve('../../packages/utils/src'),
      },
    },
    build: {
      rollupOptions: {
        external: [
          'electron',
          // '@libsql/client',
          '@electric-sql/pglite',
          /pdf-parse\/.*$/,
          '@libsql/darwin-arm64',
          '@llm-tools/embedjs-loader-sitemap',
          'officeparser',
        ],
      },
      commonjsOptions: {
        transformMixedEsModules: true,
        // ignore: ['pdf-parse'],
        // include: [/node_modules/, /packages/],
        // ignore: ['officeparser'],
        // dynamicRequireTargets: [
        //   'node_modules/@libsql/**/*.node',
        //   '/Users/qiaojie/Code/gitee.com/evo-chat/node_modules/pdf-parse/lib/**/*.js'
        // ],
        // dynamicRequireRoot: '/Users/qiaojie/Code/gitee.com/evo-chat/node_modules'
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  // renderer: {
  //   resolve: {
  //     alias: {
  //       '@renderer': resolve('src/renderer/src')
  //     }
  //   },
  //   plugins: [react()]
  // }
});
