import { v4 as uuidv4 } from 'uuid';
import { IBaseMeta } from '@evo/types';

/**
 * 创建基础实体数据
 */
export const createBaseMeta = <T extends IBaseMeta>(data: Omit<T, keyof IBaseMeta>): T => {
  const now = Date.now();
  return {
    id: uuidv4(),
    createTime: now,
    modifiedTime: now,
    ...data,
  } as T;
};

/**
 * 修改基础实体数据
 */
export const updateBaseMeta = <T extends IBaseMeta>(data: Omit<T, keyof IBaseMeta>): T => {
  return {
    modifiedTime: Date.now(),
    ...data,
  } as T;
};
