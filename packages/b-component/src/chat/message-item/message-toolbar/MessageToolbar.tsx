import {
  CopyOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  SendOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Dropdown, MenuProps, Popconfirm, Tooltip, message } from 'antd';
import React, { useMemo } from 'react';
import { useChatMsgCtx, useChatWinCtx } from '@evo/data-store';

import { DropdownButtonProps } from 'antd/es/dropdown';
import style from './Style.module.scss';
import { useMemoizedFn } from 'ahooks';

export interface IMessageToolbarProps {}

export const MessageToolbar = React.memo<IMessageToolbarProps>((props) => {
  const {} = props;

  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [handlePostMessage] = useChatWinCtx((ctx) => ctx.handlePostMessage);
  const [chatMsg] = useChatMsgCtx((ctx) => ctx.chatMsg);

  const resendMessage = useMemoizedFn(() => {
    const { sendMessage, attachFileInfos: fileInfos } = chatMsg.getConfigState();

    handlePostMessage(sendMessage, { fileInfos });
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

    navigator.clipboard.writeText(sendMessage).then(() => {
      message.success('复制成功');
    });
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
          <Popconfirm
            title="请确认"
            description="确定要删除该消息?"
            onConfirm={removeMessage}
            okText="删除"
            okType="danger"
            okButtonProps={{
              type: 'primary',
            }}
            cancelText="取消"
          >
            <div onClick={(e) => e.stopPropagation()}>
              <DeleteOutlined className={style['action-icon']} />
              删除
            </div>
          </Popconfirm>
        ),
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
    <Dropdown
      menu={{ items }}
      // 只渲染三个点就行
    >
      <EllipsisOutlined className={style['msg-toolbar-btn']} />
    </Dropdown>
  );
});
