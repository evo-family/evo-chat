import { Button, Divider, Dropdown, Empty, Input, Menu, MenuProps, Space, theme } from 'antd';
import { useAssistantCreateWindow, useAssistantFrequentData } from '@evo/data-store';
import React, { FC, useMemo, useState } from 'react';
import { IAssistantMeta } from '@evo/types';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { EvoIcon } from '../../icon';
import { AssistantAvatar } from '../../avatar/assistant/AssistantAvatar';

const { useToken } = theme;
export interface SelectorAssistantProps {
  /**
   * 选中的值
   */
  value?: string;
  /**
   * 值改变时的回调
   */
  onChange?: (value: string, option: IAssistantMeta) => void;
  /**
   * 触发元素
   */
  children?: React.ReactNode;

  showAddAssistant?: boolean;
  showItemIcon?: boolean;
}

export const SelectorAssistant: FC<SelectorAssistantProps> = (props) => {
  const navigate = useNavigate();
  const { value, onChange, children, showAddAssistant, showItemIcon = true } = props;
  const { createAssistantWindow } = useAssistantCreateWindow();
  const [searchText, setSearchText] = useState('');
  const { frequentAssistants } = useAssistantFrequentData({ searchText });

  const data = useMemo(() => {
    if (!showItemIcon) {
      return frequentAssistants;
    }
    return frequentAssistants.map((group) => ({
      ...group,
      children: group.children.map((item) => ({
        ...item,
        icon: <AssistantAvatar avatar={item.data?.avatar} width={16} />,
      })),
    }));
  }, [frequentAssistants]);

  const { token } = useToken();
  const contentStyle: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  };

  const menuStyle: React.CSSProperties = {
    boxShadow: 'none',
    maxHeight: 400,
    overflow: 'auto',
  };

  const handleClick = ({ item }: any) => {
    const data = item?.props?.data as IAssistantMeta;
    if (data) {
      createAssistantWindow(data);
    }
  };

  const renderMenu = (menu: React.ReactNode) => {
    if (!frequentAssistants?.length) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="ant-empty-small"
          style={{ margin: '30px 0' }}
          description={searchText ? '未找到相关助手' : '暂无常用助手，请添加'}
        />
      );
    }

    return React.cloneElement(
      menu as React.ReactElement<{
        style: React.CSSProperties;
      }>,
      { style: menuStyle }
    );
  };

  return (
    <Dropdown
      overlayStyle={{
        width: 300,
      }}
      trigger={['click']}
      dropdownRender={(menu) => {
        return (
          <div style={contentStyle}>
            <div style={{ padding: '8px 12px 0px 12px' }}>
              <Input
                placeholder="搜索助手"
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
            {renderMenu(menu)}
            {showAddAssistant && (
              <>
                <Divider style={{ margin: 0 }} />
                <Space style={{ padding: 8, alignItems: 'center' }}>
                  <Button
                    style={{ width: '100%' }}
                    type="text"
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={() => {
                      navigate('/assistant');
                    }}
                  >
                    添加常用助手
                  </Button>
                </Space>
              </>
            )}
          </div>
        );
      }}
      menu={{
        items: data as MenuProps['items'],
        onClick: handleClick,
      }}
    >
      {children}
    </Dropdown>
  );
};
