export interface IErrorData {
  code: string;
  message: string;
}

export const ErrorCode = {
  MCP_NOT_FOUND: {
    code: 'MCP_NOT_FOUND',
    message: 'MCP 未找到',
  },
  MCP_COMMAND_NOT_FOUND: {
    code: 'MCP_COMMAND_NOT_FOUND',
    message: 'MCP启动命令没找到',
  },
  MCP_CONFIG_INVALID: {
    code: 'MCP_CONFIG_INVALID',
    message: 'MCP 配置无效',
  },
  MCP_START_FAILED: {
    code: 'MCP_START_FAILED',
    message: 'MCP 启动失败',
  },
  MCP_STOP_FAILED: {
    code: 'MCP_STOP_FAILED',
    message: 'MCP 停止失败',
  },
  OPERATION_ERROR: {
    code: 'OPERATION_ERROR',
    message: '操作失败',
  },
} as const;

export class McpError extends Error {
  constructor(public error: IErrorData, public details?: Record<string, any>) {
    super(error.message);
    this.name = 'McpError';
  }
}
