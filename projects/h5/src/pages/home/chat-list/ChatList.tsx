import { Avatar, Dialog, List, NavBar, Space, SwipeAction } from 'antd-mobile';
import { ChatWindow, useGlobalCtx } from '@evo/data-store';
import { MoreOutline, SearchOutline } from 'antd-mobile-icons';
import React, { FC, memo, useLayoutEffect, useMemo, useState } from 'react';

import { ChatItemMenu } from './chat-item-menu/ChatItemMenu';
import { EvoIcon } from '@evo/component';
import { debounce } from 'lodash';
import s from './ChatList.module.scss';
import { useHomeSelector } from '../home-processor/HomeProvider';
import { useMemoizedFn } from 'ahooks';
import { useNavigate } from 'react-router';

// import { ChatListHeader } from '../../chat/chat-list-header/ChatListHeader';

interface IMessage {
  id: string;
  content: string | React.ReactNode;
  date: string;
  time: string;
  chatIns: ChatWindow;
}

export interface IChatListProps {}

export const ChatList: FC<IChatListProps> = memo(({}) => {
  const navigate = useNavigate();
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);
  const [curWinId] = useGlobalCtx((ctx) => ctx.curWinId);
  const collapseSlider = useHomeSelector((s) => s.collapseSlider);

  const [chatList, setChatList] = useState<IMessage[]>([]);

  const selectedKeys = useMemo(() => [curWinId], [curWinId]);

  useLayoutEffect(() => {
    const computeChatList = () => {
      const listLayout = chatCtrl.windowLayout.get();

      const tasks = listLayout.map((id) =>
        chatCtrl.getWindow(id).then(async (windowIns) => {
          await windowIns.ready();

          const windowConfig = windowIns.getConfigState();

          return {
            id: windowConfig.id,
            content: windowIns.title.get() || '默认标题',
            date: '今天',
            time: '10:00',
            chatIns: windowIns,
          };
        })
      );

      Promise.all(tasks).then(setChatList);
    };
    const debounceComputeChatList = debounce(computeChatList, 50);

    let titleSubscription: any[] = [];
    const cleanupTitleSubscription = () => {
      titleSubscription.forEach((handle) => handle());
      titleSubscription = [];
    };

    const subscriptions = chatCtrl.windowLayout.listen(
      async () => {
        const chatWinList = await chatCtrl.getWindowList();

        cleanupTitleSubscription();
        titleSubscription = chatWinList.map(
          (win) =>
            win.title.listen(debounceComputeChatList, { immediate: true })
              .unsubscribe
        );
      },
      {
        immediate: true,
      }
    );

    return () => {
      subscriptions.unsubscribe();
      cleanupTitleSubscription();
    };
  }, [chatCtrl]);

  const handleMenuAction = useMemoizedFn(
    async (winId: string, action: string) => {
      switch (action) {
        case 'rename':
          // chatWinIns.title.set()
          console.log('重命名:', winId);
          break;
        case 'export_md':
          console.log('导出到 Markdown:', winId);
          break;
        case 'export_image':
          console.log('导出到图片:', winId);
          break;
        case 'delete':
          chatCtrl.removeWindow(winId);
          console.log('删除:', winId);
          break;
      }
    }
  );

  const menuItems: any['items'] = useMemo(() => {
    // 按日期分组
    const groupedChats = chatList.reduce((groups, chat) => {
      const date = chat.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(chat);
      return groups;
    }, {} as Record<string, IMessage[]>);

    return Object.entries(groupedChats).map(([date, chats]) => ({
      key: date,
      label: date,
      type: 'group',
      children: chats.map((chatInfo) => ({
        key: chatInfo.id,
        label: (
          <div className={s.chatItem}>
            <span className={s.content}>{chatInfo.content}</span>
            <div className={s.rightContent}>
              <ChatItemMenu
                onAction={handleMenuAction}
                chatIns={chatInfo.chatIns}
              />
            </div>
          </div>
        ),
      })),
    }));
  }, [chatList, curWinId]);

  const handleSelect: any['onSelect'] = useMemoizedFn((info: any) => {
    const { key } = info;

    chatCtrl.setCurrentWin(key);
  });

  const handleSearch = useMemoizedFn(() => {
    console.log('打开搜索');
  });

  const handleNewChat = useMemoizedFn(() => {
    chatCtrl.createWindow();
  });

  const right = (
    <Space style={{ fontSize: 24, '--gap': '16px' }}>
      <EvoIcon
        size={'small'}
        onClick={handleSearch}
        style={{ color: 'var(--adm-color-text)' }}
        type="icon-search"
      />
      <EvoIcon
        size={'small'}
        onClick={handleNewChat}
        style={{ color: 'var(--adm-color-text)' }}
        type="icon-message"
      />
    </Space>
  );

  return (
    <Space direction="vertical" style={{ width: '100%', height: '100%' }}>
      <NavBar
        right={right}
        back={null}
        left={
          <Avatar
            src=""
            style={{ '--size': '32px', '--border-radius': '16px' }}
          />
        }
      />
      {/* <ChatListHeader
        onSearch={handleSearch}
        onNewChat={handleNewChat}
        onCollapse={collapseSlider}
      /> */}

      <Space
        direction="vertical"
        style={{
          flex: 1,
          overflow: 'auto',
          width: 'calc(100% - 20px)',
          padding: '0 10px',
        }}
      >
        {Object.entries(
          chatList.reduce((groups, chat) => {
            const date = chat.date;
            if (!groups[date]) groups[date] = [];
            groups[date].push(chat);
            return groups;
          }, {} as Record<string, IMessage[]>)
        ).map(([date, chats]) => (
          <List
            header={date}
            key={date}
            style={{
              backgroundColor: '#fff',
              borderRadius: '6px',
              marginBottom: '10px',
            }}
          >
            {chats.map((chatInfo) => (
              <SwipeAction
                key={chatInfo.id}
                rightActions={[
                  {
                    key: 'delete',
                    text: '删除',
                    color: 'danger',
                    onClick: async () => {
                      const result = await Dialog.confirm({
                        content: '确定要删除该对话吗？',
                      });
                      if (result) {
                        chatCtrl.removeWindow(chatInfo.id);
                      }
                    },
                  },
                ]}
              >
                <List.Item
                  onClick={() => {
                    chatCtrl.setCurrentWin(chatInfo.id);
                    navigate(`/chat?id=${chatInfo.id}`);
                  }}
                  extra={
                    <ChatItemMenu
                      onAction={handleMenuAction}
                      chatIns={chatInfo.chatIns}
                    />
                  }
                  style={{
                    color: '#666666',
                  }}
                >
                  <Space align="center">{chatInfo.content}</Space>
                </List.Item>
              </SwipeAction>
            ))}
          </List>
        ))}
      </Space>
    </Space>
  );
});
