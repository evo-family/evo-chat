import { Button, Divider, Flex, Select, SelectProps, Space, Switch } from 'antd';
import React, { FC, memo, useMemo } from 'react';
import { useMcpExeMode, useMcpOptions } from '@evo/data-store';

import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';

export interface ISelectorMcpProps extends SelectProps {
  value?: string[];
  showAddMcp?: boolean; // 控制是否显示添加MCP按钮
}

export const SelectorMcp: FC<ISelectorMcpProps> = memo((props) => {
  const { value, onChange, showAddMcp = true, ...otherProps } = props;
  const navigate = useNavigate();
  const { mcpOptions } = useMcpOptions();
  const { isCompatibleMode, handleSwitchModeChange } = useMcpExeMode();

  const selectValue = useMemo(() => {
    if (!value || !mcpOptions) return [];

    // 过滤出在 mcpOptions 中存在的值
    return value.filter((val) =>
      mcpOptions.some((group) => group.options.some((option) => option.value === val))
    );
  }, [value, mcpOptions]);

  const handleChange = (values: string[]) => {
    onChange?.(values);
  };

  return (
    <Select
      placeholder="请选择MCP"
      {...otherProps}
      className="evo-select"
      dropdownStyle={{
        padding: 0,
        ...otherProps.dropdownStyle,
      }}
      dropdownRender={(menu) => (
        <>
          <div className="evo-select-menu">{menu}</div>
          {showAddMcp && (
            <>
              <Divider style={{ margin: 0 }} />
              <Flex align="center" justify="space-between" style={{ padding: 8 }}>
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    navigate('/mcp');
                  }}
                >
                  添加 MCP
                </Button>
                <Switch
                  checkedChildren="兼容"
                  unCheckedChildren="原生"
                  checked={isCompatibleMode}
                  onChange={handleSwitchModeChange}
                />
              </Flex>
            </>
          )}
        </>
      )}
      mode={'multiple'}
      value={selectValue}
      onChange={handleChange}
      options={mcpOptions}
    />
  );
});
