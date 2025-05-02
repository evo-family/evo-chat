import { Button, Divider, Select, SelectProps } from 'antd';
import React, { FC, memo, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { PlusOutlined } from '@ant-design/icons';
import { useMcpOptions } from '@evo/data-store';

export interface ISelectorMcpProps extends SelectProps {
  value?: string[];
  showAddMcp?: boolean; // 控制是否显示添加MCP按钮
}

export const SelectorMcp: FC<ISelectorMcpProps> = memo((props) => {
  const { value, onChange, showAddMcp = true, ...otherProps } = props;
  const navigate = useNavigate();
  const { mcpOptions } = useMcpOptions();

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
      dropdownRender={(menu) => (
        <>
          {menu}
          {showAddMcp && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <Button
                style={{ width: '100%' }}
                type="text"
                icon={<PlusOutlined />}
                onClick={() => {
                  navigate('/mcp');
                }}
              >
                添加 MCP
              </Button>
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
