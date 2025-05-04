import { IChatWindowConfig } from '@/chat-window/types';
import { TComposedContexts } from '@/chat-message/types';
import { getAssistantPrompts } from '../../../../utils/assistant';

export const composeAgentsMsg = async (params: { agentIds: IChatWindowConfig['agentIds'] }) => {
  const { agentIds } = params;

  const results: TComposedContexts = [];

  const prompts = await getAssistantPrompts(agentIds!);
  if (prompts?.length) {
    prompts.forEach((prompt) => {
      results.push({
        role: 'system',
        content: prompt,
      });
    });
  }
  return results;
};
