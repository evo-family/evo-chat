import { PlusOutlined } from '@ant-design/icons';
import { useKnowledgeLogic } from '@evo/data-store';
import { Button, Divider, Input, Select, SelectProps, Space } from 'antd';
import React, { FC, memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { EvoIcon } from '../../icon';

export interface ISelectorKnowledgeProps extends SelectProps {
  value?: string[];
  showAddKnowledge?: boolean; // 控制是否显示添加MCP按钮
}

export const SelectorKnowledge: FC<ISelectorKnowledgeProps> = memo((props) => {
  const { value, onChange, showAddKnowledge = true, ...otherProps } = props;
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const { filteredKnowledgeList } = useKnowledgeLogic({ searchText });

  const knowledgeOptions = useMemo(() => {
    return filteredKnowledgeList?.map((item) => ({
      label: <Space align="center">{item.name}</Space>,
      value: item.id,
    }));
  }, [filteredKnowledgeList]);

  const selectValue = useMemo(() => {
    if (!value || !knowledgeOptions) return [];

    // 过滤出在 mcpOptions 中存在的值
    return value.filter((val) => knowledgeOptions.some((k) => k.value === val));
  }, [value, knowledgeOptions]);

  const handleChange = (values: string[]) => {
    onChange?.(values);
  };
  return (
    <Select
      placeholder="请选择知识库"
      {...otherProps}
      className="evo-select"
      dropdownStyle={{
        padding: 0,
        ...otherProps.dropdownStyle,
      }}
      dropdownRender={(menu) => (
        <>
          <div style={{ padding: '8px 8px 0px 8px' }}>
            <Input
              placeholder="搜索知识库"
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              prefix={<EvoIcon type="icon-search" size="small" style={{ color: '#999' }} />}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !searchText) {
                  e.stopPropagation();
                }
              }}
            />
          </div>
          <div className="evo-select-menu">{menu}</div>
          {showAddKnowledge && (
            <>
              <Divider style={{ margin: 0 }} />
              <Space style={{ padding: 8, alignItems: 'center' }}>
                <Button
                  style={{ width: '100%' }}
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    navigate('/file');
                  }}
                >
                  添加知识库
                </Button>
              </Space>
            </>
          )}
        </>
      )}
      mode={'multiple'}
      value={selectValue}
      onChange={handleChange}
      options={knowledgeOptions}
    />
  );
});
