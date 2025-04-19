import { Avatar, Button, Divider, Select, SelectProps, Space, Tag, Tooltip } from 'antd';
import React, { FC, memo, useState } from 'react';
import { useAsyncEffect } from 'ahooks';
import { useChatWinCtx } from '@evo/data-store';
import { EvoIcon } from '../../../icon';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import classNames from 'classnames';
import { McpBridgeFactory } from '@evo/platform-bridge';

export const McpSelectToolbar: FC = memo(() => {
  const navigate = useNavigate();
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectValues, setSelectValues] = useState<string[]>([]);
  const [mcpOptions, setMcpOptions] = useState<Array<{ label: string; value: string }>>([]);

  useAsyncEffect(async () => {
    // 获取 MCP 列表
    const res = await McpBridgeFactory.getInstance().getMcpList();
    if (res.success && res?.data) {
      setMcpOptions(
        res?.data?.map((mcp) => ({
          label: mcp.name,
          value: mcp.id,
        }))
      );

      // 设置当前选中的 MCP，只选择在可用列表中存在的 MCP
      const currentMcps = chatWin.getConfigState('mcpIds') || [];
      const availableMcpIds = res.data.map((mcp) => mcp.id);
      const validMcps = currentMcps.filter((mcpId) => availableMcpIds.includes(mcpId));
      setSelectValues(validMcps);
    }
  }, [chatWin]);

  const handleChange = async (values: string[]) => {
    const selectedMCPIds = mcpOptions
      .filter((opt) => values.includes(opt.value))
      .map((opt) => opt.value);

    chatWin.updateConfigMCPIds(selectedMCPIds);
    setSelectValues(values);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Tooltip title="选择 MCP">
        <Button
          className={classNames('evo-button-icon')}
          color={selectValues?.length ? 'primary' : 'default'}
          size="small"
          variant="text"
          icon={<EvoIcon size={'small'} type="icon-config" />}
          onClick={() => setSelectOpen(!selectOpen)}
        />
      </Tooltip>
      <Select
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
        options={mcpOptions}
        open={selectOpen}
        onDropdownVisibleChange={setSelectOpen}
        dropdownStyle={{ width: 200, left: -30 }}
        variant="borderless"
        dropdownRender={(menu) => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Button
              style={{ width: '100%' }}
              type="text"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectOpen(false);
                navigate('/mcp');
              }}
            >
              添加 MCP
            </Button>
          </>
        )}
      />
    </div>
  );
});
