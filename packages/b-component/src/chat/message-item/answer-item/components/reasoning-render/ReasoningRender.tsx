import React, { useDeferredValue, useLayoutEffect, useMemo } from 'react';
import { TModelAnswerCell, useChatWinCtx } from '@evo/data-store';

import { BubbleChat } from '@/chat/bubble-chat/BubbleChat';
import { Collapse } from 'antd';
import style from './Reasoning.module.scss';
import { useCellValueSelector } from '@evo/utils';

export interface IReasoningRenderProps {
  answerCell: TModelAnswerCell;
}

export const ReasoningRender = React.memo<IReasoningRenderProps>((props) => {
  const { answerCell } = props;

  const [reasoning_content] = useCellValueSelector(
    answerCell,
    (value) => value.connResult.reasoning_content
  );
  const [startReasoningTime] = useCellValueSelector(
    answerCell,
    (value) => value.connResult.startReasoningTime
  );
  const [endReasoningTime] = useCellValueSelector(
    answerCell,
    (value) => value.connResult.endReasoningTime
  );

  const computeCollapseLabel = useMemo(() => {
    return startReasoningTime && endReasoningTime
      ? `已深度思考（用时${((endReasoningTime - startReasoningTime) / 1000).toFixed(1)}秒）`
      : `思考中...`;
  }, [startReasoningTime, endReasoningTime]);

  const collapseLabel = useDeferredValue(computeCollapseLabel);

  if (!reasoning_content) return null;

  return (
    <Collapse
      className={style['reasoning-wrap']}
      bordered={false}
      defaultActiveKey={'1'}
      size="small"
      items={[
        {
          key: '1',
          label: collapseLabel,
          children: (
            <BubbleChat
              contents={[
                {
                  key: 2,
                  role: 'user',
                  content: reasoning_content,
                },
              ]}
            />
          ),
        },
      ]}
    />
  );
});
