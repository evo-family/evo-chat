import { CopyOutlined, DeleteOutlined, SendOutlined, SyncOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps } from 'antd';
import React, { useMemo } from 'react';
import { useChatMsgCtx, useChatWinCtx } from '@evo/data-store';

import { DropdownButtonProps } from 'antd/es/dropdown';
import style from './Style.module.scss';
import { useMemoizedFn } from 'ahooks';

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

    chatWin.retryMessage({ msgId: msgConfig.id });
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
        className: style['action-item'],
        label: (
          <>
            <SyncOutlined className={style['action-icon']} />
            重试
          </>
        ),
        onClick: retryMessage,
      },
      {
        key: '2',
        className: style['action-item'],
        label: (
          <>
            <CopyOutlined className={style['action-icon']} />
            复制
          </>
        ),
        onClick: copyMessageText,
      },

      {
        key: '3',
        className: style['action-item'],
        label: (
          <>
            <DeleteOutlined className={style['action-icon']} />
            删除
          </>
        ),
        onClick: removeMessage,
      },
      {
        key: '4',
        className: style['action-item'],
        label: (
          <>
            <SendOutlined className={style['action-icon']} />
            重发
          </>
        ),
        onClick: resendMessage,
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
