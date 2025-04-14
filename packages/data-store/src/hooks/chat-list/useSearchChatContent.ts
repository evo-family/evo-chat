import { DataCell, getPersistenceCellDriverIns, getPersistenceTissueDriverIns } from '@evo/utils';
import { IMessageConfig, TModelAnswer } from '@/chat-message/types';
import { useDebounceFn, useMemoizedFn } from 'ahooks';

import execAll from 'execall';
import { useGlobalCtx } from '@/react-context/global';
import { useState } from 'react';

interface ISearchChatParams {
  searchText: string;
}

export interface ISearchAnswerResultItem {
  matchText: string;
}

export interface ISearchMsgResultItem {
  matchText: string;
  answersResult: Array<ISearchAnswerResultItem>;
}

export interface ISearchChatResultItem {
  chatWinId: string;
  matchText: string;
  msgsResult: Array<ISearchMsgResultItem>;
}
const getMatchedRange = (text: string, keywords: string[]) => {
  if (!text || !keywords.length) return null;

  const matches = keywords.map((keyword) => {
    const regex = new RegExp(keyword, 'gi');
    return execAll(regex, text);
  });

  let firstIndex = 0;
  let latestIndex = 0;

  matches.forEach((matchResult) => {
    const firstMatch = matchResult.at(0);
    const latestMatch = matchResult.at(-1);

    firstMatch.index < firstIndex && (firstIndex = firstMatch.index);
    latestMatch.index > latestIndex && (latestIndex = firstMatch.index);
  });

  return {
    matchedText: text.slice(firstIndex, latestIndex),
    range: { start: firstIndex, end: latestIndex },
  };
};

export const useSearchChatContent = () => {
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);

  const [searchResult, setSearchResult] = useState<Array<ISearchChatResultItem>>([]);

  const { run: searchChatConent } = useDebounceFn(
    async (params: ISearchChatParams) => {
      const cellDriver = getPersistenceCellDriverIns();

      if (!cellDriver) return;

      const { searchText } = params;

      const winList = await chatCtrl.getWindowList();

      const winTasks = winList.map(async (winIns) => {
        await winIns.ready();

        const winConfig = winIns.getConfigState();
        const msgConfigs = await Promise.all(
          winConfig.messageIds.map((msgId) => cellDriver.get<IMessageConfig>(msgId))
        );

        msgConfigs.map(async (msgConfig) => {
          const asnwers = await Promise.all(
            msgConfig.answerIds.map((answerId) => cellDriver.get<TModelAnswer>(answerId))
          );

          asnwers.forEach((answerConfig) => {
            console.log(333, answerConfig.content);

            const result = getMatchedRange(answerConfig.content, [searchText]);
            console.log(result);
          });
        });

        console.log(msgConfigs);
      });

      Promise.all(winTasks);
    },
    { wait: 500 }
  );

  return { searchResult, searchChatConent };
};
