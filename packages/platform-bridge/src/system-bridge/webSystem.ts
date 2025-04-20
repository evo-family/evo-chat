import { BaseResult, ISystemService } from '@evo/types';
import { BaseBridge } from '../common/baseBridge';

export class WebSystem extends BaseBridge implements ISystemService {
  clearLocalData(): Promise<BaseResult<boolean>> {
    throw new Error('Method not implemented.');
  }
}
