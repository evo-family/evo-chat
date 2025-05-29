import { ChatResponse, DataCell } from '@evo/utils';
import {
  EMCPExecuteStatus,
  EModalConnStatus,
  IMCPExecuteRecord,
  IModelConnRecord,
  TModelAnswerCell,
} from '@/chat-message/types';

import { EMCPExecuteMode } from '@evo/types';
import { IMcpToolsOptions } from './mcp';
import { IModelConnParams } from './types';
import { XMLParser } from 'fast-xml-parser';

const updateReasoningTimestamps = (
  curData: IModelConnRecord,
  deltaContent?: string | null,
  deltaReasoningContent?: string
) => {
  // 首次接收思维链
  if (deltaReasoningContent && !curData.startReasoningTime) {
    curData.startReasoningTime = +Date.now();
  }

  // 思维链结束
  if (deltaContent && curData.startReasoningTime && !curData.endReasoningTime) {
    curData.endReasoningTime = +Date.now();
  }
};

export const defaultStreamResolver = async (
  params: {
    stream: ChatResponse<true>;
    connResult: IModelConnRecord;
    mcpToolsOptions?: IMcpToolsOptions;
    mcpExecuteMode?: EMCPExecuteMode;
  } & Pick<IModelConnParams, 'onResolve'>
) => {
  const { stream, connResult, mcpToolsOptions, mcpExecuteMode, onResolve } = params;

  const mcpExeRecord: Array<{
    name: string;
    arguments: string | undefined;
  }> = [];

  for await (const content of stream) {
    const { usage, choices } = content;

    // 更新接收状态
    if (connResult.status === EModalConnStatus.PENDING) {
      connResult.status = EModalConnStatus.RECEIVING;
    }

    // 处理每个选项的内容
    choices.forEach((choice) => {
      const {
        content: deltaContent,
        // @ts-ignore
        reasoning_content: deltaReasoningContent,
        tool_calls,
      } = choice.delta;

      if (deltaContent) connResult.content += deltaContent;
      if (deltaReasoningContent) connResult.reasoning_content += deltaReasoningContent;

      updateReasoningTimestamps(connResult, deltaContent, deltaReasoningContent);

      if (tool_calls?.length) {
        tool_calls.forEach((toolCall) => {
          const { index, function: toolFunction } = toolCall;
          const functionName = toolFunction?.name;
          const functionArguments = toolFunction?.arguments;

          if (functionName) {
            mcpExeRecord.push({
              name: functionName,
              arguments: functionArguments,
            });
          } else if (functionArguments) {
            const target = mcpExeRecord[index];

            if (target) {
              target.arguments += functionArguments;
            }
          }
        });
      }
    });

    // 更新使用量统计
    if (usage) {
      connResult.usage = usage;
    }

    onResolve?.(connResult);
  }

  if (mcpExecuteMode === EMCPExecuteMode.COMPATIBLE) {
    const parser = new XMLParser({
      ignoreAttributes: false,
    });

    const mcpExecuteParams = parser.parse(connResult.content);
    const tool_user = mcpExecuteParams?.tool_use;

    if (tool_user) {
      // 清理后的内容（移除所有 tool_use 标签）
      connResult.content = connResult.content.replace(/<tool_use>[\s\S]*?<\/tool_use>/g, '');

      const validToolUser = Array.isArray(tool_user) ? tool_user : [tool_user];

      for (const useToolInfo of validToolUser) {
        const parseAguments = JSON.parse(useToolInfo.exe_param);
        const mappingTarget = mcpToolsOptions?.fakeNameMapping[useToolInfo.tool_name];

        if (!mappingTarget) continue;

        const executeRecord: IMCPExecuteRecord = {
          mcp_id: mappingTarget.mcp_id,
          tool_name: mappingTarget.config.name,
          arguments: parseAguments,
          status: EMCPExecuteStatus.PENDING,
        };
        connResult.mcpInfo.executeRecords.push(executeRecord);
      }
    }
  } else {
    mcpExeRecord.forEach((item) => {
      const matchItem = mcpToolsOptions?.fakeNameMapping[item.name];
      if (!matchItem) return;

      connResult.mcpInfo.executeRecords.push({
        mcp_id: matchItem.mcp_id,
        tool_name: matchItem.config.name,
        arguments: JSON.parse(item.arguments ?? ''),
        status: EMCPExecuteStatus.PENDING,
      });
    });
  }

  onResolve?.(connResult);

  console.log('stream resolved result', connResult);

  return connResult;
};
