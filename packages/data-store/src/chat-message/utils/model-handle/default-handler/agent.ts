import { IChatWindowConfig } from '@/chat-window/types';
import { TComposedContexts } from '@/chat-message/types';
import { agentsData } from '../../../../glob-state/agent';

export const composeAgentsMsg = (params: { agentIds: IChatWindowConfig['agentIds'] }) => {
  const { agentIds } = params;

  const results: TComposedContexts = [];

  agentIds?.forEach((id) => {
    const agent = agentsData.getCellValueSync(id);

    if (!agent) return;

    results.push({
      role: 'system',
      content: agent.config?.systemRole,
    });
  });

  return results;
};
