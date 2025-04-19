import { DebounceSettingsLeading, debounce, isFunction, mergeWith } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { DataCell } from '../data-cell/cell';

export const isPromise = (data: any): data is Promise<any> => data instanceof Promise;

export interface PromiseResolve<T> {
  (value: T): void;
}
export interface PromiseReject {
  (reason?: any): void;
}

export enum PROMISE_STATE_ENUM {
  pending = 'pending',
  fulfilled = 'fulfilled',
  rejected = 'rejected',
}

export type PromiseState = keyof typeof PROMISE_STATE_ENUM;

export interface PromiseWrap<T = undefined> {
  promise: Promise<T>;
  resolve: PromiseResolve<T>;
  reject: PromiseReject;
  state: PromiseState;
}

/**
 *  获取value的数据类型
 *
 * @param {unknown} value
 */
export const getDataType = (value: unknown) =>
  Object.prototype.toString.call(value).toLowerCase().slice(8, -1);

/**
 *  判断value是否为object数据
 *
 * @param {unknown} value
 */
export const isObject = (value: unknown): value is object => getDataType(value) === 'object';

/**
 *  生成一个对象的Promise包装，可以自行选择调用resolve和reject的时机。
 *
 * @template T
 * @return {*}  {PromiseWrap<T>}
 */
export const generatePromiseWrap = <T = undefined>(): PromiseWrap<T> => {
  let wrapResolve: PromiseResolve<T>, wrapReject: any;

  const promise = new Promise<T>((resolve, reject) => {
    wrapResolve = resolve as PromiseResolve<T>;
    wrapReject = reject;
  });

  const result: PromiseWrap<T> = {
    promise,
    resolve: (value) => {
      wrapResolve(value);
      result.state = 'fulfilled';
    },
    reject: (reason) => {
      wrapReject(reason);
      result.state = 'rejected';
    },
    state: 'pending',
  };

  return result;
};

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const generateHashId = (length = 32, prefix: string = '') => {
  const timeFlag = Date.now().toString(36).slice(0, length);
  const padLen = length - prefix.length - timeFlag.length;
  let hash = '';

  for (let i = 0; i < padLen; i++) {
    hash += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }

  return prefix + timeFlag + hash;
};

export const asyncBufferDebounce = <ParamsBufferItem extends Array<any> = any[], T = undefined>(
  func: (bufferedParams: BufferedParamsWrap<ParamsBufferItem, T>[]) => void,
  wait: number | undefined,
  options?: DebounceSettingsLeading
) => {
  let bufferedParams: BufferedParamsWrap<ParamsBufferItem, T>[] = [];

  const debounceMethods = debounce(
    () => {
      func(bufferedParams);
      bufferedParams = [];
    },
    wait,
    options
  );

  return (...params: ParamsBufferItem) => {
    const task = generatePromiseWrap<T>();
    bufferedParams.push({ params, task });

    debounceMethods();

    return task.promise;
  };
};

export interface BufferedParamsWrap<Params, ResultData> {
  params: Params;
  task: PromiseWrap<ResultData>;
}

export const bufferDebounce = <ParamsBufferItem extends Array<any> = any[], T = undefined>(
  func: (bufferedParams: Omit<BufferedParamsWrap<ParamsBufferItem, T>, 'task'>[]) => void,
  wait: number | undefined,
  options?: DebounceSettingsLeading
) => {
  let bufferedParams: Omit<BufferedParamsWrap<ParamsBufferItem, T>, 'task'>[] = [];

  const debounceMethods = debounce(
    () => {
      func(bufferedParams);
      bufferedParams = [];
    },
    wait,
    options
  );

  return (...params: ParamsBufferItem) => {
    bufferedParams.push({ params });
    debounceMethods();
  };
};

const reduceAsyncFunction = async <T = any, K = any>(
  tasks: Iterable<T> | Array<any>,
  reduceParams: K
) => {
  const allHandlers = Array.isArray(tasks) ? tasks : Array.from(tasks);

  while (allHandlers.length) {
    const handler = allHandlers.shift();

    if (handler) {
      reduceParams = await handler(reduceParams);
    }
  }

  return reduceParams;
};

function overwrite(oldValue: any, newValue: any) {
  if (Array.isArray(oldValue) || Array.isArray(newValue)) {
    return newValue;
  }
}

export const mergeExceptArray = <TObject, TSource>(
  oldValue: TObject,
  newValue: TSource,
  rewriteOldValue = false
) => {
  if (!rewriteOldValue) {
    return mergeWith({}, oldValue, newValue, overwrite);
  }

  return mergeWith(oldValue, newValue, overwrite);
};

export type TMultipleInitHandlerParams<T = any, P extends any[] = any[]> =
  | T
  | Promise<T>
  | ((...args: P) => T | Promise<T>);

export const multipleInitHandler = async <T = any, P extends any[] = any[]>(
  params: TMultipleInitHandlerParams<T>,
  ...args: P
): Promise<T> => {
  let result = params;

  if (isFunction(params)) {
    result = await params(...args);
  }

  if (isPromise(params)) {
    result = await params;
  }

  return result as T;
};

/**
 * @description 给cell设置部分数据
 * @param cell
 * @param partialData
 */
export function setPartialDataCell<T>(cell: DataCell<T>, partialData: Partial<T>) {
  cell.set({
    ...cell.get(),
    ...partialData,
  });
}

/**
 * 生成uuid内容
 * @param prefix
 * @returns
 */
export const generateUUID = (prefix: string = ''): string => {
  return prefix + uuidv4();
};

export const parseKeyValueText = (text?: string) => {
  if (!text) return {};
  return text
    .split('\n')
    .filter(Boolean)
    .reduce((acc, line) => {
      const [key, value] = line.split('=').map((item) => item.trim());
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
};

export const stringifyKeyValueText = (obj?: Record<string, string>) => {
  if (!obj) return '';
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
};
