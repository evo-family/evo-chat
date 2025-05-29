import { FC, memo } from 'react';

import { ChatList } from './chat-list/ChatList';
import { HomeProvider } from './home-processor/HomeProvider';
import { ContentPanel } from '../../components';
import { Space } from 'antd-mobile';
import { EvoIcon } from '@evo/component';
import { useMemoizedFn } from 'ahooks';
import { useGlobalCtx } from '@evo/data-store';

export interface IHomePageContentProps {}

export const HomePageContent: FC<IHomePageContentProps> = memo((props) => {
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);
  const handleSearch = useMemoizedFn(() => {
    console.log('打开搜索');
  });

  const handleNewChat = useMemoizedFn(() => {
    chatCtrl.createWindow();
  });

  const toolbar = (
    <Space>
      <EvoIcon size={'small'} onClick={handleSearch} type="icon-search" />
      <EvoIcon size={'small'} onClick={handleNewChat} type="icon-message" />
    </Space>
  );

  return (
    <>
      <ContentPanel hiddenToolbarBack title="对话" toolbar={toolbar}>
        <ChatList />
      </ContentPanel>
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
