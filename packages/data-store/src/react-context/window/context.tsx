import React, {
  PropsWithChildren,
  RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDebounceFn, useMemoizedFn } from 'ahooks';

import { ChatWindow } from '@/chat-window/chatWindow';
import { DataCell } from '@evo/utils';
import { IChatWindowContext } from './types';
import { IFileMeta } from '@evo/types';
import { createContext } from 'use-context-selector';
import { createUseContextSelector } from '@/utils/createContextSelector';
import { useGlobalCtx } from '../global';
import { useLatestMessage } from './hooks/useLatestMsg';
import { useListScroll } from './hooks/useListScroll';

export const ChatWinContext = createContext<IChatWindowContext>({} as any);

export const useChatWinCtx = createUseContextSelector(ChatWinContext);

const placeholderChatWin = new ChatWindow({ config: { id: '__placeholderChatWin__' } });
placeholderChatWin.registerHook('prepare', () => new Promise((resolve) => {}));

export const ChatWinContextProvider = React.memo<PropsWithChildren<{}>>((props) => {
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);
  const [curWinId] = useGlobalCtx((ctx) => ctx.curWinId);

  const [curWindowCell] = useState(() => new DataCell(placeholderChatWin));
  const [initReady, setInitReady] = useState(false);

  const listDOMRef = useRef<HTMLDivElement>(null);

  const latestMsg = useLatestMessage(curWindowCell);
  const { autoScroll, onMsgListScroll, scrollToBottom, tryScrollToBtmIfNeed, scrollList } =
    useListScroll({
      listDOMRef,
    });

  const handlePostMessage: IChatWindowContext['handlePostMessage'] = useMemoizedFn(
    (message, params) => {
      const { fileInfos } = params;

      const chatWin = curWindowCell.get();

      chatWin.createMessage(message, { fileInfos }).then(async (msgIns) => {
        await msgIns.ready();

        //  新发送一条消息后要滚动到底部
        setTimeout(scrollToBottom, 20);
      });
    }
  );

  const contextValue: IChatWindowContext = useMemo(() => {
    return {
      chatWin: curWindowCell as any,
      autoScroll,
      listDOMRef,
      latestMsg,
      onMsgListScroll,
      tryScrollToBtmIfNeed,
      scrollToBottom,
      handlePostMessage,
      scrollList,
    };
  }, [
    curWindowCell,
    autoScroll,
    listDOMRef,
    listDOMRef,
    latestMsg,
    onMsgListScroll,
    tryScrollToBtmIfNeed,
    handlePostMessage,
    scrollList,
  ]);

  // 每次curWinId变化时，重新获取chatWin并进行初始化逻辑，期间不渲染内容
  useEffect(() => {
    setInitReady(false);

    chatCtrl.getWindow(curWinId)?.then((curWin) => {
      return curWin.ready().then(async () => {
        curWindowCell.set(curWin);
        setInitReady(true);
      });
    });
  }, [chatCtrl, curWindowCell, curWinId]);

  if (!initReady) {
    return null;
  }

  return <ChatWinContext.Provider value={contextValue}>{props.children}</ChatWinContext.Provider>;
});
