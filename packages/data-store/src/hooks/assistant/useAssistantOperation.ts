import { IAssistantMeta } from '@evo/types';
import { useCallback } from 'react';
import { getAssistantsData } from '../../glob-state/assistant';
import { useCreation, useMemoizedFn } from 'ahooks';
import { createBaseMeta, updateBaseMeta } from '@evo/utils';

export const useAssistantOperation = () => {
  const assistantsData = useCreation(async () => {
    return getAssistantsData();
  }, [getAssistantsData]);

  // 创建助手
  const createAssistant = useMemoizedFn(async (data: IAssistantMeta) => {
    try {
      const { id, ...otherData } = data;
      const metaData = Object.assign(createBaseMeta(otherData), {
        category: 'my',
        tags: ['我的'],
      }) as IAssistantMeta;
      (await assistantsData).setCellValue(metaData.id, metaData);
      return true;
    } catch (error) {
      return false;
    }
  });

  // 更新助手
  const updateAssistant = useMemoizedFn(async (data: IAssistantMeta) => {
    try {
      const metaData = updateBaseMeta(data) as IAssistantMeta;
      (await assistantsData).setCellValue(metaData.id, metaData);
      return true;
    } catch (error) {
      return false;
    }
  });

  // 删除助手
  const deleteAssistant = useCallback(async (id: string) => {
    try {
      (await assistantsData).clearCell(id);
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  return {
    createAssistant,
    updateAssistant,
    deleteAssistant,
  };
};
