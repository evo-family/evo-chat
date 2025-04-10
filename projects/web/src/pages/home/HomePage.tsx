import { HomeProvider, useHomeSelector } from './home-processor/HomeProvider';
import React, { FC, memo } from 'react';

import { ChatList } from './chat-list/ChatList';
import { ChatMessage } from './chat-message/ChatMessage';
import { ChatWinContextProvider } from '@evo/data-store';
import { SplitterPanel } from '../../components';

export interface IHomePageContentProps {}

export const HomePageContent: FC<IHomePageContentProps> = memo((props) => {
  const sliderVisible = useHomeSelector((s) => s.sliderVisible);

  return (
    <SplitterPanel leftVisible={sliderVisible} leftContent={<ChatList />}>
      <ChatWinContextProvider>
        <ChatMessage />
      </ChatWinContextProvider>
    </SplitterPanel>
  );
});

export interface IHomePageProps {}
export const HomePage: FC<IHomePageProps> = memo((props) => {
  return (
    <HomeProvider>
      <HomePageContent />
    </HomeProvider>
  );
});
