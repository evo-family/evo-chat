import { EMCPExecuteMode, IMcpTool } from '@evo/types';

import { ChatOptions } from '@evo/utils';
import { IMcpToolsOptions } from '../../mcp';
import { McpBridgeFactory } from '@evo/platform-bridge';
import { TComposedContexts } from '@/chat-message/types';
import { getSystemPrompt } from './prompt';

/**
 * 获取所有的MCP的prompt
 * @param mcpIds
 * @param userPrompt
 * @returns
 */
export const composeMcpTools = async (params: {
  mcpToolsOptions?: IMcpToolsOptions;
  mcpExecuteMode?: EMCPExecuteMode;
  userPrompt?: string;
}): Promise<{ composeResult: TComposedContexts; mcpTools: ChatOptions['tools'] }> => {
  const { mcpToolsOptions, mcpExecuteMode, userPrompt } = params;
  const composeResult: TComposedContexts = [];
  const mcpTools: ChatOptions['tools'] = [];

  if (!mcpToolsOptions?.mcpTools?.length) {
    return { composeResult, mcpTools: mcpTools.length ? mcpTools : undefined };
  }

  if (mcpExecuteMode === EMCPExecuteMode.COMPATIBLE) {
    mcpToolsOptions.mcpTools.forEach((config) => {
      composeResult.push({
        role: 'system',
        content: getSystemPrompt(userPrompt!, config.tools, config.mcpId),
      });
    });
  } else {
    mcpToolsOptions.mcpTools.forEach((config) => {
      config.tools.forEach((tool) => {
        mcpTools.push({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
          },
        });
      });
    });
  }

  return { composeResult, mcpTools: mcpTools.length ? mcpTools : undefined };
};
