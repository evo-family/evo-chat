import React, { FC } from 'react';

import { ChatMessageList } from './message-list/MessageList';
import { Flex } from 'antd';
import { Sender } from './sender/Sender';
import { WelcomeChat } from './welcome-chat/WelcomeChat';
import s from './Chat.module.scss';
import { useCellValue } from '@evo/utils';
import { useChatWinCtx, useDisplayChatMessage } from '@evo/data-store';
import classNames from 'classnames';

export interface IChatProps {
  style?: React.CSSProperties;
  className?: string;
  messageListClassName?: string;
}

export const Chat: FC<IChatProps> = React.memo((props) => {
  const { style, className, messageListClassName } = props;
  const [handlePostMessage] = useChatWinCtx((ctx) => ctx.handlePostMessage);

  const { display } = useDisplayChatMessage();

  return display ? (
    <Flex vertical style={style} className={classNames(s.chat, className)}>
      <Flex vertical flex={1} style={{ position: 'relative', overflow: 'auto' }}>
        <ChatMessageList className={classNames(s.messageList, messageListClassName)} />
      </Flex>
      <div className={s.sender}>
        <Sender onPostMessage={handlePostMessage} />
      </div>
    </Flex>
  ) : (
    <WelcomeChat />
  );
});
