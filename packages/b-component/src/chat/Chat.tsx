import React, { FC } from 'react';

import { ChatMessageList } from './message-list/MessageList';
import { Flex } from 'antd';
import { Sender } from './sender/Sender';
import { WelcomeChat } from './welcome-chat/WelcomeChat';
import s from './Chat.module.scss';
import { useCellValue } from '@evo/utils';
import { useChatWinCtx, useDisplayChatMessage } from '@evo/data-store';

export interface IChatProps {}

export const Chat: FC<IChatProps> = React.memo((props) => {
  const [handlePostMessage] = useChatWinCtx((ctx) => ctx.handlePostMessage);

  const { display } = useDisplayChatMessage();

  return display ? (
    <Flex vertical className={s.chat}>
      <Flex vertical flex={1} style={{ position: 'relative', overflow: 'auto' }}>
        <ChatMessageList className={s.messageList} />
      </Flex>
      <div className={s.sender}>
        <Sender onPostMessage={handlePostMessage} />
      </div>
    </Flex>
  ) : (
    <WelcomeChat />
  );
});
