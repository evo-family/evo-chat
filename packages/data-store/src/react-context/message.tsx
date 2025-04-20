import React, { PropsWithChildren, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { ChatMessage } from '../chat-message/chatMessage';
import { DataCell } from '@evo/utils';
import { IMessageConfig } from '@/chat-message/types';
import { createContext } from 'use-context-selector';
import { createUseContextSelector } from '@/utils/createContextSelector';
import { useChatWinCtx } from './window/context';

export interface IChatMessageContext {
  chatMsg: ChatMessage;
  msgConfig: DataCell<IMessageConfig>;
}

const defaultContext: IChatMessageContext = {
  chatMsg: undefined as any,
  msgConfig: {} as any,
};

export const ChatMsgContext = createContext(defaultContext);

export const { useUnwrapCellSelector: useChatMsgCtx, useProvideContextSelector: useChatMsgOrgCtx } =
  createUseContextSelector(ChatMsgContext);

const DEFAULT_MESSAGE = new ChatMessage({ id: '__fake_blank_msg__' });
// 添加prepare的hook，让该messageInstance 永远没办法初始化成功，让ui层一直loading
DEFAULT_MESSAGE.registerHook('prepare', () => new Promise((resolve) => {}));
const DEFAULT_MESSAGE_CONFIG: any = new DataCell({});

export const ChatMsgContextProvider = React.memo<PropsWithChildren<{ id: string }>>((props) => {
  const { id } = props;

  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);

  const [chatMsg, setChatMsg] = useState(() => chatWin.getMessageSync(id) ?? DEFAULT_MESSAGE);
  const [msgConfig, setMsgConfig] = useState(() => chatMsg?.configState ?? DEFAULT_MESSAGE_CONFIG);

  useLayoutEffect(() => {
    chatWin.getMessage(id).then(async (chatMessage) => {
      if (!chatMessage) return;

      setChatMsg(chatMessage);
      setMsgConfig(chatMessage.configState);
    });
  }, [id, chatWin]);

  const contextValue: IChatMessageContext = useMemo(() => {
    return { chatMsg, msgConfig };
  }, [chatMsg, msgConfig]);

  return <ChatMsgContext.Provider value={contextValue}>{props.children}</ChatMsgContext.Provider>;
});
