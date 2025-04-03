import { BaseIDBStore } from '../../base-idb-store/store';
import { DataCellWithStorageDriver } from './types';
import { debounce } from 'lodash';
import { injectPersistenceCellDriver } from './withStorage';

export type TDataCellWebStorageCache = Map<any, any>;

const PERSISTENCE_IDB_KEY = '_data_cell_persistence_';

const SYNC_DINSTANCE = 1e3;

const driverIDBStore = new BaseIDBStore(PERSISTENCE_IDB_KEY);

const WEB_DRIVER: DataCellWithStorageDriver = {
  has: async (cacheKey) => {
    const cacheData = await driverIDBStore.get<TDataCellWebStorageCache>(cacheKey);

    return !!cacheData;
  },
  init: async (cacheKey, dataCell) => {
    const cacheData = await driverIDBStore.get<TDataCellWebStorageCache>(cacheKey);

    if (cacheData) {
      dataCell.set(cacheData);
    } else {
      await driverIDBStore.set(cacheKey, dataCell.get());
    }
  },
  update: async (cacheKey, dataCell, signal) => {
    await driverIDBStore.set(cacheKey, dataCell.get());
  },
  destroy: (cacheKey) => {
    driverIDBStore.delete(cacheKey);
  },
};

export const initDataCellStorageWithWeb = () => {
  injectPersistenceCellDriver(WEB_DRIVER);
};

export const clearDataCellStorageWithWeb = () => {
  driverIDBStore.clear();
};
