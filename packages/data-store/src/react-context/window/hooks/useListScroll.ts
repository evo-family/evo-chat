import { useMemoizedFn } from 'ahooks';
import { IChatWindowContext } from '../types';
import { useState } from 'react';
import { DataCell } from '@evo/utils';

export const useListScroll = (params: Pick<IChatWindowContext, 'listDOMRef'>) => {
  const { listDOMRef } = params;

  const [autoScroll] = useState(() => new DataCell(true));

  const onMsgListScroll = useMemoizedFn(() => {
    const containerDOM = listDOMRef.current;
    if (!containerDOM) return;

    const isBottomReached =
      containerDOM.scrollTop + containerDOM.clientHeight >= containerDOM.scrollHeight - 1;

    autoScroll.set(isBottomReached);
  });

  const scrollToBottom = useMemoizedFn(() => {
    const dom = listDOMRef.current;

    if (!dom) return;

    dom.scrollTop = dom.scrollHeight;
  });

  const tryScrollToBtmIfNeed = useMemoizedFn(() => {
    if (!autoScroll.get()) return;

    scrollToBottom();
  });

  return {
    autoScroll,
    onMsgListScroll,
    scrollToBottom,
    tryScrollToBtmIfNeed,
  };
};
