import { IModelAnserActionRecord, TModelAnswer, TModelAnswerCell } from '@/chat-message/types';
import React, { PropsWithChildren, useLayoutEffect, useMemo, useState } from 'react';
import { useGetState, useUnmount } from 'ahooks';

import { DataCell } from '@evo/utils';
import { createContext } from 'use-context-selector';
import { createUseContextSelector } from '@/utils/createContextSelector';
import { useChatMsgCtx } from './message';

export interface IChatAnswerContextProps {
  answerId: string;
}

export interface IChatAnswerContext {
  answerCell: TModelAnswerCell;
  chatTurnsCell: DataCell<IModelAnserActionRecord['chatTurns']>;
  curHisIndex: number | undefined;
  setCurHisIndex: (index: number) => void;
}

const emptyMsgConfig: TModelAnswer = {
  id: 'test',
  model: 'test',
  provider: 'test',
  createdTime: +Date.now(),
  histroy: [],
};
const emptyChatTurns: IModelAnserActionRecord['chatTurns'] = [];
const defaultContext: IChatAnswerContext = {
  answerCell: new DataCell(emptyMsgConfig),
  chatTurnsCell: new DataCell(emptyChatTurns),
  curHisIndex: undefined,
  setCurHisIndex: () => {},
};

export const ChatAnswerContext = createContext(defaultContext);

export const {
  useUnwrapCellSelector: useChatAnswerCtx,
  useProvideContextSelector: useChatAnswerOrgCtx,
} = createUseContextSelector(ChatAnswerContext);

export const ChatAnswerContextProvider = React.memo<PropsWithChildren<IChatAnswerContextProps>>(
  (props) => {
    const { answerId } = props;

    const [chatMsg] = useChatMsgCtx((ctx) => ctx.chatMsg);
    const [answerCell, setAnswerCell] = useState<TModelAnswerCell | undefined>(() =>
      chatMsg?.modelAnswers.getCellSync(answerId)
    );
    const [chatTurnsCell] = useState(() => new DataCell<IModelAnserActionRecord['chatTurns']>([]));
    const [curHisIndex, setCurHisIndex, getCurHisIndex] = useGetState(() =>
      answerCell ? answerCell.get().histroy.length - 1 : undefined
    );

    const contextValue: IChatAnswerContext = useMemo(() => {
      return { answerCell: answerCell as any, chatTurnsCell, curHisIndex, setCurHisIndex };
    }, [answerCell, chatTurnsCell, curHisIndex, setCurHisIndex]);

    useLayoutEffect(() => {
      chatMsg.modelAnswers.getCellUntil({ key: answerId }).then(setAnswerCell);
    }, [chatMsg, answerId]);

    useLayoutEffect(() => {
      if (!answerCell) return;

      const subscription = answerCell.listen(
        (notice) => {
          if (notice.action === 'destroy') return;

          const curIndex = getCurHisIndex();
          if (curIndex === undefined) return;

          const { next } = notice;
          const nextChatTurns = next.histroy.at(curIndex)?.chatTurns ?? [];
          chatTurnsCell.set([...nextChatTurns]);
        },
        { immediate: true }
      );

      return subscription?.unsubscribe;
    }, [curHisIndex, answerCell]);

    // 所有组件卸载时的销毁逻辑写这里
    useUnmount(() => {
      chatTurnsCell.destroy();
    });

    if (!answerCell?.get()) return;

    return (
      <ChatAnswerContext.Provider value={contextValue}>{props.children}</ChatAnswerContext.Provider>
    );
  }
);
