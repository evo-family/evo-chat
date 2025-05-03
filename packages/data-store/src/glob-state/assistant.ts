import { IAssistantMeta } from '@evo/types';
import { StateTissue, persistenceTissue } from '@evo/utils';

const ASSISTANT_CACHE_KEY = `__assistant_cache_key__`;

let initAssistantData: Promise<StateTissue<Record<string, IAssistantMeta>>> | undefined = undefined;

const initOrDiffAssistantData = async (
  cacheTissue: StateTissue<Record<string, IAssistantMeta>>
) => {
  try {
    // 初始化并与本地缓存数据进行比较和修正
    const result = await import('../constants/assistant/assistant.json');

    if (!result?.default?.length) return;

    const uniqueMap = new Map<string, any>();

    (result.default as unknown as []).forEach((item: IAssistantMeta) => {
      if (uniqueMap.has(item.id)) {
        console.warn('assistant.json 中 identifier 不能重复', item);
      } else {
        uniqueMap.set(item.id, item);
      }

      const existValue = cacheTissue.getCellValueSync(item.id);

      if (existValue) {
        // 排除一些不需要比较的属性
        const compareValue = (obj: any) => {
          const { isFrequent, ...rest } = obj;
          return JSON.stringify(rest);
        };
        
        const existHash = compareValue(existValue);
        const curHash = compareValue(item);

        if (existHash !== curHash) {
          // 保留原有的 isFrequent 状态
          cacheTissue.setCellValueSync(item.id, {
            ...item,
            isFrequent: existValue?.isFrequent || false,
          });
        }
      } else {
        cacheTissue.setCellValueSync(item.id, item);
      }
    });

    uniqueMap.clear();
  } catch (error) {
    console.error(error);
  }
};

// 惰性初始化数据，减少首屏加载压力
export const getAssistantsData = () => {
  if (!initAssistantData) {
    initAssistantData = persistenceTissue<Record<string, IAssistantMeta>>(ASSISTANT_CACHE_KEY).then(
      async (cacheTissue) => {
        // 如果缓存数据为空，立即进行初始化，如果不为空，延迟2秒后进行diff操作.（减少首屏初始化的压力）
        if (cacheTissue.getCellsValue({ all: true }).array.length) {
          setTimeout(() => initOrDiffAssistantData(cacheTissue), 2e3);
        } else {
          await initOrDiffAssistantData(cacheTissue);
        }

        return cacheTissue;
      }
    );
  }

  return initAssistantData;
};
