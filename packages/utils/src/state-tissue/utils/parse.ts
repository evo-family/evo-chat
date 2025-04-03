import { GET_STATE_TISSUE_STORE_SYMBOL } from '../constants';
import { StateTissue } from '../tissue';
import { TissueKey } from '../types';

// 为了防止歧义，不支持number型作为scopeId，如果为number型，转为string
export const getFormattedId = (id: TissueKey): TissueKey =>
  typeof id === 'number' ? id?.toString() : id;

export const pickKeysValueFromTissue = (
  keys: Iterable<any>,
  boxIns: StateTissue<any>,
  options: {
    getMap?: boolean;
    getArray?: boolean;
    getObject?: boolean;
  }
) => {
  const { getMap = true, getArray = true, getObject = true } = options;

  const cellStore = boxIns[GET_STATE_TISSUE_STORE_SYMBOL];

  const map = new Map<any, any>();
  const array: any[] = [];
  const object = {} as Record<any, any>;

  for (const key of keys) {
    const value = cellStore.get(getFormattedId(key))?.cell.get();

    getMap && map.set(key, value);
    getArray && array.push(value);
    getObject && Reflect.set(object, key as any, value);
  }

  return {
    map,
    array,
    object,
  };
};
