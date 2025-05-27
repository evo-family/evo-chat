import { IMcpTool } from '@evo/types';
import { McpBridgeFactory } from '@evo/platform-bridge';

export interface IMcpToolsOptions {
  fakeToolNames: string[];
  fakeNameMapping: Record<
    string,
    {
      config: IMcpTool;
      mcp_id: string;
    }
  >;
  mcpTools: Array<{
    mcpId: string;
    tools: IMcpTool[];
    originalTools: IMcpTool[];
  }>;
}

export const getMcpTools = async (mcpIds: string[]): Promise<IMcpToolsOptions> => {
  const mcpTools: IMcpToolsOptions['mcpTools'] = [];
  let funcNameCount = 1;
  const fakeToolNames: IMcpToolsOptions['fakeToolNames'] = [];
  const fakeNameMapping: IMcpToolsOptions['fakeNameMapping'] = {};

  await Promise.all(
    (mcpIds ?? []).map(async (mcpId) => {
      const toolsResult = await McpBridgeFactory.getInstance().getTools({
        mcpId,
        options: {
          enable: true,
          removeInputSchemaKeys: ['$schema'],
        },
      });

      if (toolsResult.success && toolsResult.data) {
        const tools = toolsResult.data as unknown as IMcpTool[];
        const rebuildTools = tools.map((tool) => {
          const fakeName = `func_${funcNameCount++}`;
          const rebuildConfig = {
            ...tool,
            name: fakeName,
          };

          fakeToolNames.push(fakeName);
          fakeNameMapping[fakeName] = {
            mcp_id: mcpId,
            config: tool,
          };

          return rebuildConfig;
        });

        mcpTools.push({
          mcpId,
          tools: rebuildTools,
          originalTools: tools,
        });
      }
    })
  );

  return { mcpTools, fakeToolNames, fakeNameMapping };
};
