import { BaseResult, ICliService } from '@evo/types';
import { BaseBridge } from '../common/baseBridge';

export class WebCli extends BaseBridge implements ICliService {
  checkBunCommand(): Promise<BaseResult<boolean>> {
    throw new Error('Method not implemented.');
  }
  checkUvCommand(): Promise<BaseResult<boolean>> {
    throw new Error('Method not implemented.');
  }
  getCommandPath(command: string): Promise<BaseResult<string | null>> {
    throw new Error('Method not implemented.');
  }
  installCommand(command: string): Promise<BaseResult<boolean>> {
    throw new Error('Method not implemented.');
  }
}
