import { BorderOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import { EModalAnswerStatus, TModelAnswerCell, useChatMsgCtx } from '@evo/data-store';
import React from 'react';
import { useCellValueSelector } from '@evo/utils';

import style from './Style.module.scss';
import { useMemoizedFn } from 'ahooks';

export interface IAnswerActionsProps {
  answerCell: TModelAnswerCell;
}

export const AnswerActions = React.memo<IAnswerActionsProps>((props) => {
  const { answerCell } = props;

  const [chatMsg] = useChatMsgCtx((ctx) => ctx.chatMsg);

  const [status] = useCellValueSelector(answerCell, (value) => value.status);

  const stopModel = useMemoizedFn(() => {
    chatMsg.stopAnswer(answerCell.get().id);
  });

  if (status === EModalAnswerStatus.PENDING || status === EModalAnswerStatus.RECEIVING) {
    return (
      <Flex className={style.container}>
        <BorderOutlined onClick={stopModel} />
      </Flex>
    );
  }

  return null;
});
