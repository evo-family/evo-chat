import React, { PropsWithChildren, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { ChatMessage } from '../chat-message/chatMessage';
import { createContext } from 'use-context-selector';
import { createUseContextSelector } from '@/utils/createContextSelector';
import { useChatWinCtx } from './window/context';

export interface IChatMessageContext {
  chatMsg: ChatMessage;
}

const defaultContext: IChatMessageContext = {
  chatMsg: undefined as any,
};

export const ChatMsgContext = createContext(defaultContext);

export const useChatMsgCtx = createUseContextSelector(ChatMsgContext);

const DEFAULT_MESSAGE = new ChatMessage({ id: '__fake_blank_msg__' });
// 添加prepare的hook，让该messageInstance 永远没办法初始化成功，让ui层一直loading
DEFAULT_MESSAGE.registerHook('prepare', () => new Promise((resolve) => {}));

export const ChatMsgContextProvider = React.memo<PropsWithChildren<{ id: string }>>((props) => {
  const { id } = props;

  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);

  const [chatMsg, setChatMsg] = useState(DEFAULT_MESSAGE);

  useLayoutEffect(() => {
    chatWin.getMessage(id).then(async (chatMessage) => {
      if (!chatMessage) return;

      await chatMessage.ready();

      setChatMsg(chatMessage);
    });
  }, [id, chatWin]);

  const contextValue: IChatMessageContext = useMemo(() => {
    return { chatMsg };
  }, [chatMsg]);

  if (!chatMsg) {
    return null;
  }

  return <ChatMsgContext.Provider value={contextValue}>{props.children}</ChatMsgContext.Provider>;
});
