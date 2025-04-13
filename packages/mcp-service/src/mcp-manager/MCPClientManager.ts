import { BaseResult, EMcpType, IMcpConfig, IMcpMeta, IMcpStdioConfig } from '@evo/types';
import { ResultUtil } from '@evo/utils';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { IDepManager } from '../types/common';
import { getCommandPath } from '../utils/cliCheck';
import { ErrorCode, McpError } from '../utils/errors';
import { getCommandArgs, getCommandEnv } from '../utils/mcp';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export interface IMCPClientManagerOptions {
  depManager: IDepManager;
  version?: string;
}

export class MCPClientManager {
  private appVersion: string;
  private clients: Map<string, Client>;
  private depManager: IDepManager;

  constructor(options: IMCPClientManagerOptions) {
    const { version, depManager } = options;
    this.depManager = depManager;
    this.clients = new Map();
    this.appVersion = version!;
  }

  private async getMcpInfo(mcpId: string): Promise<IMcpMeta> {
    const mcpData = await this.depManager.MCPManager.getById(mcpId);
    if (mcpData.success) {
      return mcpData.data!;
    }
    throw new McpError(ErrorCode.MCP_NOT_FOUND);
  }

  async startClient(mcpId: string): Promise<BaseResult<Client>> {
    try {
      const mcp = await this.getMcpInfo(mcpId);
      const isRun = await this.isClientRunning(mcp.id);
      if (isRun?.data) {
        return ResultUtil.success(this.clients.get(mcp.id)!);
      }

      const client = new Client({ name: 'evo chat', version: this.appVersion || '1.0.0' });

      let transport: StdioClientTransport | SSEClientTransport;

      const config = JSON.parse(mcp.config);

      if (mcp.type.toLowerCase() === EMcpType.STDIO) {
        const currConfig = config as IMcpStdioConfig;
        const command = await getCommandPath(currConfig.command);
        if (!command) {
          return ResultUtil.error(new McpError(ErrorCode.MCP_COMMAND_NOT_FOUND));
        }
        transport = new StdioClientTransport({
          command: command!,
          args: getCommandArgs(config),
          env: getCommandEnv(config),
        });
        console.log('evo-conn-info, ', {
          command: command!,
          args: getCommandArgs(config),
          env: getCommandEnv(config),
        });
      }

      if (mcp.type === EMcpType.SSE) {
        transport = new SSEClientTransport(new URL(''));
      }

      await client.connect(transport!);

      this.clients.set(mcp.id, client);

      return ResultUtil.success(client);
    } catch (e) {
      console.error(e);
      return ResultUtil.error(e);
    }
  }

  /**
   * 获取当前mcp tools
   * @param mcp
   * @returns
   */
  async getTools(mcpId: string): Promise<BaseResult<Tool[]>> {
    try {
      const mcp = await this.getMcpInfo(mcpId);
      const client = (await this.startClient(mcp.id))?.data!;
      const toolsResult = await client.listTools();
      return ResultUtil.success(toolsResult.tools);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async stopClient(mcpId: string): Promise<BaseResult<boolean>> {
    try {
      const client = this.clients.get(mcpId);
      if (!client) {
        return ResultUtil.error('客户端不存在');
      }

      await client.close();
      this.clients.delete(mcpId);
      return ResultUtil.success(true);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async stopAllClients(): Promise<void> {
    for (const [mcpId] of this.clients) {
      await this.stopClient(mcpId);
    }
  }

  async isClientRunning(mcpId: string): Promise<BaseResult<boolean>> {
    const currClient = this.clients.get(mcpId);
    if (currClient) {
      const pingResult = await currClient.ping();
      if (pingResult) {
        return ResultUtil.success(true);
      }
      this.clients.delete(mcpId);
    }
    return ResultUtil.success(false);
  }

  getClientCount(): number {
    return this.clients.size;
  }
}
