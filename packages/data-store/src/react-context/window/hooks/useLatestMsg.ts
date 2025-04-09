import { DataCell, GetDataCellValue } from '@evo/utils';
import { useLayoutEffect, useState } from 'react';

import { IChatWindowContext } from '../types';

export const useLatestMessage = (curWindowCell: IChatWindowContext['chatWin']) => {
  const [latestMsg] = useState(
    () => new DataCell<GetDataCellValue<IChatWindowContext['latestMsg']>>(undefined)
  );

  useLayoutEffect(() => {
    curWindowCell.listen((signal) => {
      const chatWin = signal.next;

      if (!chatWin) return;

      const subscription = chatWin.configState.listen(
        (msgIdsSignal) => {
          const latestMsgId = msgIdsSignal.cellInfo?.next?.at(-1);

          if (!latestMsgId) return;

          chatWin.getMessage(latestMsgId).then((msgIns) => latestMsg.set(msgIns));
        },
        { keys: ['messageIds'], immediate: true }
      );

      return () => subscription.unsubscribe();
    });
  }, [latestMsg, curWindowCell]);

  return latestMsg;
};
