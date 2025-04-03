import { StateTissue } from '../../state-tissue/tissue';

export interface StateTissueWithStorageDriver {
  init: (cacheKey: string, boxIns: StateTissue) => any;
  update: (cacheKey: string, boxIns: StateTissue) => any;
  destroy: (cacheKey: string, boxIns: StateTissue) => any;
}
