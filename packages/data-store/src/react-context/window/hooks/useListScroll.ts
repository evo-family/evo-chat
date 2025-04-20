import { DataCell, useCellValue } from '@evo/utils';
import { useDebounceFn, useMemoizedFn, useSet } from 'ahooks';
import { useRef, useState } from 'react';

import { IChatWindowContext } from '../types';
import { Virtualizer } from '@tanstack/react-virtual';

export const useListScroll = (curWindowCell: IChatWindowContext['chatWin']) => {
  const [autoScroll] = useState(() => new DataCell(false));

  const [virtualizerCell] = useState(
    () => new DataCell<undefined | Virtualizer<HTMLDivElement, Element>>(undefined)
  );
  const scrollBottomTaskRef = useRef<any>(null);

  const virtualHandle = useMemoizedFn(
    (handle: (ins: Virtualizer<HTMLDivElement, Element>) => any) => {
      const virIns = virtualizerCell.get();
      if (!virIns) return;

      handle(virIns);
    }
  );

  const scrollToBottom = useMemoizedFn(() => {
    if (scrollBottomTaskRef.current) return;

    virtualHandle((virIns) => {
      virIns.scrollToIndex(virIns.options.count - 1);
      // 进行递归式的检查是否正确滚动到底部了。
      // 因为使用了虚拟列表+内容异步加载，会导致只调用一次时可能会无法滚动到真正的底部。
      scrollBottomTaskRef.current = setTimeout(() => {
        scrollBottomTaskRef.current = null;

        virtualHandle((virIns) => {
          const { scrollElement, scrollRect, scrollOffset } = virIns;

          if (!(scrollElement && scrollRect && scrollOffset)) return;

          const scrollHeight = scrollElement.scrollHeight;
          const scrollbarHeight = scrollRect.height;

          // 增加5px的容错
          if (scrollOffset + scrollbarHeight < scrollHeight - 5) {
            scrollToBottom();
          }
        });
      }, 20);
    });
  });

  const tryScrollToBtmIfNeed = useMemoizedFn(() => {
    if (!autoScroll.get()) return;

    scrollToBottom();
  });

  const scrollList: IChatWindowContext['scrollList'] = useMemoizedFn((params) => {
    const { direction, distance } = params;

    virtualHandle((virIns) => {
      const curScrollTop = virIns.scrollOffset;

      if (curScrollTop) {
        const nextOffset = direction === 'top' ? curScrollTop - distance : curScrollTop + distance;
        virIns.scrollToOffset(nextOffset);
      }
    });
  });

  const { run: onListScroll } = useDebounceFn(
    (event) => {
      virtualHandle((virIns) => {
        const { scrollElement, scrollRect, scrollOffset } = virIns;

        if (!(scrollElement && scrollRect && scrollOffset)) return;

        const scrollHeight = scrollElement.scrollHeight;
        const scrollbarHeight = scrollRect.height;
        const scrollPositionRect = scrollOffset + scrollbarHeight;

        autoScroll.set(scrollPositionRect >= scrollHeight - 20);
      });
    },
    { wait: 0 }
  );

  return {
    autoScroll,
    virtualizerCell,
    scrollToBottom,
    tryScrollToBtmIfNeed,
    scrollList,
    onListScroll,
  };
};
