import { Button, Tooltip } from 'antd';
import React, { FC, memo, useEffect, useState } from 'react';
import { useChatWinCtx, useMcpOptions } from '@evo/data-store';
import { EvoIcon } from '../../../icon';
import classNames from 'classnames';
import { SelectorMcp } from '../../../selector';

export const McpSelectToolbar: FC = memo(() => {
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectValues, setSelectValues] = useState<string[]>([]);
  const { mcpOptions } = useMcpOptions();

  useEffect(() => {
    // 设置当前选中的 MCP，只选择在可用列表中存在的 MCP
    const currentMcps = chatWin.getConfigState('mcpIds') || [];
    setSelectValues(currentMcps);
  }, [chatWin]);

  const handleChange = async (values: string[]) => {
    chatWin.updateConfigMCPIds(values);
    setSelectValues(values);
  };

  // 获取已选择的MCP名称
  const getSelectedMcpNames = () => {
    if (!selectValues?.length || !mcpOptions) return '';

    const selectedNames: string[] = [];
    mcpOptions.forEach((group) => {
      group.options.forEach((option) => {
        if (selectValues.includes(option.value as string)) {
          selectedNames.push(option.label as string);
        }
      });
    });

    return selectedNames.join('、');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Tooltip title={selectValues.length > 0 ? `已选择: ${getSelectedMcpNames()}` : '选择 MCP'}>
        <Button
          className={classNames('evo-button-icon')}
          color={selectValues?.length ? 'primary' : 'default'}
          size="small"
          variant="text"
          icon={<EvoIcon size={'small'} type="icon-config" />}
          onClick={() => setSelectOpen(!selectOpen)}
        />
      </Tooltip>
      <SelectorMcp
        style={{ width: 0 }}
        mode="multiple"
        tagRender={() => <></>}
        maxCount={4}
        maxTagCount={'responsive'}
        suffixIcon={null}
        maxTagTextLength={5}
        showSearch={false}
        value={selectValues}
        getPopupContainer={(triggerNode) => {
          return (triggerNode.parentNode as HTMLElement) || document.body;
        }}
        onChange={handleChange}
        open={selectOpen}
        onDropdownVisibleChange={setSelectOpen}
        dropdownStyle={{ width: 200, left: -30 }}
        variant="borderless"
      />
    </div>
  );
});
