import { BaseIDBStore } from '../../base-idb-store/store';
import { DataCellWithStorageDriver } from './types';
import { debounce } from 'lodash';
import { injectPersistenceCellDriver } from './withStorage';

export type TDataCellWebStorageCache = Map<any, any>;

const PERSISTENCE_IDB_KEY = '_data_cell_persistence_';

const driverIDBStore = new BaseIDBStore(PERSISTENCE_IDB_KEY);

const WEB_DRIVER: DataCellWithStorageDriver = {
  get: async <T = any>(cacheKey: string) => {
    const cacheData = await driverIDBStore.bufferedGet(cacheKey);

    return cacheData as T;
  },
  has: async (cacheKey) => {
    const cacheData = await driverIDBStore.bufferedGet(cacheKey);

    return !!cacheData;
  },
  init: async (cacheKey, dataCell) => {
    const cacheData = await driverIDBStore.bufferedGet(cacheKey);

    if (cacheData) {
      dataCell.set(cacheData);
    } else {
      await driverIDBStore.bufferedSet(cacheKey, dataCell.get());
    }
  },
  update: async (cacheKey, dataCell, signal) => {
    await driverIDBStore.bufferedSet(cacheKey, dataCell.get());
  },
  destroy: (cacheKey) => {
    driverIDBStore.delete(cacheKey);
  },
  bulkGet: (cacheKeys: string[]) => {
    return driverIDBStore.bulkGet(cacheKeys);
  },
};

export const initDataCellStorageWithWeb = () => {
  injectPersistenceCellDriver(WEB_DRIVER);
};

export const clearDataCellStorageWithWeb = () => {
  driverIDBStore.clear();
};
