import { StateTissue, persistenceTissue } from '@evo/utils';

import { IAssistant } from '@evo/types';

const AGENT_CACHE_KEY = `__agent_cache_key__`;

let initAgentData: Promise<StateTissue<Record<string, IAssistant>>> | undefined = undefined;

const initOrDiffAgentData = async (cacheTissue: StateTissue<Record<string, IAssistant>>) => {
  try {
    // 初始化并与本地缓存数据进行比较和修正
    const result = await import('../constants/agent/agents.json');

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

// 惰性初始化数据，减少首屏加载压力
export const getAgentsData = () => {
  if (!initAgentData) {
    initAgentData = persistenceTissue<Record<string, IAssistant>>(AGENT_CACHE_KEY).then(
      async (cacheTissue) => {
        // 如果缓存数据为空，立即进行初始化，如果不为空，延迟2秒后进行diff操作.（减少首屏初始化的压力）
        if (cacheTissue.getCellsValue({ all: true }).array.length) {
          setTimeout(() => initOrDiffAgentData(cacheTissue), 2e3);
        } else {
          await initOrDiffAgentData(cacheTissue);
        }

        return cacheTissue;
      }
    );
  }

  return initAgentData;
};
