import {
  IMessageConfig,
  IModelConnRecord,
  TComposedContexts,
  TModelAnswer,
} from '@/chat-message/types';

import { EMCPExecuteMode } from '@evo/types';
import { IChatWindowConfig } from '@/chat-window/types';
import { KnowledgeBridgeFactory } from '@evo/platform-bridge';
import { pickMcpFunctionCallMsg } from './histroyMsg';

const composeKnowledgeContent = async (params: {
  knowledgeIds: IChatWindowConfig['knowledgeIds'];
  sendContent: string;
}): Promise<string> => {
  const { knowledgeIds, sendContent } = params;

  if (!knowledgeIds?.length) return sendContent;

  // 如果使用了知识库，则需要查询知识库提取向量，并通过提问模板生成最终的user消息
  try {
    const knowledgeService = KnowledgeBridgeFactory.getKnowledge();

    const knowledgeResults = await Promise.all(
      knowledgeIds.map(async (knowledgeId) => {
        const data = await knowledgeService.searchVectors({
          knowledgeId,
          searchValue: sendContent,
        });

        if (!data.success) return '';

        return data.data?.map((item) => item.pageContent)?.join('\n---\n') ?? '';
      })
    );

    return `Please answer the question based on the reference materials

## Citation Rules:
- Please cite the context at the end of sentences when appropriate.
- Please use the format of citation number [number] to reference the context in corresponding parts of your answer.
- If a sentence comes from multiple contexts, please list all relevant citation numbers, e.g., [1][2]. Remember not to group citations at the end but list them in the corresponding parts of your answer.

## My question is:

${sendContent}

## Reference Materials:

${knowledgeResults?.join('\n---\n')},

Please respond in the same language as the user's question.
`;
  } catch (error) {
    console.error(error);

    return sendContent;
  }
};

export const composeUserMsg = async (params: {
  knowledgeIds: IChatWindowConfig['knowledgeIds'];
  answerConfig: TModelAnswer;
  mcpExecuteMode?: EMCPExecuteMode;
}): Promise<TComposedContexts> => {
  const { knowledgeIds, answerConfig, mcpExecuteMode } = params;
  const { histroy } = answerConfig;
  const latestRecord = histroy.at(-1);

  if (!latestRecord) return [];
  const { chatTurns } = latestRecord;

  if (!chatTurns?.length) return [];

  const [firstTurnItem, ...restTurnItems] = chatTurns;
  const userSendContent = firstTurnItem.sendMessage;
  const composeResult: TComposedContexts = [
    {
      role: 'user',
      content: await composeKnowledgeContent({ knowledgeIds, sendContent: userSendContent }),
    },
  ];

  pickMcpFunctionCallMsg(firstTurnItem, { composeResult, mcpExecuteMode, skipSendMessage: true });

  restTurnItems.forEach((turnItem) => {
    pickMcpFunctionCallMsg(turnItem, { composeResult, mcpExecuteMode });
  });

  return composeResult;
};
