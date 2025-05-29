import { useCellValue, useCellValueSelector } from '@evo/utils';
import { useChatWinCtx, useChatWinOrgCtx } from '@/react-context/window/context';

import { EMCPExecuteMode } from '@evo/types';
import { useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';

export const useMcpExeMode = () => {
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [mcpExecuteMode] = useCellValue(chatWin.configState.getCellSync('mcpExecuteMode'));

  const isCompatibleMode = useMemo(() => {
    return mcpExecuteMode === EMCPExecuteMode.COMPATIBLE;
  }, [mcpExecuteMode]);

  const handleSwitchModeChange = useMemoizedFn((checked: boolean) => {
    const nextMode = checked ? EMCPExecuteMode.COMPATIBLE : EMCPExecuteMode.FUNCTION_CALL;

    chatWin.setConfigState('mcpExecuteMode', nextMode);
  });

  return { mcpExecuteMode, isCompatibleMode, handleSwitchModeChange };
};
