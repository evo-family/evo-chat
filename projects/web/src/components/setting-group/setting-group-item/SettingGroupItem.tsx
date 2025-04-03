import { Flex, List } from 'antd';
import React, { FC, memo } from 'react';

export interface ISettingGroupItemProps {
  style?: React.CSSProperties;
  className?: string
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

export const SettingGroupItem: FC<ISettingGroupItemProps> = memo((props) => {
  const { children, title, description, style, className } = props;
  return (
    <List.Item style={style} className={className}>
      <Flex style={{ width: '100%' }} align='center' justify='space-between'>
        <div>
          <div style={{ color: 'var(--evo-color-text-secondary)' }}>{title}</div>
          {description && (
            <div style={{ fontSize: '12px', color: 'var(--evo-color-text-quaternary)' }}>
              {description}
            </div>
          )}
        </div>
        {children}
      </Flex>
    </List.Item>
  );
})

