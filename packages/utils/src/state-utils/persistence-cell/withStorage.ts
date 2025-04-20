// import { TissueDataModal, TissueModalKey, TissueModalValue } from '../../state-tissue/types';

import { DataCell } from '../../data-cell/cell';
import { DataCellSignal } from '../../data-cell/types';
import { DataCellWithStorageDriver } from './types';
import { StateTissue } from '../../state-tissue/tissue';
import { generatePromiseWrap } from '../../utils/common';
import { throttle } from 'lodash';

let __storage_driver: DataCellWithStorageDriver | undefined = undefined;

const initDriverTask = generatePromiseWrap();

const syncInitCaches: Record<any, DataCell> = {};

const batchUpdateRcord: Map<string, { cellInstance: DataCell<any>; signel: DataCellSignal }> =
  new Map();

const throttleUpdateLocalCache = throttle(() => {
  batchUpdateRcord.forEach((record, cacheKey) => {
    __storage_driver?.update(cacheKey, record.cellInstance, record.signel);
  });

  batchUpdateRcord.clear();
}, 1e3);

const getCellInstance = (key: string, initialValue?: any) => {
  const cacheIns = Reflect.get(syncInitCaches, key);

  if (cacheIns) {
    return cacheIns;
  }

  const cellInstance = new DataCell(initialValue);

  Reflect.set(syncInitCaches, key, cellInstance);

  return cellInstance;
};

const cellCaches = new StateTissue<Record<any, DataCell>>({
  initHandler: async (cacheKey, initialValue) => {
    initDriverTask.state === 'pending' ? await initDriverTask.promise : void 0;

    const cellInstance = getCellInstance(cacheKey, initialValue);

    try {
      await __storage_driver?.init(cacheKey, cellInstance);
    } catch (error) {
      console.error(error);
    }

    const subscription = cellInstance.listen(
      (signel) => {
        batchUpdateRcord.set(cacheKey, {
          cellInstance,
          signel,
        });

        throttleUpdateLocalCache();
      },
      {
        receiveSilentSignal: true,
      }
    );

    cellInstance.registerHook('destroy', () => {
      subscription.unsubscribe();
      throttleUpdateLocalCache.cancel();
      batchUpdateRcord.delete(cacheKey);

      __storage_driver?.destroy(cacheKey, cellInstance);

      cellCaches.clearCell(cacheKey);

      Reflect.deleteProperty(syncInitCaches, cacheKey);
    });

    return cellInstance;
  },
});

export const injectPersistenceCellDriver = (driver: DataCellWithStorageDriver) => {
  __storage_driver = driver;

  initDriverTask.state === 'pending' ? initDriverTask.resolve(undefined) : void 0;
};

export const persistenceCell = async <T = any>(cacheKey: string, initialValue?: T) => {
  const result = await cellCaches.getCellValue(cacheKey, initialValue as any);

  return result as DataCell<typeof initialValue extends undefined ? T | undefined : T>;
};

export const persistenceCellSync = <T = any>(cacheKey: string, initialValue?: T) => {
  if (cellCaches.isCellExist(cacheKey)) {
    return cellCaches.getCellValueSync(cacheKey) as DataCell<
      typeof initialValue extends undefined ? undefined | T : T
    >;
  } else {
    const cellInstance = getCellInstance(cacheKey, initialValue);

    cellCaches.tryInitCell(cacheKey);

    return cellInstance as DataCell<typeof initialValue extends undefined ? undefined | T : T>;
  }
};

export const isPersistenceCellExist = (cacheKey: string) => {
  return __storage_driver?.has(cacheKey);
};

export const clearPersistenceCell = (cacheKey: string) => {
  return __storage_driver?.destroy(cacheKey);
};

export const getPersistenceCellDriverIns = () => __storage_driver;
