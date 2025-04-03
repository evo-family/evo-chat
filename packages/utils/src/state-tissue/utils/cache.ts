import { GET_STATE_TISSUE_STORE_SYMBOL } from '../constants';
import { StateTissue } from '../tissue';
import { pickKeysValueFromTissue } from './parse';

export interface StateTissueAllValuesCacheRecord {
  cache: {
    map: Map<any, any>;
    array: Array<any>;
    object: Record<any, any>;
  };
}

const STATE_TISSUE_ALL_VALUES_CACHE = new WeakMap<
  StateTissue,
  Readonly<StateTissueAllValuesCacheRecord>
>();

export const clearTissueCache = (boxIns: StateTissue<any>) => {
  STATE_TISSUE_ALL_VALUES_CACHE.delete(boxIns);
};

export const getTissueCache = (boxIns: StateTissue<any>): StateTissueAllValuesCacheRecord => {
  const cacheRecord = STATE_TISSUE_ALL_VALUES_CACHE.get(boxIns);

  if (cacheRecord) {
    return cacheRecord;
  } else {
    const cellStore = boxIns[GET_STATE_TISSUE_STORE_SYMBOL];

    const cache = pickKeysValueFromTissue(cellStore.keys(), boxIns, {
      getMap: true,
      getArray: true,
      getObject: true,
    });

    const record = Object.freeze({
      cache,
    });

    STATE_TISSUE_ALL_VALUES_CACHE.set(boxIns, record);

    return record;
  }
};
