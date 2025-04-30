import { IChatWindowConfig } from '@/chat-window/types';
import { TComposedContexts } from '@/chat-message/types';
import { getAgentsData } from '../../../../glob-state/agent';

export const composeAgentsMsg = async (params: { agentIds: IChatWindowConfig['agentIds'] }) => {
  const { agentIds } = params;

  const results: TComposedContexts = [];

  if (agentIds?.length) {
    const agentsData = await getAgentsData();

    agentIds.forEach((id) => {
      const agent = agentsData.getCellValueSync(id);

      if (!agent) return;

      results.push({
        role: 'system',
        content: agent.config?.systemRole,
      });
    });
  }

  return results;
};
