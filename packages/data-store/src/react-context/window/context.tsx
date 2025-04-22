import { IChatWindowContext, IChatWindowContextOptions } from './types';
import React, { PropsWithChildren, useLayoutEffect, useMemo, useState } from 'react';

import { ChatWindow } from '@/chat-window/chatWindow';
import { DataCell } from '@evo/utils';
import { createContext } from 'use-context-selector';
import { createUseContextSelector } from '@/utils/createContextSelector';
import { useGlobalCtx } from '../global';
import { useLatestMessage } from './hooks/useLatestMsg';
import { useListScroll } from './hooks/useListScroll';
import { useMemoizedFn } from 'ahooks';

export const ChatWinContext = createContext<IChatWindowContext>({} as any);

export const { useUnwrapCellSelector: useChatWinCtx, useProvideContextSelector: useChatWinOrgCtx } =
  createUseContextSelector(ChatWinContext);

const placeholderChatWin = new ChatWindow({ config: { id: '__placeholderChatWin__' } });
placeholderChatWin.registerHook('prepare', () => new Promise((resolve) => {}));

const DEFAULT_CONTEXT_OPTIONS: IChatWindowContextOptions = {};

export const ChatWinContextProvider = React.memo<
  PropsWithChildren<{
    winId?: string;
    options?: IChatWindowContextOptions;
  }>
>((props) => {
  const { winId: paramWinId, options } = props;

  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);
  const [curWinId] = useGlobalCtx((ctx) => ctx.curWinId);

  const [curWindowCell] = useState(() => new DataCell(placeholderChatWin));
  const [optionsCell] = useState(() => new DataCell(DEFAULT_CONTEXT_OPTIONS));
  const [initReady, setInitReady] = useState(false);

  const latestMsg = useLatestMessage(curWindowCell);
  const listScroll = useListScroll(curWindowCell);

  const realWinId = useMemo(() => paramWinId || curWinId, [paramWinId, curWinId]);

  const handlePostMessage: IChatWindowContext['handlePostMessage'] = useMemoizedFn(
    (message, params) => {
      const { fileInfos } = params;

      const chatWin = curWindowCell.get();

      chatWin.createMessage(message, { fileInfos }).then(async (msgIns) => {
        await msgIns.ready();

        //  新发送一条消息后要滚动到底部
        setTimeout(listScroll.scrollToBottom, 100);
      });
    }
  );

  useMemo(() => {
    optionsCell.set({ ...DEFAULT_CONTEXT_OPTIONS, ...options });
  }, [options]);

  const contextValue: IChatWindowContext = useMemo(() => {
    return {
      chatWin: curWindowCell as any,
      options: optionsCell,
      latestMsg,
      handlePostMessage,
      ...listScroll,
    };
  }, [curWindowCell, latestMsg, handlePostMessage, listScroll]);

  // 每次curWinId变化时，重新获取chatWin并进行初始化逻辑，期间不渲染内容
  useLayoutEffect(() => {
    setInitReady(false);

    chatCtrl.getWindow(realWinId)?.then((curWin) => {
      return curWin.ready().then(() => {
        curWindowCell.set(curWin);
        setInitReady(true);
      });
    });
  }, [chatCtrl, curWindowCell, realWinId]);

  if (!initReady) {
    return null;
  }

  return <ChatWinContext.Provider value={contextValue}>{props.children}</ChatWinContext.Provider>;
});
