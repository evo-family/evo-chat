import { IDepManager } from '../types/common';

export interface IMCPManagerOptions {
  depManager: IDepManager;
}
export class MCPManager {
  constructor(options: IMCPManagerOptions) {}
}
