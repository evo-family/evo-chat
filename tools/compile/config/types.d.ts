import { ConfigEnv,  UserConfig } from 'vite';

export interface IEntryPathRecord {
  path: string;
  name: string;
}

// base vite config factory options
export interface ConfigOptions {
  /**
   * package root path, e.g.: .../packages/admin-space
   */
  pkgRoot: string;
  /**
   * transport vite ConfigEnv
   */
  configEnv: ConfigEnv;

}

export default function viteBaseConfig(options: ConfigOptions): UserConfig;
