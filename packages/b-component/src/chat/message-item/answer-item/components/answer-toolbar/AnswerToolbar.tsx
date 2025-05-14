import { CopyOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import { Divider, Flex, Popconfirm, Tooltip, message } from 'antd';
import {
  EChatAnswerStatus,
  EModalConnStatus,
  useChatAnswerOrgCtx,
  useChatMsgCtx,
  useChatWinCtx,
} from '@evo/data-store';

import React from 'react';
import style from './Style.module.scss';
import { useCellValueSelector } from '@evo/utils';
import { useMemoizedFn } from 'ahooks';

export interface IAnswerToolbarProps {}

export const AnswerToolbar = React.memo<IAnswerToolbarProps>((props) => {
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [chatMsg] = useChatMsgCtx((ctx) => ctx.chatMsg);
  const chatTurnsCell = useChatAnswerOrgCtx((ctx) => ctx.chatTurnsCell);
  const answerCell = useChatAnswerOrgCtx((ctx) => ctx.answerCell);

  const [status] = useCellValueSelector(answerCell, (value) => value.status);

  const retryModel = useMemoizedFn(() => {
    chatWin.retryAnswer({
      msgId: chatMsg.getConfigState('id'),
      answerId: answerCell.get().id,
    });
  });

  const removeModel = useMemoizedFn(() => {
    chatMsg.removeAnswer(answerCell.get().id);
  });

  const copyModelAnswer = useMemoizedFn(() => {
    let clipContent = '';

    chatTurnsCell.get().forEach((item) => {
      const { content, status, errorMessage } = item;

      switch (status) {
        case EModalConnStatus.SUCCESS:
          clipContent = content;
          break;
        case EModalConnStatus.ERROR:
          clipContent = errorMessage;
          break;

        default:
          break;
      }
    });

    if (clipContent) {
      navigator.clipboard.writeText(clipContent).then(() => {
        message.success('复制成功');
      });
    }
  });

  if (status === EChatAnswerStatus.END) {
    return (
      <>
        <Divider style={{ margin: '10px 0' }} />
        <Flex className={style.container}>
          <Tooltip title="重新生成">
            <SyncOutlined onClick={retryModel} />
          </Tooltip>
          <Tooltip title="复制">
            <CopyOutlined onClick={copyModelAnswer} />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="请确认"
              description="确定要删除该输出结果?"
              onConfirm={removeModel}
              okText="删除"
              okType="danger"
              okButtonProps={{
                type: 'primary',
              }}
              cancelText="取消"
            >
              <DeleteOutlined />
            </Popconfirm>
          </Tooltip>
        </Flex>
      </>
    );
  }

  return null;
});
