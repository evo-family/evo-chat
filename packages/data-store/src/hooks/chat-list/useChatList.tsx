import {
  IN_30_DAY_TEXT,
  IN_7_TEXT,
  MORE_EARLY_TEXT,
  TODAY_TEXT,
  formatDateGroup,
} from '@evo/utils';
import React, { useLayoutEffect, useMemo, useState } from 'react';

import { ChatWindow } from '@/chat-window/chatWindow';
import { debounce } from 'lodash';
import { useGlobalCtx } from '@/react-context/global';

export interface IChatListItem {
  id: string;
  title: string | React.ReactNode;
  createdTime: number;
  dateGroup: string;
  chatIns: ChatWindow;
}

export const useChatList = () => {
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);

  const [chatList, setChatList] = useState<IChatListItem[]>([]);

  useLayoutEffect(() => {
    const computeChatList = () => {
      const listLayout = chatCtrl.windowLayout.get();

      const tasks = listLayout.map((id) =>
        chatCtrl.getWindow(id).then(async (windowIns) => {
          await windowIns.ready();

          const windowConfig = windowIns.getConfigState();

          return {
            id: windowConfig.id,
            title: windowIns.title.get() || '未标题',
            createdTime: windowConfig.createdTime,
            dateGroup: formatDateGroup(windowConfig.createdTime),
            chatIns: windowIns,
          };
        })
      );

      Promise.all(tasks).then(setChatList);
    };
    const debounceComputeChatList = debounce(computeChatList, 50);

    let titleSubscription: any[] = [];
    const cleanupTitleSubscription = () => {
      titleSubscription.forEach((handle) => handle());
      titleSubscription = [];
    };

    const subscriptions = chatCtrl.windowLayout.listen(
      async () => {
        const chatWinList = await chatCtrl.getWindowList();

        cleanupTitleSubscription();

        if (chatWinList.length) {
          titleSubscription = chatWinList.map(
            (win) => win.title.listen(debounceComputeChatList, { immediate: true }).unsubscribe
          );
        } else {
          debounceComputeChatList();
        }
      },
      {
        immediate: true,
      }
    );

    return () => {
      subscriptions.unsubscribe();
      cleanupTitleSubscription();
    };
  }, [chatCtrl]);

  const groupedChatList = useMemo(() => {
    // 按日期分组
    const groupedChats = chatList.reduce((groups, chat) => {
      const date = chat.dateGroup;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(chat);
      return groups;
    }, {} as Record<string, IChatListItem[]>);

    const sortedList: Array<{ groupName: string; chats: IChatListItem[] }> = [];
    const todayGroup = groupedChats[TODAY_TEXT];
    const in7DayGroup = groupedChats[IN_7_TEXT];
    const in30DayGroup = groupedChats[IN_30_DAY_TEXT];
    const moreEarlyGroup = groupedChats[MORE_EARLY_TEXT];

    todayGroup && sortedList.push({ groupName: TODAY_TEXT, chats: todayGroup });
    in7DayGroup && sortedList.push({ groupName: IN_7_TEXT, chats: in7DayGroup });
    in30DayGroup && sortedList.push({ groupName: IN_30_DAY_TEXT, chats: in30DayGroup });
    moreEarlyGroup && sortedList.push({ groupName: MORE_EARLY_TEXT, chats: moreEarlyGroup });

    return sortedList;
  }, [chatList]);

  return {
    chatList,
    groupedChatList,
  };
};
