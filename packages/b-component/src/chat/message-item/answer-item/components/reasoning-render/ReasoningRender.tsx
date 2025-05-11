import React, { useDeferredValue, useLayoutEffect, useMemo } from 'react';
import { useChatAnswerOrgCtx, useChatWinCtx } from '@evo/data-store';

import { BubbleChat } from '@/chat/bubble-chat/BubbleChat';
import { Collapse } from 'antd';
import style from './Reasoning.module.scss';
import { useCellValueSelector } from '@evo/utils';

export interface IReasoningRenderProps {
  turnIndex: number;
}

export const ReasoningRender = React.memo<IReasoningRenderProps>((props) => {
  const { turnIndex } = props;

  const chatTurnsCell = useChatAnswerOrgCtx((ctx) => ctx.chatTurnsCell);

  const [reasoning_content] = useCellValueSelector(
    chatTurnsCell,
    (value) => value.at(turnIndex)?.reasoning_content
  );
  const [startReasoningTime] = useCellValueSelector(
    chatTurnsCell,
    (value) => value.at(turnIndex)?.startReasoningTime
  );
  const [endReasoningTime] = useCellValueSelector(
    chatTurnsCell,
    (value) => value.at(turnIndex)?.endReasoningTime
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
