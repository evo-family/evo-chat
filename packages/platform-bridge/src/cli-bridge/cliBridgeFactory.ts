import { ICliService } from '@evo/types';
import { BaseBridgeFactory } from '../common/baseBridgeFactory';
import { ElectronCli } from './electronCli';
import { WebCli } from './webCli';

export class CliBridgeFactory extends BaseBridgeFactory<ICliService> {
  protected createElectronBridge(): ICliService {
    return new ElectronCli();
  }

  protected createMobileBridge(): ICliService {
    return new WebCli();
  }

  protected createWebBridge(): ICliService {
    return new WebCli();
  }
}