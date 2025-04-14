import { TissueDataModal, TissueModalKey, TissueModalValue } from '../../state-tissue/types';

import { StateTissue } from '../../state-tissue/tissue';
import { StateTissueWithStorageDriver } from './types';
import { generatePromiseWrap } from '../../utils/common';
import { throttle } from 'lodash';

let __storage_driver: StateTissueWithStorageDriver | undefined = undefined;

const initDriverTask = generatePromiseWrap();

const syncInitCaches: Record<any, StateTissue> = {};

const throttleUpdateLocalCache = throttle((cacheKey: string, stateInstance: StateTissue) => {
  stateInstance.destroyed ? void 0 : __storage_driver?.update(cacheKey, stateInstance);
}, 1e3);

const getTissueInstance = (key: string) => {
  const cacheIns = Reflect.get(syncInitCaches, key);

  if (cacheIns) {
    return cacheIns;
  }

  const stateInstance = new StateTissue({});

  Reflect.set(syncInitCaches, key, stateInstance);

  return stateInstance;
};

const tissueCaches = new StateTissue<Record<any, StateTissue>>({
  initHandler: async (cacheKey) => {
    initDriverTask.state === 'pending' ? await initDriverTask.promise : void 0;

    const stateInstance = getTissueInstance(cacheKey);

    try {
      await __storage_driver?.init(cacheKey, stateInstance);
    } catch (error) {
      console.error(error);
    }

    const subscription = stateInstance.globListen(
      (signal) => {
        throttleUpdateLocalCache(cacheKey, stateInstance);
      },
      {
        receiveDestroySignal: true,
        receiveSilentSignal: true,
      }
    );

    stateInstance.registerHook('destroy', () => {
      subscription.unsubscribe();
      throttleUpdateLocalCache.cancel();
      __storage_driver?.destroy(cacheKey, stateInstance);

      tissueCaches.clearCell(cacheKey);

      Reflect.deleteProperty(syncInitCaches, cacheKey);
    });

    return stateInstance;
  },
});

export const injectPersistenceTissueDriver = (driver: StateTissueWithStorageDriver) => {
  __storage_driver = driver;

  initDriverTask.state === 'pending' ? initDriverTask.resolve(undefined) : void 0;
};

export const persistenceTissue = async <
  CurModalData extends TissueDataModal = TissueDataModal,
  StateTissueContext = any,
  CellContext = any,
  TKey extends TissueModalKey<CurModalData> = TissueModalKey<CurModalData>,
  TValue extends TissueModalValue<CurModalData> = TissueModalValue<CurModalData>
>(
  cacheKey: string
) => {
  return (await tissueCaches.getCellValue(cacheKey)) as StateTissue<
    CurModalData,
    StateTissueContext,
    CellContext,
    TKey,
    TValue
  >;
};

export const persistenceTissueSync = <
  CurModalData extends TissueDataModal = TissueDataModal,
  StateTissueContext = any,
  CellContext = any,
  TKey extends TissueModalKey<CurModalData> = TissueModalKey<CurModalData>,
  TValue extends TissueModalValue<CurModalData> = TissueModalValue<CurModalData>
>(
  cacheKey: string
): StateTissue<CurModalData, StateTissueContext, CellContext, TKey, TValue> => {
  if (tissueCaches.isCellExist(cacheKey)) {
    return tissueCaches.getCellValueSync(cacheKey) as StateTissue<
      CurModalData,
      StateTissueContext,
      CellContext,
      TKey,
      TValue
    >;
  } else {
    const stateInstance = getTissueInstance(cacheKey);

    tissueCaches.tryInitCell(cacheKey);

    return stateInstance as StateTissue<
      CurModalData,
      StateTissueContext,
      CellContext,
      TKey,
      TValue
    >;
  }
};

export const getPersistenceTissueDriverIns = () => __storage_driver;
