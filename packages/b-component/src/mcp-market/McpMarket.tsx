import { Tabs, TabsProps } from 'antd';
import React, { FC } from 'react';

export interface IMcpMarketProps {}

export const McpMarket: FC<IMcpMarketProps> = (props) => {
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '系统内置',
      children: 'Content of Tab Pane 1',
    },
    {
      key: '2',
      label: 'Evo',
      children: 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: 'Tab 3',
      children: 'Content of Tab Pane 3',
    },
  ];

  const onChange = () => {};
  return (
    <div>
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </div>
  );
};
