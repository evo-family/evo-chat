import { CopyOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import {
  EModalAnswerStatus,
  TModelAnswerCell,
  useChatMsgCtx,
  useChatWinCtx,
} from '@evo/data-store';
import { Flex, Popconfirm, Tooltip, message } from 'antd';

import React from 'react';
import style from './Style.module.scss';
import { useCellValueSelector } from '@evo/utils';
import { useMemoizedFn } from 'ahooks';

export interface IAnswerToolbarProps {
  answerCell: TModelAnswerCell;
}

export const AnswerToolbar = React.memo<IAnswerToolbarProps>((props) => {
  const { answerCell } = props;

  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [chatMsg] = useChatMsgCtx((ctx) => ctx.chatMsg);

  const [status] = useCellValueSelector(answerCell, (value) => value.chatTurns.at(-1)?.status);

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
    const { chatTurns } = answerCell.get();
    let clipContent = '';

    chatTurns.forEach((item) => {
      const { content, status, errorMessage } = item;

      switch (status) {
        case EModalAnswerStatus.SUCCESS:
          clipContent = content;
          break;
        case EModalAnswerStatus.ERROR:
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

  if (status === EModalAnswerStatus.SUCCESS || status === EModalAnswerStatus.ERROR) {
    return (
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
    );
  }

  return null;
});
