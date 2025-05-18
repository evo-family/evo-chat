import { IMcpStdioConfig } from '@evo/types';
import { getDefaultEnvironment } from '@modelcontextprotocol/sdk/client/stdio.js';
import { isLinux, isMacOS, isWindows } from './PlatformUtil';

const isNodeCommand = (command: string) => {
  return command === 'npx' || command === 'bun';
};

const isPythonCommand = (command: string) => {
  return command === 'uv' || command === 'uvx';
};

export const getCommandArgs = (config: IMcpStdioConfig) => {
  const { args = [], command } = config;

  if (isNodeCommand(command) && args.length > 0) {
    // 添加必要的命令参数，避免重复添加
    // !args.includes('x') && args.unshift('x');
    !args.includes('-y') && args.unshift('-y');
  }

  return args;
};

/**
 * reference cherry studio
 * @param originalPath
 * @returns
 */
function getEnhancedPath(originalPath: string): string {
  const pathSeparator = process.platform === 'win32' ? ';' : ':';
  const existingPaths = new Set(originalPath.split(pathSeparator).filter(Boolean));
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';

  const newPaths: string[] = [];

  if (isMacOS()) {
    newPaths.push(
      '/bin',
      '/usr/bin',
      '/usr/local/bin',
      '/usr/local/sbin',
      '/opt/homebrew/bin',
      '/opt/homebrew/sbin',
      '/usr/local/opt/node/bin',
      `${homeDir}/.nvm/current/bin`,
      `${homeDir}/.npm-global/bin`,
      `${homeDir}/.yarn/bin`,
      `${homeDir}/.cargo/bin`,
      '/opt/local/bin'
    );
  }

  if (isLinux()) {
    newPaths.push(
      '/bin',
      '/usr/bin',
      '/usr/local/bin',
      `${homeDir}/.nvm/current/bin`,
      `${homeDir}/.npm-global/bin`,
      `${homeDir}/.yarn/bin`,
      `${homeDir}/.cargo/bin`,
      '/snap/bin'
    );
  }

  if (isWindows()) {
    newPaths.push(
      `${process.env.APPDATA}\\npm`,
      `${homeDir}\\AppData\\Local\\Yarn\\bin`,
      `${homeDir}\\.cargo\\bin`,
      `${homeDir}\\.cherrystudio\\bin`
    );
  }

  // 添加新路径到现有路径集合
  newPaths.forEach((path) => path && !existingPaths.has(path) && existingPaths.add(path));

  return Array.from(existingPaths).join(pathSeparator);
}

/**
 *
 * @param config
 * @returns
 */
export const getCommandEnv = (config: IMcpStdioConfig) => {
  const { env = {}, command, packageRegistry } = config;
  if (isNodeCommand(command)) {
    if (packageRegistry) {
      env['NPM_CONFIG_REGISTRY'] = packageRegistry;
    }
  }

  if (isPythonCommand(command)) {
    if (packageRegistry) {
      env['UV_DEFAULT_INDEX'] = packageRegistry;
      env['PIP_INDEX_URL'] = packageRegistry;
    }
  }

  return {
    ...getDefaultEnvironment(),
    PATH: getEnhancedPath(process.env.PATH || ''),
    // GITHUB_PERSONAL_ACCESS_TOKEN: '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',
    ...env,
  };
};
