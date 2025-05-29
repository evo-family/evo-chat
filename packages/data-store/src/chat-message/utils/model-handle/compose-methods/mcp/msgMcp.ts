import { IModelConnRecord, TComposedContexts } from '@/chat-message/types';

import { XMLBuilder } from 'fast-xml-parser';

const builder = new XMLBuilder({
  ignoreAttributes: false,
});

export const transMcpExecuteToXML = (params: {
  executeRecord: IModelConnRecord['mcpInfo']['executeRecords'][0];
}) => {
  const { executeRecord } = params;

  const toolUse = builder.build({
    tool_use: {
      mcp_id: executeRecord.mcp_id,
      name: executeRecord.tool_name,
      arguments: JSON.stringify(executeRecord.arguments),
    },
  });
  const toolUseResult = builder.build({
    tool_use_result: {
      mcp_id: executeRecord.mcp_id,
      name: executeRecord.tool_name,
      result: executeRecord.result?.content.map((data) => data.text).join(',') ?? '',
    },
  });

  return { toolUse, toolUseResult };
};
