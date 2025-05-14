import { IMcpTool } from '@evo/types';
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
  mcpIds?: string[];
  userPrompt?: string;
}): Promise<TComposedContexts> => {
  const { mcpIds, userPrompt } = params;
  const composeResult: TComposedContexts = [];

  if (!mcpIds?.length) {
    return composeResult;
  }

  await Promise.all(
    mcpIds.map(async (mcpId) => {
      const toolsResult = await McpBridgeFactory.getInstance().getTools({
        mcpId,
        options: {
          enable: true,
          removeInputSchemaKeys: ['$schema'],
        },
      });

      if (toolsResult.success && toolsResult.data) {
        composeResult.push({
          role: 'system',
          content: getSystemPrompt(userPrompt!, toolsResult.data as unknown as IMcpTool[], mcpId),
        });
      }
    })
  );

  return composeResult;
};
