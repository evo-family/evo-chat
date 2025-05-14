import { IMessageConfig, TModelAnswer } from '@/chat-message/types';
import { useDebounceFn, useMemoizedFn } from 'ahooks';
import { useRef, useState } from 'react';

import { IChatWindowConfig } from '@/chat-window/types';
import execAll from 'execall';
import { getPersistenceCellDriverIns } from '@evo/utils';
import { useGlobalCtx } from '@/react-context/global';

interface ISearchChatParams {
  keywords: string[];
}

export interface ISearchAnswerResultItem {
  matchText: string;
  answerConfig: TModelAnswer;
  type: 'answer';
}

export interface ISearchMsgResultItem {
  matchText: string;
  msgConfig: IMessageConfig;
  answersResult: Array<ISearchAnswerResultItem>;
  type: 'message';
}

export interface ISearchChatResultItem {
  chatWinId: string;
  chatConfig: IChatWindowConfig;
  title: string;
  matchText: string;
  msgsResult: Array<ISearchMsgResultItem>;
  type: 'chat';
}
const getMatchedRange = (text: string, keywords: string[]) => {
  if (!text || !keywords.length) return null;
  let matchedSomething = false;

  const matches = keywords.map((keyword) => {
    const regex = new RegExp(keyword, 'gi');
    const execResult = execAll(regex, text);

    if (!matchedSomething) {
      matchedSomething = !!execResult.length;
    }

    return execResult;
  });

  // 检查是否有任何匹配结果
  if (!matchedSomething) return null;

  const allKeywordsMatch = matches.every((matchResult) => matchResult.length);

  if (!allKeywordsMatch) return;

  let minStartIndex = Infinity;
  let maxEndIndex = -1;

  matches.forEach((matchResult) => {
    matchResult.forEach((match) => {
      minStartIndex = Math.min(minStartIndex, match.index);
      maxEndIndex = Math.max(maxEndIndex, match.index + match.match.length);
    });
  });

  return {
    range: { start: minStartIndex, end: maxEndIndex },
  };
};

export const useSearchChatContent = () => {
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);

  const [searchResult, setSearchResult] = useState<Array<ISearchChatResultItem>>([]);

  const currentTaskInfo = useRef<{ flag: Symbol }>(undefined);

  const { run: searchChatConent } = useDebounceFn(
    async (params: ISearchChatParams) => {
      let chatSearchResult: ISearchChatResultItem[] = [];

      const curTaskSymbol = Symbol();
      let lastTickTime = Date.now();
      currentTaskInfo.current = { flag: curTaskSymbol };

      try {
        const cellDriver = getPersistenceCellDriverIns();

        if (!cellDriver) return;

        const { keywords } = params;

        if (!keywords?.length) return;

        const winList = await chatCtrl.getWindowList();

        const winTasks = winList.map((winIns) => async () => {
          await winIns.ready();

          const chatConfig = winIns.getConfigState();
          const winTitle = winIns.title.get();

          const msgConfigs = await cellDriver.bulkGet<IMessageConfig>(chatConfig.messageIds);

          const msgSearchResult: ISearchMsgResultItem[] = [];
          const msgTasks = msgConfigs.map(async (msgConfig) => {
            if (!msgConfig) return;

            const asnwers = await cellDriver.bulkGet<TModelAnswer>(msgConfig.answerIds);

            const answerSearchResult: ISearchAnswerResultItem[] = [];

            asnwers.forEach((answerConfig) => {
              if (!answerConfig) return;

              const result = getMatchedRange(answerConfig.connResult.content, keywords);

              if (result) {
                const start = Math.max(result.range.start - 8, 0);
                const end = result.range.end + 8;
                const matchContent = answerConfig.connResult.content.slice(start, end);

                answerSearchResult.push({ matchText: matchContent, answerConfig, type: 'answer' });
              }
            });

            if (
              answerSearchResult.length ||
              keywords.every((word) => msgConfig.sendMessage.includes(word))
            ) {
              msgSearchResult.push({
                msgConfig,
                type: 'message',
                matchText: msgConfig.sendMessage,
                answersResult: answerSearchResult,
              });
            }
          });

          await Promise.all(msgTasks);

          if (msgSearchResult.length || keywords.every((word) => winTitle.includes(word))) {
            chatSearchResult.push({
              chatConfig,
              type: 'chat',
              title: winTitle,
              chatWinId: chatConfig.id,
              matchText: winTitle,
              msgsResult: msgSearchResult,
            });
          }
        });

        for await (const handler of winTasks) {
          const nowTime = Date.now();

          if (currentTaskInfo.current?.flag !== curTaskSymbol) {
            chatSearchResult = [];
            return;
          }

          const timeDiff = nowTime - lastTickTime;

          // 保证至少每16毫秒有一次渲染
          if (timeDiff > 16) {
            await new Promise((resolve) => setTimeout(resolve, 16));
            lastTickTime = Date.now();
          }

          await handler();
        }
      } catch (error) {
      } finally {
        if (currentTaskInfo.current?.flag === curTaskSymbol) {
          setSearchResult(chatSearchResult);
        }

        currentTaskInfo.current = undefined;
      }
    },
    { wait: 0 }
  );

  return { searchResult, searchChatConent };
};
