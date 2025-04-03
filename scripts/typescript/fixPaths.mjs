import JSON5 from 'json5';
import { PROJECT_ROOT } from '../utils/common.mjs';
import _ from 'lodash';
import fastGlob from 'fast-glob';
import fs from 'node:fs/promises';
import path from 'node:path';

const { globSync, glob } = fastGlob;

const allFiles = globSync(`./packages/*/tsconfig.json`, { cwd: PROJECT_ROOT });

const tasks = allFiles.map(async (filePath) => {
  try {
    const fileContent = await fs.readFile(filePath);
    const tsconfig = JSON5.parse(fileContent);

    if (!tsconfig?.compilerOptions?.paths) return;

    const composePaths = await glob(`./*`, {
      onlyDirectories: true,
      cwd: path.resolve(filePath, '../src'),
    }).then((results) =>
      Object.fromEntries(
        results.map((fileName) => {
          const parentDirName = path.basename(fileName);

          return [`@/${parentDirName}/*`, [`./src/${parentDirName}/*`]];
        })
      )
    );

    const extractValidPath = Object.fromEntries(
      Object.entries(tsconfig.compilerOptions.paths).filter(([key, value]) => {
        return !key.startsWith('@/');
      })
    );

    const composeNewPaths = {
      ...composePaths,
      ...extractValidPath,
    };

    if (_.isEqual(composeNewPaths, tsconfig.compilerOptions.paths)) return;

    tsconfig.compilerOptions.paths = composeNewPaths;

    await fs.writeFile(filePath, JSON.stringify(tsconfig, null, 2));
  } catch (error) {
    console.log({ filePath, error });
  }
});

await Promise.all(tasks);
