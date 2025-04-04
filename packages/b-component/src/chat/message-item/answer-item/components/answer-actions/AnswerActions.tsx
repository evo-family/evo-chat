import { EModalAnswerStatus, TModelAnswerCell, useChatMsgCtx } from '@evo/data-store';
import { Flex, Tooltip } from 'antd';

import { BorderOutlined } from '@ant-design/icons';
import React from 'react';
import style from './Style.module.scss';
import { useCellValueSelector } from '@evo/utils';
import { useMemoizedFn } from 'ahooks';

export interface IAnswerActionsProps {
  answerCell: TModelAnswerCell;
}

export const AnswerActions = React.memo<IAnswerActionsProps>((props) => {
  const { answerCell } = props;

  const [chatMsg] = useChatMsgCtx((ctx) => ctx.chatMsg);

  const [status] = useCellValueSelector(answerCell, (value) => value.status);

  const stopModel = useMemoizedFn(() => {
    chatMsg.stopResolveAnswer(answerCell.get().id);
  });

  if (status === EModalAnswerStatus.PENDING || status === EModalAnswerStatus.RECEIVING) {
    return (
      <Flex className={style.container}>
        <Tooltip title="停止内容生成">
          <BorderOutlined className={style['stop-icon']} onClick={stopModel} />
        </Tooltip>
      </Flex>
    );
  }

  return null;
});
