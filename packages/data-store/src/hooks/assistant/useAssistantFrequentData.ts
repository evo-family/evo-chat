import { IAssistantMeta } from '@evo/types';
import { getAssistantsData } from '../../glob-state/assistant';
import { useAssistantLogic } from './useAssistantLogic';
import { useLayoutEffect, useMemo, useState } from 'react';
import { useAssistantData } from './useAssistantData';
import { ASSISTANT_CATEGORIES } from '../../constants/assistant/category';

/**
 * 获取常用助手数据的 hook
 */
export const useAssistantFrequentData = (params: { searchText: string }) => {
  const { searchText } = params;
  const { assistants } = useAssistantData();

  // 过滤出常用助手
  const frequentAssistants = useMemo(() => {
    return assistants.filter((assistant) => assistant.isFrequent);
  }, [assistants]);

  const treeData = useMemo(() => {
    // 过滤搜索结果
    const filteredAssistants = searchText
      ? frequentAssistants.filter(
          (assistant) =>
            assistant.title.toLowerCase().includes(searchText.toLowerCase()) ||
            assistant.description?.toLowerCase().includes(searchText.toLowerCase())
        )
      : frequentAssistants;

    // 按 category 分组
    const groupedData = filteredAssistants.reduce((acc, assistant) => {
      const category = assistant.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(assistant);
      return acc;
    }, {} as Record<string, IAssistantMeta[]>);

    // 转换为树形结构
    const treeData = Object.entries(groupedData).map(([category, items], index) => ({
      key: `group-${index}`,
      type: 'group',
      label: ASSISTANT_CATEGORIES.find((f) => f.id === category)?.name || '其它',
      children: items.map((item) => ({
        key: item.id,
        label: item.title,
        data: item,
      })),
    }));
    return treeData;
  }, [frequentAssistants, searchText]);

  return {
    frequentAssistants: treeData,
  };
};
