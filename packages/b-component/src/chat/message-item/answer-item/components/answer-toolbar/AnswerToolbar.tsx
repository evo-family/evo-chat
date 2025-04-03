import { CopyOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import {
  EModalAnswerStatus,
  TModelAnswer,
  TModelAnswerCell,
  useChatMsgCtx,
  useChatWinCtx,
} from '@evo/data-store';
import React, { useDeferredValue, useMemo } from 'react';
import { useCellValue, useCellValueSelector } from '@evo/utils';

import { Flex } from 'antd';
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

  if (status === EModalAnswerStatus.SUCCESS || status === EModalAnswerStatus.ERROR) {
    return (
      <Flex className={style.container}>
        <SyncOutlined onClick={retryModel} />
        <CopyOutlined />
        <DeleteOutlined onClick={removeModel} />
      </Flex>
    );
  }

  return null;
});
