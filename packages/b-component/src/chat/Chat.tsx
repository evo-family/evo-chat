import React, { FC } from 'react';

import { ChatMessageList } from './message-list/MessageList';
import { Flex } from 'antd';
import { Sender } from './sender/Sender';
import { WelcomeChat } from './welcome-chat/WelcomeChat';
import s from './Chat.module.scss';
import { useCellValue } from '@evo/utils';
import { useChatWinCtx } from '@evo/data-store';

export interface IChatProps {}

export const Chat: FC<IChatProps> = React.memo((props) => {
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);

  const [handlePostMessage] = useChatWinCtx((ctx) => ctx.handlePostMessage);

  const [messageIds] = useCellValue(chatWin.configState.getCellSync('messageIds'));

  return messageIds?.length ? (
    <Flex vertical className={s.chat}>
      <Flex vertical flex={1} style={{ position: 'relative', overflow: 'auto' }}>
        <ChatMessageList />
      </Flex>
      <div className={s.sender}>
        <Sender onPostMessage={handlePostMessage} />
      </div>
    </Flex>
  ) : (
    <WelcomeChat />
  );
});
