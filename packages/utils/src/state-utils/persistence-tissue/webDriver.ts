import { BaseIDBStore } from '../../base-idb-store/store';
import { StateTissueWithStorageDriver } from './types';
import { injectPersistenceTissueDriver } from './withStorage';

export type TStateTissueWebStorageCache = Map<any, any>;

const PERSISTENCE_IDB_KEY = '_state_tissue_persistence_';

const SYNC_DINSTANCE = 1e3;

const driverIDBStore = new BaseIDBStore(PERSISTENCE_IDB_KEY);

const WEB_DRIVER: StateTissueWithStorageDriver = {
  init: async (cacheKey, stateTissueIns) => {
    const cacheData = await driverIDBStore.bufferedGet(cacheKey);

    if (cacheData) {
      for (const [key, value] of cacheData.entries()) {
        stateTissueIns.setCellValueSync(key, value);
      }
    } else {
      const allValuesMap = stateTissueIns.getCellsValue({ all: true }).map;

      await driverIDBStore.bufferedSet(cacheKey, allValuesMap);
    }
  },
  get: async <T = any>(cacheKey: string) => {
    const cacheData = await driverIDBStore.bufferedGet(cacheKey);

    return cacheData as T;
  },
  update: async (cacheKey, stateTissueIns) => {
    const allValuesMap = stateTissueIns.getCellsValue({ all: true }).map;

    await driverIDBStore.bufferedSet(cacheKey, allValuesMap);
  },
  destroy: (cacheKey, stateTissueIns) => {
    driverIDBStore.delete(cacheKey);
  },
};

export const initStateTissueStorageWithWeb = () => {
  injectPersistenceTissueDriver(WEB_DRIVER);
};

export const clearStateTissueStorageWithWeb = () => {
  driverIDBStore.clear();
};
