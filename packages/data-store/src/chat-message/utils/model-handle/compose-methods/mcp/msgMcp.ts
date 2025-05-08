import { IModelConnRecord, TComposedContexts } from '@/chat-message/types';

import { XMLBuilder } from 'fast-xml-parser';

export const transMcpExecuteResultToXML = (params: {
  executeResult: IModelConnRecord['mcpInfo']['executeResult'];
}): string => {
  const { executeResult } = params;
  let result = '';

  if (!executeResult.length) return result;

  const builder = new XMLBuilder({
    ignoreAttributes: false,
  });

  result = executeResult
    .map((item) =>
      builder.build({
        tool_use_result: {
          mcp_id: item.mcp_id,
          name: item.name,
          result: item.result.content.map((data) => data.text).join(','),
        },
      })
    )
    .join('\n');

  return result;
};
