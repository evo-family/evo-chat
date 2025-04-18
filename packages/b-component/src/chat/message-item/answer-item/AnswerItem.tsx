import { AnswerActions, IAnswerActionsProps } from './components/answer-actions/AnswerActions';
import React, { KeyboardEvent, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TModelAnswerCell, useChatMsgCtx, useChatWinCtx } from '@evo/data-store';

import { AnswerRender } from './components/answer-render/AnswerRender';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';
import { MessageLayout } from '../message-layout/MessageLayout';
import { ModelAvatar } from '../../../avatar/model/ModelAvatar';
import cxb from 'classnames/bind';
import { formatChatStringTime } from '../../../utils/format';
import style from './AnswerItem.modules.scss';
import { useCellValueSelector } from '@evo/utils';
import { useMemoizedFn } from 'ahooks';

const cx = cxb.bind(style);

export interface IAnswerItemProps {
  answerId: string;
}

export const AnswerItem = React.memo<IAnswerItemProps>((props) => {
  const { answerId } = props;

  const [scrollList] = useChatWinCtx((ctx) => ctx.scrollList);
  const [chatMsg] = useChatMsgCtx((ctx) => ctx.chatMsg);

  const [answerCell, setAnswerCell] = useState<TModelAnswerCell | undefined>();
  const [createdTime] = useCellValueSelector(answerCell, (value) => value?.createdTime);
  const [model] = useCellValueSelector(answerCell, (value) => value?.model);

  const [showMaximize, setShowMaximize] = useState(false);
  const renderRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    chatMsg.modelAnswers.getCellUntil({ key: answerId }).then(setAnswerCell);
  }, [chatMsg, answerId]);

  const formatCreatedTime = useMemo(() => formatChatStringTime(createdTime), [createdTime]);

  const handleExpandClick = useMemoizedFn<Required<IAnswerActionsProps>['onExpandClick']>(() => {
    setShowMaximize(!showMaximize);
  });

  const handleWrapKeyDown = useMemoizedFn((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setShowMaximize(false);

      const currentScrollPositon = renderRef?.current?.scrollTop;

      if (currentScrollPositon) {
        setTimeout(() => {
          scrollList({
            direction: 'bottom',
            distance: currentScrollPositon,
          });
        }, 0);
      }
    }
  });

  useLayoutEffect(() => {
    // 每次切换到最大化时，滚动到消息顶部。
    if (showMaximize && renderRef?.current) {
      renderRef.current.scrollTop = 0;
    }
  }, [showMaximize]);

  if (!answerCell) return null;

  return (
    <ErrorBoundary message="发生错误，请联系管理员">
      <MessageLayout
        ref={renderRef}
        tabIndex={9999}
        className={cx(['container', { 'maxmize-mode': showMaximize }])}
        avatar={<ModelAvatar modelName={model} />}
        name={model}
        time={formatCreatedTime}
        actionArea={
          <AnswerActions
            answerCell={answerCell}
            showMaximize={showMaximize}
            onExpandClick={handleExpandClick}
          />
        }
        onKeyDownCapture={handleWrapKeyDown}
      >
        <AnswerRender answerCell={answerCell} />
      </MessageLayout>
    </ErrorBoundary>
  );
});
