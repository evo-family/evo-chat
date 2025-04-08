import { ChatWinContextProvider, useGlobalCtx } from '@evo/data-store';
import { FC, memo, useEffect } from 'react';

import { ChatMessage } from './chat-message/ChatMessage';
import { useSearchParams } from 'react-router';

export interface IChatPageProps {}

export const ChatPage: FC<IChatPageProps> = memo((props) => {
  return (
    <ChatWinContextProvider>
      <ChatMessage />
    </ChatWinContextProvider>
  );
});
