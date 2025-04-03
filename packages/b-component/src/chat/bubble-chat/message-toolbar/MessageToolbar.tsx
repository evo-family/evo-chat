import React, { useLayoutEffect, useMemo, useState } from 'react';
import { TModelAnswerCell, useChatMsgCtx, useChatWinCtx } from '@evo/data-store';

import { useGetState, useMemoizedFn } from 'ahooks';
import { Dropdown, MenuProps } from 'antd';
import { DropdownButtonProps } from 'antd/es/dropdown';
import { CopyOutlined, DeleteOutlined, SendOutlined, SyncOutlined } from '@ant-design/icons';

import style from './Style.module.scss';

export interface IMessageToolbarProps {}

export const MessageToolbar = React.memo<IMessageToolbarProps>((props) => {
  const {} = props;

  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [chatMsg] = useChatMsgCtx((ctx) => ctx.chatMsg);

  const buttonsRender = useMemoizedFn<Required<DropdownButtonProps>['buttonsRender']>(
    (originNode) => {
      return [null, originNode?.at(1)];
    }
  );

  const resendMessage = useMemoizedFn(() => {
    chatWin.resendMessage({ msgId: chatMsg.getConfigState('id') });
  });

  const retryMessage = useMemoizedFn(() => {
    const msgConfig = chatMsg.getConfigState();

    msgConfig.answerIds.forEach((answerId) => {
      chatWin.retryAnswer({ answerId, msgId: msgConfig.id });
    });
  });

  const removeMessage = useMemoizedFn(() => {
    chatMsg.destroy();
  });

  const copyMessageText = useMemoizedFn(() => {
    const sendMessage = chatMsg.getConfigState('sendMessage');

    navigator.clipboard.writeText(sendMessage);
  });

  const items = useMemo(() => {
    const result: MenuProps['items'] = [
      {
        key: '1',
        label: (
          <div className={style['action-item']}>
            <SyncOutlined />
            重试
          </div>
        ),
        onClick: retryMessage,
      },
      {
        key: '2',
        label: (
          <>
            <SendOutlined />
            重发
          </>
        ),
        onClick: resendMessage,
      },
      {
        key: '3',
        label: (
          <>
            <DeleteOutlined />
            删除
          </>
        ),
        onClick: removeMessage,
      },
      {
        key: '4',
        label: (
          <>
            <CopyOutlined />
            复制
          </>
        ),
        onClick: copyMessageText,
      },
    ];
    return result;
  }, []);

  return (
    <>
      <Dropdown.Button
        type="text"
        size="small"
        menu={{ items }}
        // 只渲染三个点就行
        buttonsRender={buttonsRender}
      ></Dropdown.Button>
    </>
  );
});
