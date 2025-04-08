import { FC, memo } from 'react';

import { ChatList } from './chat-list/ChatList';
import { HomeProvider } from './home-processor/HomeProvider';

export interface IHomePageContentProps {}

export const HomePageContent: FC<IHomePageContentProps> = memo((props) => {
  return (
    <>
      <ChatList />
    </>
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
