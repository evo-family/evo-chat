import { McpBridgeFactory } from '@evo/platform-bridge';
import { IMcpCategoryMeta, IMcpMeta } from '@evo/types';
import { useRequest } from 'ahooks';
import { useMemo } from 'react';

const cacheKey = 'get-mcp-list';

export interface IGroupedMcp {
  category: IMcpCategoryMeta;
  mcps: IMcpMeta[];
}

export const useMcpLogic = (params?: { searchText?: string }) => {
  const { data, loading, run } = useRequest(
    async () => {
      return await Promise.all([
        McpBridgeFactory.getInstance().getCategoryList(),
        McpBridgeFactory.getInstance().getMcpList(),
      ]);
    },
    {
      manual: false, // 自动执行
      cacheKey: cacheKey, // 缓存的键名
      cacheTime: 500,
    }
  );

  const categoryList = data?.[0]?.data || [];
  const mcpList = data?.[1]?.data || [];

  // 按分类分组的 MCP 数据，返回数组形式
  const groupedMcps = useMemo(() => {
    const result: IGroupedMcp[] = categoryList.map((category) => ({
      category,
      mcps: mcpList.filter((mcp) => mcp.categoryId === category.id),
    }));

    return result;
  }, [mcpList, categoryList]);

  return {
    mcpList,
    categoryList,
    groupedMcps,
    loading,
    refresh: run,
  };
};
