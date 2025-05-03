import { useMemo, useState } from 'react';

import { IAssistantCategory } from '@evo/types';
import { ASSISTANT_CATEGORIES } from '../../constants/assistant/category';
import { useAssistantData } from './useAssistantData';

export const useAssistantLogic = (params: {
  searchText: string;
  selectedCategoryId: IAssistantCategory['id'];
}) => {
  const { searchText, selectedCategoryId } = params;

  const { assistants } = useAssistantData();

  // 修改过滤逻辑以支持"其他"类别
  const filteredAssistants = useMemo(() => {
    if (!searchText && selectedCategoryId === 'all') {
      return assistants;
    }

    return assistants.filter((assistant) => {
      const searchLower = searchText?.toLowerCase?.();
      const matchSearch = assistant.title?.toLowerCase().includes(searchLower);
      const matchDescription = assistant?.description?.toLowerCase().includes(searchLower);

      const matchCategory =
        assistant?.category === selectedCategoryId || selectedCategoryId === 'all';

      return (matchSearch || matchDescription) && matchCategory;
    });
  }, [searchText, selectedCategoryId, assistants]);

  // 计算每个分类的数量
  const categoriesWithCount = useMemo(() => {
    const counts = assistants.reduce((acc, assistant) => {
      acc[assistant.category] = (acc[assistant.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return ASSISTANT_CATEGORIES.map((category) => ({
      ...category,
      count: category.id === 'all' ? assistants.length : counts[category.id] || 0,
    }));
  }, [assistants?.length]);

  return {
    assistants,
    filteredAssistants,
    categories: categoriesWithCount,
  };
};
