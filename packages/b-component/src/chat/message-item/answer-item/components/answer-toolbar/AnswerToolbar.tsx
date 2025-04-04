import { CopyOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import {
  EModalAnswerStatus,
  TModelAnswer,
  TModelAnswerCell,
  useChatMsgCtx,
  useChatWinCtx,
} from '@evo/data-store';
import { Flex, Tooltip } from 'antd';
import React, { useDeferredValue, useMemo } from 'react';
import { useCellValue, useCellValueSelector } from '@evo/utils';

import style from './Style.module.scss';
import { useMemoizedFn } from 'ahooks';

export interface IAnswerToolbarProps {
  answerCell: TModelAnswerCell;
}

export const AnswerToolbar = React.memo<IAnswerToolbarProps>((props) => {
  const { answerCell } = props;

  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [chatMsg] = useChatMsgCtx((ctx) => ctx.chatMsg);

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
    const answerContent = answerCell.get().content;

    navigator.clipboard.writeText(answerContent);
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
          <DeleteOutlined onClick={removeModel} />
        </Tooltip>
      </Flex>
    );
  }

  return null;
});
