import { IMcpService } from '@evo/types';
import { BaseBridgeFactory } from '../common/baseBridgeFactory';
import { ElectronMcp } from './electronMcp';
import { WebMcp } from './webMcp';

export class McpBridgeFactory extends BaseBridgeFactory<IMcpService> {
  protected createElectronBridge(): IMcpService {
    return new ElectronMcp();
  }

  protected createMobileBridge(): IMcpService {
    return new WebMcp();
  }

  protected createWebBridge(): IMcpService {
    return new WebMcp();
  }
}