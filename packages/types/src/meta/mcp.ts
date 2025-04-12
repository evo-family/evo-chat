import { IBaseMeta } from '../common';

export interface IMcpCategoryMeta extends IBaseMeta {
  userId: string;
  name: string;
  description?: string;
}

export interface IMcpMeta extends IBaseMeta {
  userId: string;
  name: string;
  description?: string;
  categoryId: string;
  type: EMcpType;
  runCommand: string;
}

export enum EMcpType {
  STUDIO = 'Stdio',
  SSE = 'sse',
}
