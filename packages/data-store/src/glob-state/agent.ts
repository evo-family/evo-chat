import { persistenceTissue, persistenceTissueSync } from '@evo/utils';

import { IAssistant } from '@evo/types';

const AGENT_CACHE_KEY = `__agent_cache_key__`;

export const agentsData = persistenceTissueSync<Record<string, IAssistant>>(AGENT_CACHE_KEY);

export const agentsDataInit = persistenceTissue<Record<string, IAssistant>>(AGENT_CACHE_KEY);

const initOrDiffAgentData = async () => {
  try {
    // 初始化并与本地缓存数据进行比较和修正
    const [cacheTissue, result] = await Promise.all([
      agentsDataInit,
      import('../constants/agent/agents.json'),
    ]);

    if (!result?.default?.length) return;

    const uniqueMap = new Map<string, any>();

    (result.default as unknown as IAssistant[]).forEach((item) => {
      if (uniqueMap.has(item.identifier)) {
        console.warn('agents.json 中 identifier 不能重复', item);
      } else {
        uniqueMap.set(item.identifier, item);
      }

      const existValue = cacheTissue.getCellValueSync(item.identifier);

      if (existValue) {
        const existHash = JSON.stringify(existValue);
        const curHash = JSON.stringify(item);

        if (existHash !== curHash) {
          cacheTissue.setCellValueSync(item.identifier, item);
        }
      } else {
        cacheTissue.setCellValueSync(item.identifier, item);
      }
    });

    uniqueMap.clear();
  } catch (error) {
    console.error(error);
  }
};

agentsDataInit.then((cacheTissue) => {
  // 如果缓存数据为空，立即进行初始化，如果不为空，延迟2秒后进行diff操作.（减少首屏初始化的压力）
  if (cacheTissue.getCellsValue({ all: true }).array.length) {
    setTimeout(initOrDiffAgentData, 2e3);
  } else {
    initOrDiffAgentData();
  }
});
