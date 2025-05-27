import { IMessageConfig, TModelAnswer } from '@/chat-message/types';

import { ChatCompletionMessageParam } from 'openai/resources.mjs';
import { ChatOptions } from '@evo/utils';
import { IComposeModelContextParams } from './types';
import { composeAgentsMsg } from './compose-methods/agent';
import { composeAttachment } from './compose-methods/attachment';
import { composeHistoryMsg } from './compose-methods/histroyMsg';
import { composeMcpTools } from './compose-methods/mcp/mcp';
import { composeUserMsg } from './compose-methods/user';
import { modelProcessor } from '@/processor/model-processor';

export const composeModelConnContext = async (
  params: IComposeModelContextParams
): Promise<{
  composeMessages: ChatCompletionMessageParam[];
  chatOptions: Omit<ChatOptions, 'stream'>;
}> => {
  const {
    msgConfig,
    answerConfig,
    composedContexts,
    historyMessages = [],
    knowledgeIds,
    agentIds,
    mcpExecuteMode,
    mcpToolsOptions,
  } = params;
  const { attachFileInfos } = msgConfig;

  // 使用模型参数
  const modelParams = modelProcessor.modelParams.get();
  const { context_count } = modelParams;
  const chatOptions: ChatOptions = {};

  const [lastContext, agentContext, attachContext, userContext, mcpToolsResult] = await Promise.all(
    [
      composeHistoryMsg(historyMessages, { context_count, mcpExecuteMode }),
      composeAgentsMsg({ agentIds }),
      composeAttachment({ fileInfos: attachFileInfos }),
      composeUserMsg({ answerConfig, knowledgeIds, mcpExecuteMode }),
      composeMcpTools({ mcpToolsOptions, mcpExecuteMode }),
    ]
  );

  const composeMessages: ChatCompletionMessageParam[] = (composedContexts ?? []).concat(
    agentContext,
    mcpToolsResult.composeResult,
    lastContext,
    attachContext,
    userContext
  );

  chatOptions.tools = mcpToolsResult.mcpTools;

  return { composeMessages, chatOptions };
};
