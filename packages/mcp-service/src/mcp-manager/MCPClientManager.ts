import {
  BaseResult,
  EMcpType,
  IMCPCallToolResponse,
  IMcpConfig,
  IMcpMeta,
  IMcpSseConfig,
  IMcpStdioConfig,
  IMcpTool,
} from '@evo/types';
import { generateUUID, ResultUtil } from '@evo/utils';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  SSEClientTransport,
  SSEClientTransportOptions,
} from '@modelcontextprotocol/sdk/client/sse.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { IDepManager } from '../types/common';
import { getCommandPath } from '../utils/cliCheck';
import { ErrorCode, McpError } from '../utils/errors';
import { getCommandArgs, getCommandEnv } from '../utils/mcp';
import { getSystemPrompt } from '../utils/prompt';

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

  async startClientByMcpId(mcpId: string): Promise<BaseResult<Client>> {
    const mcp = await this.getMcpInfo(mcpId);
    return this.startClient(mcp, true);
  }

  async startClient(mcp: IMcpMeta, hasCache: boolean = false): Promise<BaseResult<Client>> {
    try {
      // 如果启用缓存，检查是否有运行中的客户端
      if (hasCache) {
        const isRun = await this.isClientRunning(mcp.id);
        if (isRun?.data) {
          return ResultUtil.success(this.clients.get(mcp.id)!);
        }
      } else {
        // 不使用缓存，先停止已存在的客户端
        await this.stopClient(mcp.id);
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
        const currConfig = config as IMcpSseConfig;
        const options: SSEClientTransportOptions = {
          requestInit: {
            headers: currConfig.headers || {},
          },
        };
        transport = new SSEClientTransport(new URL(currConfig.url), options);
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
   * @param enable 是否获取可用的tools
   * @returns
   */
  async getTools(
    mcpId: string,
    options?: {
      enable?: boolean;
      removeInputSchemaKeys?: Array<string>;
    }
  ): Promise<BaseResult<IMcpTool[]>> {
    const { enable, removeInputSchemaKeys = [] } = options || {};
    try {
      const mcp = await this.getMcpInfo(mcpId);
      const startResult = await this.startClientByMcpId(mcp.id);
      if (!startResult.success) {
        return ResultUtil.error(startResult.error);
      }
      const client = startResult?.data!;
      const toolsResult = await client.listTools();

      const unEnableTools = JSON.parse(mcp.closeTools) as any[];

      const toolList = toolsResult?.tools
        ?.map((item) => {
          if (enable && unEnableTools?.includes(item.name)) {
            return null;
          }
          const result = {
            ...item,
            toolId: generateUUID(),
            serverId: mcp.id,
            serverName: mcp.name,
            enable: !unEnableTools?.includes(item.name),
          } as IMcpTool;

          if (removeInputSchemaKeys?.length) {
            removeInputSchemaKeys?.forEach((key) => {
              delete result?.inputSchema?.[key];
            });
          }
          return result;
        })
        .filter(Boolean);

      return ResultUtil.success(toolList as IMcpTool[]);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  /**
   * 获取所有的MCP的prompt
   * @param mcpIds
   * @param userPrompt
   * @returns
   */
  async getMcpPrompt(mcpIds: string[], userPrompt: string): Promise<BaseResult<string>> {
    try {
      const toolsList = await Promise.all(
        mcpIds.map(async (mcpId) => {
          const toolsResult = await this.getTools(mcpId, {
            enable: true,
            removeInputSchemaKeys: ['$schema'],
          });
          return toolsResult.success ? toolsResult.data : [];
        })
      );

      const allTools = toolsList.flat().filter(Boolean);

      if (!allTools.length) {
        return ResultUtil.error('没有可用的工具');
      }
      const systemPrompt = getSystemPrompt(userPrompt, allTools as IMcpTool[]);
      return ResultUtil.success(systemPrompt);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  /**
   * 调用指定 MCP 的工具
   * @param mcpId MCP ID
   * @param name 工具名称
   * @param args 工具参数
   */
  async callTool(
    mcpId: string,
    name: string,
    args: any
  ): Promise<BaseResult<IMCPCallToolResponse>> {
    try {
      const startResult = await this.startClientByMcpId(mcpId);
      if (!startResult.success) {
        return ResultUtil.error(startResult.error);
      }
      const client = startResult.data!;
      const result = (await client.callTool({ name, arguments: args })) as IMCPCallToolResponse;
      return ResultUtil.success(result);
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
