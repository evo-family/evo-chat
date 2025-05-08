import { EModalAnswerStatus, TModelAnswerCell, useChatWinCtx } from '@evo/data-store';
import React, { useLayoutEffect } from 'react';

import { AnswerContentRender } from '../answer-content-render/AnswerContentRender';
import { AnswerToolbar } from '../answer-toolbar/AnswerToolbar';
import { BubbleChat } from '@/chat/bubble-chat/BubbleChat';
import { Divider } from 'antd';
import { ReasoningRender } from '../reasoning-render/ReasoningRender';
import { useCellValueSelector } from '@evo/utils';
import { useUpdateEffect } from 'ahooks';

export interface IAnswerRenderProps {
  answerCell: TModelAnswerCell;
}

const AnswerScrollTrigger = React.memo((props: { answerCell: TModelAnswerCell }) => {
  const { answerCell } = props;

  const [tryScrollToBtmIfNeed] = useChatWinCtx((ctx) => ctx.tryScrollToBtmIfNeed);

  const [content] = useCellValueSelector(answerCell, (value) => value.chatTurns.at(-1)?.content);
  const [reasoning_content] = useCellValueSelector(
    answerCell,
    (value) => value.chatTurns.at(-1)?.reasoning_content
  );
  const [status] = useCellValueSelector(answerCell, (value) => value.chatTurns.at(-1)?.status);

  useUpdateEffect(() => {
    tryScrollToBtmIfNeed();
  }, [content, reasoning_content, status]);

  return null;
});

export const AnswerRender = React.memo<IAnswerRenderProps>((props) => {
  const { answerCell } = props;

  const [status] = useCellValueSelector(answerCell, (value) => value.chatTurns.at(-1)?.status);
  const [errorMessage] = useCellValueSelector(
    answerCell,
    (value) => value.chatTurns.at(-1)?.errorMessage
  );

  if (status === EModalAnswerStatus.PENDING) {
    return (
      <BubbleChat
        contents={[
          {
            key: 2,
            role: 'user',
            loading: true,
          },
        ]}
      />
    );
  }

  return (
    <>
      {status === EModalAnswerStatus.ERROR ? (
        <BubbleChat
          contents={[
            {
              key: 2,
              role: 'error',
              content: errorMessage,
            },
          ]}
        />
      ) : (
        <>
          <ReasoningRender answerCell={answerCell} />
          <AnswerContentRender answerCell={answerCell} />
        </>
      )}
      <Divider />
      <AnswerToolbar answerCell={answerCell} />
      <AnswerScrollTrigger answerCell={answerCell} />
    </>
  );
});
