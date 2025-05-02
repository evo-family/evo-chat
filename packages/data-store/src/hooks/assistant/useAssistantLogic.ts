import { useLayoutEffect, useMemo, useState } from 'react';

import { IAssistantCategory, IAssistantMeta } from '@evo/types';
import { getAssistantsData } from '../../glob-state/assistant';
import { ASSISTANT_CATEGORIES } from '../../constants/assistant/category';

export const useAssistantLogic = (params: {
  searchText: string;
  selectedCategoryId: IAssistantCategory['id'];
}) => {
  const { searchText, selectedCategoryId } = params;

  const [assistants, setAssistants] = useState<IAssistantMeta[]>([]);

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

  useLayoutEffect(() => {
    let cleanUpHandler: undefined | (() => any) = undefined;
    let unmounted = false;

    getAssistantsData().then((assistantsData) => {
      if (unmounted) return;

      const subscription = assistantsData.globListen(
        (signal) => {
          const list = assistantsData.getCellsValue({ all: true, getArray: true })
            .array as IAssistantMeta[];

          const sortList = list.sort((a, b) => {
            const timeA = new Date(a.createTime || 0).getTime();
            const timeB = new Date(b.createTime || 0).getTime();
            return timeB - timeA; // 倒序排序
          });

          setAssistants(sortList);
        },
        { immediate: true, debounceTime: 100 }
      );

      cleanUpHandler = () => subscription.unsubscribe();
    });

    return () => {
      unmounted = true;
      cleanUpHandler && cleanUpHandler();
    };
  }, [getAssistantsData]);

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
