import { BaseResult, ICliService } from '@evo/types';
import { checkCommand, getCommandPath as getCliPath } from '../utils/cliCheck';
import { IDepManager } from '../types/common';
import { ResultUtil } from '@evo/utils';

export interface ICliManagerOptions {
  depManager: IDepManager;
}

export class CliManager implements ICliService {
  private depManager: IDepManager;

  constructor(options: ICliManagerOptions) {
    this.depManager = options.depManager;
  }

  async checkNpxCommand(): Promise<BaseResult<boolean>> {
    try {
      const installed = await checkCommand('npx');
      return ResultUtil.success(installed);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async getCommandPath(command: string): Promise<BaseResult<string | null>> {
    try {
      const path = await getCliPath(command);
      return ResultUtil.success(path);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async installCommand(command: string): Promise<BaseResult<boolean>> {
    try {
      // TODO: 实现命令安装逻辑
      return ResultUtil.error('暂不支持安装命令');
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async checkUvCommand(): Promise<BaseResult<boolean>> {
    try {
      const installed = await checkCommand('uv');
      return ResultUtil.success(installed);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async checkBunCommand(): Promise<BaseResult<boolean>> {
    try {
      const installed = await checkCommand('bun');
      return ResultUtil.success(installed);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }
}
