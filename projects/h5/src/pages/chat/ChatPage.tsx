import {
  ChatWinContextProvider,
} from '@evo/data-store';
import { FC, memo, useEffect } from 'react';

import { ChatMessage } from './chat-message/ChatMessage';
import { useSearchParams } from 'react-router';

export interface IChatPageProps {}

export const ChatPage: FC<IChatPageProps> = memo((props) => {

  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('id'); // 获取 URL 中的 id 参数

  useEffect(() => {
    if (chatId) {
      // 使用 chatId 进行相关操作
      console.log('当前聊天 ID:', chatId);
    }
  }, [chatId]);
  
  return (
        <ChatWinContextProvider>
          <ChatMessage />
        </ChatWinContextProvider>
  );
});

