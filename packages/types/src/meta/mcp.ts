import { IBaseMeta } from '../common';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export interface IMcpCategoryMeta extends IBaseMeta {
  userId: string;
  name: string;
  description?: string;
}

export interface IMcpStdioConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  packageRegistry?: string;
}

export interface IMcpSseConfig {
  url: string;
  headers: Record<string, string>;
}

export type IMcpConfig = IMcpStdioConfig | IMcpSseConfig;

export interface IMcpMeta extends IBaseMeta {
  userId: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  type: EMcpType;
  config: string;
  closeTools: string;
  enable: number;
}

export enum EMcpType {
  STDIO = 'stdio',
  SSE = 'sse',
  STREAMABLEHTTP = 'streamableHttp',
}

export interface IMcpTool extends Tool {
  /**
   * toolId临时生成用
   */
  toolId?: string;
  serverId: string;
  serverName: string;
}

export interface IMCPToolResultContent {
  type: 'text' | 'image' | 'audio' | 'resource';
  text?: string;
  data?: string;
  mimeType?: string;
  resource?: {
    uri?: string;
    text?: string;
    mimeType?: string;
  };
}

export interface IMCPCallToolResponse {
  content: IMCPToolResultContent[];
  isError?: boolean;
}
