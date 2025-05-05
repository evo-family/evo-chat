import React, { FC, memo } from 'react';
import { ContentPanel } from '../../components';
import { McpProvider } from './mcp-processor/McpProvider';
import { McpList } from './mcp-list/McpList';
import { Toolbar } from './tool-bar/Toolbar';
import { McpMenu } from './mcp-menu/McpMenu';
import { Button, Space } from 'antd';
import { ExportOutlined } from '@ant-design/icons';

export interface IMcpPageContentProps {}

export const McpPageContent: FC<IMcpPageContentProps> = memo(() => {
  const leftContent = (
    <>
      <McpMenu />
    </>
  );

  return (
    <ContentPanel
      title={
        <Space className="app-region-no-drag">
          <span>MCP服务</span>
          <Button
            href="https://mcp.so/"
            target="_blank"
            icon={<ExportOutlined />}
            color="default"
            variant="link"
            size="small"
          >
            探索更多MCP服务
          </Button>
        </Space>
      }
      subTitle="管理和监控MCP服务状态，支持服务启停和参数配置"
      leftContent={leftContent}
      contentStyle={{ position: 'relative', height: '100%' }}
      contentClassName="mcp-container"
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
