import { DataCell } from '@evo/utils';
import { IChatWindowContext } from '../types';
import { useMemoizedFn } from 'ahooks';
import { useState } from 'react';

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

  const scrollList: IChatWindowContext['scrollList'] = useMemoizedFn((params) => {
    const dom = listDOMRef.current;
    if (!dom) return;

    const { direction, distance } = params;

    dom.scrollTop = direction === 'top' ? dom.scrollTop - distance : dom.scrollTop + distance;
  });

  return {
    autoScroll,
    onMsgListScroll,
    scrollToBottom,
    tryScrollToBtmIfNeed,
    scrollList,
  };
};
