import React, { FC, useLayoutEffect } from 'react';
import { scrollBottomWhenChatWinInit, scrollToBottom } from '../utils/scroll';

import { Flex } from 'antd';
import { MessageItem } from './message-item/MessageItem';
import { ScrollToBottton } from './scroll-button/ScrollToBottton';
import { Sender } from './sender/Sender';
import { WelcomeChat } from './welcome-chat/WelcomeChat';
import s from './Chat.module.scss';
import { useCellValue } from '@evo/utils';
import { useChatWinCtx } from '@evo/data-store';

export interface IChatProps {}

export const Chat: FC<IChatProps> = React.memo((props) => {
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [listDOMRef] = useChatWinCtx((ctx) => ctx.listDOMRef);
  const [onMsgListScroll] = useChatWinCtx((ctx) => ctx.onMsgListScroll);
  const [handlePostMessage] = useChatWinCtx((ctx) => ctx.handlePostMessage);

  const [messageIds] = useCellValue(chatWin.configState.getCellSync('messageIds'));

  useLayoutEffect(() => {
    scrollBottomWhenChatWinInit(chatWin, listDOMRef.current);
  }, [chatWin]);

  return messageIds?.length ? (
    <Flex vertical className={s.chat}>
      <Flex vertical flex={1} style={{ position: 'relative', overflow: 'auto' }}>
        <div ref={listDOMRef} className={s.message_list} onScroll={onMsgListScroll}>
          {messageIds?.map((id) => (
            <MessageItem key={id} id={id} />
          ))}
        </div>
        <ScrollToBottton />
      </Flex>
      <div className={s.sender}>
        <Sender onPostMessage={handlePostMessage} />
      </div>
    </Flex>
  ) : (
    <WelcomeChat />
  );
});
