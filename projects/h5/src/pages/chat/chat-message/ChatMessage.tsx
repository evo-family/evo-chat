import React, { FC, memo } from 'react';

import { Chat } from '@evo/component';
import { ChatMessageHeader } from './chat-message-header/ChatMessageHeader';
import s from './ChatMessage.module.scss';

export interface IChatMessageProps {}

export const ChatMessage: FC<IChatMessageProps> = memo(({}) => {
  return (
    <div className={s.container}>
      <ChatMessageHeader />
      <div className={s.content}>
        <Chat />
      </div>
    </div>
  );
});
