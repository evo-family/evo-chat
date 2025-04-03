import { IMessageConfig, TComposedContexts } from '@/chat-message/types';

import { IChatWindowConfig } from '@/chat-window/types';
import { KnowledgeBridgeFactory } from '@evo/platform-bridge';

export const composeUserMsg = async (params: {
  knowledgeIds: IChatWindowConfig['knowledgeIds'];
  msgConfig: IMessageConfig;
}): Promise<TComposedContexts> => {
  const { knowledgeIds, msgConfig } = params;
  const { sendMessage } = msgConfig;

  // 如果不使用知识库，直接返回基本user消息
  if (!knowledgeIds?.length)
    return [
      {
        role: 'user',
        content: sendMessage,
      },
    ];

  // 如果使用了知识库，则需要查询知识库提取向量，并通过提问模板生成最终的user消息
  try {
    const knowledgeService = KnowledgeBridgeFactory.getKnowledge();

    const knowledgeResults = await Promise.all(
      knowledgeIds.map(async (knowledgeId) => {
        const data = await knowledgeService.searchVectors({
          knowledgeId,
          searchValue: sendMessage,
        });

        if (!data.success) return '';

        return data.data?.map((item) => item.pageContent)?.join('\n---\n') ?? '';
      })
    );

    return [
      {
        role: 'user',
        content: `Please answer the question based on the reference materials

## Citation Rules:
- Please cite the context at the end of sentences when appropriate.
- Please use the format of citation number [number] to reference the context in corresponding parts of your answer.
- If a sentence comes from multiple contexts, please list all relevant citation numbers, e.g., [1][2]. Remember not to group citations at the end but list them in the corresponding parts of your answer.

## My question is:

${sendMessage}

## Reference Materials:

${knowledgeResults?.join('\n---\n')},

Please respond in the same language as the user's question.
`,
      },
    ];
  } catch (error) {
    console.error(error);
    return [];
  }
};
