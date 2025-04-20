import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { GlobalSearchContextProvider } from './context/SearchContext';
import { ISearchComponentBasicProps } from './types';
import { SearchChatContent } from './components/chat-content/SearchChatContent';
import Style from './Style.module.scss';
import { Tabs } from 'antd';
import { TabsProps } from 'antd/lib';
import cxb from 'classnames/bind';

const cx = cxb.bind(Style);

export interface IGlobalSearchProps extends ISearchComponentBasicProps {
  keywords: string[];
}

export const GlobalSearch = React.memo<IGlobalSearchProps>((props) => {
  const { keywords } = props;

  const items = useMemo(() => {
    const tabItems: TabsProps['items'] = [
      {
        key: '1',
        label: '聊天内容',
        children: <SearchChatContent />,
      },
    ];

    return tabItems;
  }, [keywords]);

  return (
    <GlobalSearchContextProvider keywords={keywords}>
      <Tabs size="small" className={cx('gloabl-search')} defaultActiveKey="1" items={items} />
    </GlobalSearchContextProvider>
  );
});
