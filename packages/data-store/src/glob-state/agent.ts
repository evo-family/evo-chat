import { IAssistant } from '@evo/types';
import { persistenceTissue, persistenceTissueSync } from '@evo/utils';

const AGENT_CACHE_KEY = `__agent_cache_key__`;

export const agentsData = persistenceTissueSync<Record<string, IAssistant>>(AGENT_CACHE_KEY);

export const gentsDataInit = persistenceTissue<Record<string, IAssistant>>(AGENT_CACHE_KEY);

const deferExecution = (callback: () => void) => {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(callback);
  } else if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(callback);
  } else {
    setTimeout(callback, 0);
  }
};

deferExecution(async () => {
  try {
    // 初始化并与本地缓存数据进行比较和修正
    const [cacheTissue, result] = await Promise.all([
      gentsDataInit,
      import('../constants/agent/agents.json'),
    ]);

    if (!result?.default?.length) return;

    const unicodeMap = new Map<string, any>();

    (result.default as unknown as IAssistant[]).forEach((item) => {
      if (unicodeMap.has(item.identifier)) {
        console.warn('agents.json 中 identifier 不能重复', item);
      } else {
        unicodeMap.set(item.identifier, item);
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

    unicodeMap.clear();
  } catch (error) {
    console.error(error);
  }
});
