import {
  ChatWinContextProvider,
  IMessageConfig,
  ISearchChatResultItem,
  ISearchMsgResultItem,
} from '@evo/data-store';
import { Divider, Flex, Menu, MenuProps, Modal, Popover, Splitter } from 'antd';
import Highlighter, { HighlighterProps } from 'react-highlight-words';
import React, { ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { ChatMessageList } from '@/chat/message-list/MessageList';
import { CollectionLayout } from '../../../collection-layout/CollectionLayout';
import { MessageLayout } from '@/chat/message-item/message-layout/MessageLayout';
import { ModelAvatar } from '../../../avatar/model/ModelAvatar';
import Style from './Style.module.scss';
import cxb from 'classnames/bind';
import { formatChatStringTime } from '../../../utils/format';
import { useGlobSearchCtx } from '../../context/SearchContext';
import { useMemoizedFn } from 'ahooks';
import { useVirtualizer } from '@tanstack/react-virtual';

const cx = cxb.bind(Style);

export interface ISearchChatContent {
  searchResult: ISearchChatResultItem[];
}

export interface IMessagesMatchListProps {
  chatWinSearchItem: ISearchChatResultItem;
  msgSearchResult: ISearchMsgResultItem[];
  HilightRender: (props: { text: string } & Partial<HighlighterProps>) => ReactNode;
}

const MessagesMatchList = React.memo<IMessagesMatchListProps>((props) => {
  const { chatWinSearchItem, msgSearchResult, HilightRender } = props;

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMsgConfig, setDetailMsgConfig] = useState<IMessageConfig | undefined>(undefined);

  const containerRef = useRef(null);

  const showMsgDetail = useMemoizedFn((msgConfig: IMessageConfig) => {
    setDetailMsgConfig(msgConfig);
    setShowDetailModal(true);
  });

  const virtualizer = useVirtualizer({
    count: msgSearchResult?.length ?? 0,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 120, // 预估高度
    getItemKey: (index) => index, // 使用消息ID作为缓存key
    overscan: 3, // 预渲染数量
  });

  return (
    <div ref={containerRef} className={cx('search-result-list')}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const { key, index, start } = virtualItem;
          const msgSearchData = msgSearchResult[index]; // 获取数据
          const { msgConfig, answersResult } = msgSearchData;

          return (
            <div
              key={key}
              data-index={index}
              className={cx('match-message')}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${start ?? 0}px)`,
              }}
            >
              <MessageLayout
                avatar={null}
                time={formatChatStringTime(msgConfig.createdTime)}
                actionArea={() => (
                  <Flex justify="flex-end">
                    <div className={cx('detail-button')} onClick={() => showMsgDetail(msgConfig)}>
                      查看原文
                    </div>
                  </Flex>
                )}
              >
                <div className={cx('match-message-text')}>
                  <HilightRender text={msgConfig.sendMessage} />
                </div>
              </MessageLayout>
              <CollectionLayout
                data={answersResult}
                itemRender={(answerSearchData) => {
                  const { answerConfig } = answerSearchData;

                  return (
                    <MessageLayout
                      className={cx('match-answer-text')}
                      avatar={<ModelAvatar modelName={answerConfig.model} />}
                      time={formatChatStringTime(answerConfig.createdTime)}
                    >
                      <HilightRender text={answerSearchData.matchText} />
                    </MessageLayout>
                  );
                }}
              />
              <Divider />
            </div>
          );
        })}
      </div>
      <Modal
        destroyOnClose
        maskClosable={false}
        width={'80vw'}
        open={showDetailModal}
        footer={null}
        title={chatWinSearchItem.title}
        onCancel={() => setShowDetailModal(false)}
      >
        <ChatWinContextProvider
          winId={chatWinSearchItem?.chatWinId}
          options={{
            features: {
              messageList: {
                answerMaximizable: false,
              },
            },
          }}
        >
          <div className={cx('search-chat-detail')}>
            <ChatMessageList
              initialScrollEnd={false}
              onFirstRendered={(cbContext) => {
                const matchMsgIndex = chatWinSearchItem.chatConfig.messageIds.findIndex(
                  (id) => id === detailMsgConfig?.id
                );

                cbContext.virtualizer.scrollToIndex(matchMsgIndex, { align: 'start' });
              }}
            />
          </div>
        </ChatWinContextProvider>
      </Modal>
    </div>
  );
});

export const SearchChatContentList = React.memo<ISearchChatContent>((props) => {
  const { searchResult } = props;

  const [keywords, keywordsCell] = useGlobSearchCtx((ctx) => ctx.keywords);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const HilightRender = useMemo(() => {
    return (props: { text: string } & Partial<HighlighterProps>) => (
      <Highlighter
        autoEscape
        highlightClassName={cx('hightlight-text')}
        searchWords={keywordsCell.get()}
        textToHighlight={props.text}
        {...props}
      />
    );
  }, [searchResult]);

  const chatWinItems = useMemo(() => {
    const menuItems: MenuProps['items'] = searchResult.map((seachItem) => {
      const option: NonNullable<MenuProps['items']>[0] = {
        key: seachItem.chatWinId,
        label: (
          <HilightRender className={cx('search-chatWin-content')} text={seachItem.matchText} />
        ),
      };

      return option;
    });

    return menuItems;
  }, [searchResult]);

  useLayoutEffect(() => {
    const firstItemKey = chatWinItems?.at(0)?.key as string;
    setSelectedKeys(firstItemKey ? [firstItemKey] : []);
  }, [chatWinItems]);

  const selectedWinSearch = useMemo(() => {
    const firstKey = selectedKeys.at(0);

    if (!firstKey) return;

    return searchResult.find((searchItem) => searchItem.chatWinId === firstKey);
  }, [selectedKeys]);

  const handleSelect = useMemoizedFn<Required<MenuProps>['onSelect']>((selectedInfo) => {
    setSelectedKeys([selectedInfo.key]);
  });

  if (!searchResult.length) {
    return '暂无搜索结果';
  }

  return (
    <>
      <Splitter>
        <Splitter.Panel collapsible defaultSize={260} min={200} max="50%">
          <div className={cx('search-result')}>
            <Menu
              selectedKeys={selectedKeys}
              mode="inline"
              items={chatWinItems}
              onSelect={handleSelect}
            />
          </div>
        </Splitter.Panel>
        <Splitter.Panel collapsible>
          {selectedWinSearch ? (
            <MessagesMatchList
              key={selectedWinSearch.chatWinId}
              HilightRender={HilightRender}
              chatWinSearchItem={selectedWinSearch}
              msgSearchResult={selectedWinSearch.msgsResult}
            />
          ) : (
            '没有匹配的消息记录'
          )}
        </Splitter.Panel>
      </Splitter>
    </>
  );
});
