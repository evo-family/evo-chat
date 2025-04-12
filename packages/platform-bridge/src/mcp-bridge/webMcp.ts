import { IMcpService } from '@evo/types';
import { BaseBridge } from '../common/baseBridge';

export class WebMcp extends BaseBridge implements IMcpService {
  async startService(): Promise<boolean> {
    return false;
  }

  async stopService(): Promise<boolean> {
    return false;
  }

  async getServiceStatus(): Promise<boolean> {
    return false;
  }
}