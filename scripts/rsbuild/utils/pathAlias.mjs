import { defineConfig, loadEnv, mergeRsbuildConfig } from '@rsbuild/core';

import fs from 'node:fs';
import path from 'node:path';
import { pluginConnectSourceCode } from './plugins/sourceCode.mjs';

const UNLINK_SOURCE_CODE_PACKS = [];

const composeSourceCodeConfig = (params) => {
  const { isDev, monorepoRoot } = params;

  // 读取环境变量，判断是否需要直连v5、v6源码进行代码调试
  const { rawPublicVars } = loadEnv({ prefixes: ['CONNECT_PROJECTS_SOURCE_CODE'] });
  const connectSourceCode = rawPublicVars['CONNECT_PROJECTS_SOURCE_CODE'] === 'true';
  const connectSourceCodeEnable = connectSourceCode && isDev;

  if (!connectSourceCodeEnable) return;

  return defineConfig({
    plugins: [pluginConnectSourceCode()],
    resolve: {
      alias: (alias) => {
        const monorepoPackages = fs.readdirSync(path.resolve(monorepoRoot, 'packages'));

        const connectPack = (packName, projectPath) => {
          if (UNLINK_SOURCE_CODE_PACKS.includes(packName)) return;

          const packAbsPath = path.resolve(projectPath, `packages`, packName);

          if (!fs.statSync(packAbsPath).isDirectory()) return;

          alias[`@evo/${packName}`] = path.resolve(projectPath, `packages/${packName}/src`);
        };

        monorepoPackages.forEach((packName) => connectPack(packName, monorepoRoot));
      },
    },
  });
};

export const composePathAlias = (params) => {
  const { isDev, projectCWD } = params;

  const dedupe = (() => {
    const deps = new Set([]);

    if (isDev) {
      const { dependencies } = fs.readFileSync(path.resolve(projectCWD, './package.json'));
      console.log(dependencies);

      Object.entries(dependencies ?? {})
        .filter(([key, value]) => !value.startsWith('workspace:'))
        .forEach(([key]) => {
          deps.add(key);
        });
    }
    return [...deps];
  })();

  const baseAliasConfig = defineConfig({
    resolve: {
      dedupe,
      alias: (alias) => {
        alias['@'] = path.resolve(projectCWD, './src');
        alias['src'] = path.resolve(projectCWD, './src');
      },
    },
  });

  const connectSourceCodeConfig = composeSourceCodeConfig(params);

  return mergeRsbuildConfig(baseAliasConfig, connectSourceCodeConfig);
};
