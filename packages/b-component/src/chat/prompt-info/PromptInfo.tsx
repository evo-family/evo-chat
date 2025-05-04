import { getAssistantPrompts, useChatWinCtx } from '@evo/data-store';
import { useCellValue } from '@evo/utils';
import { useAsyncEffect } from 'ahooks';
import React, { FC, memo, useState } from 'react';
import { Typography } from 'antd';

export interface IPromptInfoProps {}

export const PromptInfo: FC<IPromptInfoProps> = memo((props) => {
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [agentIds] = useCellValue(chatWin.configState.getCellSync('agentIds'));
  const [prompt, setPrompt] = useState<string>('');
  const [expanded, setExpanded] = useState(false);
  useAsyncEffect(async () => {
    if (!agentIds) return;
    const promptText = await getAssistantPrompts(agentIds);
    // 只保留前两行
    const lines = promptText?.slice(0, 2) || [];
    setPrompt(lines.join('\r\n'));
  }, [agentIds]);

  if (!prompt) return null;

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: 'var(--evo-color-fill-tertiary)',
        borderRadius: 8,
      }}
    >
      <Typography.Paragraph
        style={{
          marginBottom: 0,
          fontSize: 12,
          color: 'var(--evo-color-text-secondary)',
        }}
        ellipsis={{
          rows: 2,
          expandable: 'collapsible',
          expanded,
          onExpand: (_, info) => setExpanded(info.expanded),
        }}
        copyable
      >
        {prompt}
      </Typography.Paragraph>
    </div>
  );
});
