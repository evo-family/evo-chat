import { useMemo } from 'react';
import { useMcpLogic } from './useMcpLogic';

export const useMcpOptions = () => {
  const { groupedMcps } = useMcpLogic();

  // 转换为 Antd Select 的 options 数据结构
  const mcpOptions = useMemo(() => {
    return groupedMcps.map((group) => ({
      label: group.category.name,
      value: group.category.id,
      options: group.mcps.map((mcp) => ({
        label: mcp.name,
        value: mcp.id,
      })),
    }));
  }, [groupedMcps]);

  return {
    mcpOptions,
  };
};
