import { useLayoutEffect, useMemo, useState } from 'react';

import { IAssistant } from '@evo/types';
import { agentsData } from '../../glob-state/agent';

export const useAgentLogic = (params: { searchText: string; selectedTag: string }) => {
  const { searchText, selectedTag } = params;

  const [agents, setAgents] = useState<IAssistant[]>([]);

  // 收集所有不重复的标签并按使用频率排序
  const tags = useMemo(() => {
    const tagCount = new Map<string, number>();

    // 统计每个标签的使用次数
    agents.forEach((agent) => {
      agent.meta.tags?.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });

    // 将标签按使用频率排序
    const sortedTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);

    // 取前12个标签，其余放入"其他"类别
    const topTags = sortedTags.slice(0, 12);
    const hasOtherTags = sortedTags.length > 12;

    return ['全部', ...topTags, ...(hasOtherTags ? ['其他'] : [])];
  }, [agents]);

  // 修改过滤逻辑以支持"其他"类别
  const filteredAgents = useMemo(() => {
    if (!searchText && !selectedTag) {
      return agents;
    }

    return agents.filter((agent) => {
      const searchLower = searchText.toLowerCase();
      const matchSearch = agent.meta.title.toLowerCase().includes(searchLower);
      const matchDescription = agent.meta.description.toLowerCase().includes(searchLower);
      let matchTag = selectedTag === '全部';

      if (!matchTag) {
        if (selectedTag === '其他') {
          // 对于"其他"类别，只显示标签不在前15个中的助手
          matchTag = agent.meta.tags?.every((tag) => !tags.slice(1, -1).includes(tag)) ?? false;
        } else {
          matchTag = agent.meta.tags?.includes(selectedTag) ?? false;
        }
      }

      return (matchSearch || matchDescription) && matchTag;
    });
  }, [searchText, selectedTag, tags, agents]);

  useLayoutEffect(() => {
    agentsData.globListen(
      (signal) => {
        setAgents(agentsData.getCellsValue({ all: true, getArray: true }).array as IAssistant[]);
      },
      { immediate: true, debounceTime: 20 }
    );
  }, [agentsData]);

  return { tags, agents, filteredAgents };
};
