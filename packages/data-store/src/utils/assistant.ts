import { getAssistantsData } from '../glob-state/assistant';

/**
 * 获取助手提示词
 * @param assistantIds
 * @returns
 */
export const getAssistantPrompts = async (assistantIds: string[]) => {
  const prompts: string[] = [];
  if (assistantIds?.length) {
    const agentsData = await getAssistantsData();

    assistantIds.forEach((id) => {
      const assistant = agentsData.getCellValueSync(id);
      if (assistant?.prompt) {
        prompts.push(assistant.prompt);
      }
    });
  }
  return prompts;
};
