import { ChatWindow, useGlobalCtx, useSettingSelector } from '@evo/data-store';
import { DataCell, useCellValue } from '@evo/utils';
import React, { FC, memo, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useMemoizedFn, useUpdate } from 'ahooks';

import { ChatItemMenu } from './chat-item-menu/ChatItemMenu';
import { ChatListHeader } from './chat-list-header/ChatListHeader';
import { Menu, Modal } from 'antd';
import { MenuItemType } from 'antd/es/menu/interface';
import type { MenuProps } from 'antd';
import { debounce } from 'lodash';
import s from './ChatList.module.scss';
import { useHomeSelector } from '../home-processor/HomeProvider';
import { MenuItem } from '@evo/component';

interface IMessage {
  id: string;
  content: string | React.ReactNode;
  date: string;
  time: string;
  chatIns: ChatWindow;
}

export interface IChatListProps {}

export const ChatList: FC<IChatListProps> = memo(({}) => {
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);
  const [curWinId] = useGlobalCtx((ctx) => ctx.curWinId);
  const defaultMessageModel = useSettingSelector((s) => s.defaultMessageModel);
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
            content: windowIns.title.get() || '未标题',
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

        if (chatWinList.length) {
          titleSubscription = chatWinList.map(
            (win) => win.title.listen(debounceComputeChatList, { immediate: true }).unsubscribe
          );
        } else {
          debounceComputeChatList();
        }
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

  const handleMenuAction = useMemoizedFn(async (winId: string, action: string) => {
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
  });

  const menuItems: MenuProps['items'] = useMemo(() => {
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
          <>
            <MenuItem
              name={chatInfo.content}
              operationContent={
                <ChatItemMenu onAction={handleMenuAction} chatIns={chatInfo.chatIns} />
              }
            />
          </>
        ),
      })),
    }));
  }, [chatList, curWinId]);

  const handleSelect: MenuProps['onSelect'] = useMemoizedFn((info) => {
    const { key } = info;

    chatCtrl.setCurrentWin(key);
  });

  const handleSearch = useMemoizedFn(() => {
    console.log('打开搜索');
  });

  const handleNewChat = useMemoizedFn(async () => {
    const win = await chatCtrl.createWindow();
    if (!defaultMessageModel) {
      // TODO 待完善，弹框设置
      Modal.confirm({
        title: '未设置默认模型',
        content: '您还没有设置默认会话模型，需要先设置默认模型才能开始对话',
        okText: '去设置',
        cancelText: '取消',
        onOk: () => {},
      });
      return;
    }
    win.updateConfigModels([defaultMessageModel]);
  });

  return (
    <div className={s.container}>
      <ChatListHeader
        onSearch={handleSearch}
        onNewChat={handleNewChat}
        onCollapse={collapseSlider}
      />
      <Menu
        className={'evo-menu'}
        mode="inline"
        items={menuItems}
        onSelect={handleSelect}
        selectedKeys={selectedKeys}
      />
    </div>
  );
});
