import { IModelConnRecord, TComposedContexts } from '@/chat-message/types';

import { XMLBuilder } from 'fast-xml-parser';

export const transMcpExecuteResultToXML = (params: {
  executeRecords: IModelConnRecord['mcpInfo']['executeRecords'];
}): string => {
  const { executeRecords } = params;
  let result = '';

  if (!executeRecords.length) return result;

  const builder = new XMLBuilder({
    ignoreAttributes: false,
  });

  result = executeRecords
    .map((item) =>
      builder.build({
        tool_use_result: {
          mcp_id: item.mcp_id,
          name: item.tool_name,
          result: item.result?.content.map((data) => data.text).join(',') ?? '',
        },
      })
    )
    .join('\n');

  return result;
};
