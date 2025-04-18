import { IBaseMeta } from '../common';

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
}
