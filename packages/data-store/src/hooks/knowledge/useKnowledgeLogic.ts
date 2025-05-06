import { KnowledgeBridgeFactory } from '@evo/platform-bridge';
import { useRequest } from 'ahooks';
import { useMemo, useState } from 'react';

const cacheKey = 'get-knowledge-list';

export const useKnowledgeLogic = (params?: { searchText?: string }) => {
  const { searchText } = params || {};

  const { data, loading, run } = useRequest(
    async () => {
      return await Promise.all([KnowledgeBridgeFactory.getKnowledge().getList()]);
    },
    {
      manual: false, // 自动执行
      cacheKey: cacheKey, // 缓存的键名
      cacheTime: 500,
    }
  );

  const knowledgeList = data?.[0]?.data || [];

  const filteredKnowledgeList = useMemo(() => {
    if (!searchText) {
      return knowledgeList;
    }

    return knowledgeList.filter((item) => {
      const searchLower = searchText.toLowerCase();
      const matchSearch = item.name.toLowerCase().includes(searchLower);

      return matchSearch;
    });
  }, [searchText, knowledgeList]);

  return {
    knowledgeList,
    filteredKnowledgeList,
    loading,
    refresh: run,
  };
};
