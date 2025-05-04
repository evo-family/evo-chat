import { IMcpTool } from '@evo/types';
import { getSystemPrompt } from './prompt';
import { McpBridgeFactory } from '@evo/platform-bridge';

/**
 * 获取所有的MCP的prompt
 * @param mcpIds
 * @param userPrompt
 * @returns
 */
export const getMcpPrompt = async (params: { mcpIds: string[]; userPrompt?: string }) => {
  const { mcpIds, userPrompt } = params;
  try {
    const toolsList = await Promise.all(
      mcpIds.map(async (mcpId) => {
        const toolsResult = await McpBridgeFactory.getInstance().getTools({
          mcpId,
          options: {
            enable: true,
            removeInputSchemaKeys: ['$schema'],
          },
        });
        return toolsResult.success ? toolsResult.data : [];
      })
    );

    const allTools = toolsList.flat().filter(Boolean);

    if (!allTools.length) {
      return null;
    }
    const systemPrompt = getSystemPrompt(userPrompt!, allTools as IMcpTool[]);
    return systemPrompt;
  } catch (error) {
    return null;
  }
};
