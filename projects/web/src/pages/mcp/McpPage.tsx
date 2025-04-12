import React, { FC, memo } from 'react';
import { ContentPanel } from '../../components';
import { McpProvider, useMcpSelector } from './mcp-processor/McpProvider';
import { McpList } from './mcp-list/McpList';
import { Toolbar } from './tool-bar/Toolbar';

export interface IMcpPageContentProps {}

export const McpPageContent: FC<IMcpPageContentProps> = memo(() => {
  const leftContent = (
    <>
      <McpList />
    </>
  );

  return (
    <ContentPanel
      title="MCP服务"
      subTitle="管理和监控MCP服务状态，支持服务启停和参数配置"
      leftContent={leftContent}
    >
      <Toolbar />
      <McpList />
    </ContentPanel>
  );
});

export const McpPage = memo(() => {
  return (
    <McpProvider>
      <McpPageContent />
    </McpProvider>
  );
});
