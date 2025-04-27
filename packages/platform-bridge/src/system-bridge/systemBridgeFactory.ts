import { ISystemService } from '@evo/types';
import { BaseBridgeFactory } from '../common/baseBridgeFactory';
import { ElectronSystem } from './electronSystem';
import { WebSystem } from './webSystem';

export class SystemBridgeFactory extends BaseBridgeFactory<ISystemService> {
  protected createElectronBridge(): ISystemService {
    return new ElectronSystem();
  }

  protected createWebBridge(): ISystemService {
    return new WebSystem();
  }

  protected createMobileBridge(): ISystemService {
    return new WebSystem();
  }
}
