import { Button, Flex, Modal, Tooltip } from 'antd';
import { EvoIcon, GlobalSearch, SearchInput, useAntdToken } from '@evo/component';
import React, { useState } from 'react';
import { useDebounceFn, useMemoizedFn } from 'ahooks';

import Style from './Style.module.scss';
import classNames from 'classnames';
import cxb from 'classnames/bind';

const cx = cxb.bind(Style);

export interface ISearchChatProps {}

export const SearchChat = React.memo<ISearchChatProps>((props) => {
  const token = useAntdToken();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState<string[]>([]);

  const openSearchModal = useMemoizedFn(() => {
    setShowSearchModal(true);
  });

  const { run: handleSearch } = useDebounceFn(
    (value) => {
      if (!value) {
        setSearchKeywords([]);

        return;
      }

      setSearchKeywords(value.trim().split(/\s+/) ?? []);
    },
    { wait: 500 }
  );

  return (
    <>
      <Tooltip title="搜索">
        <Button
          className={classNames('evo-button-icon')}
          style={{ color: token.colorTextTertiary }}
          type="text"
          icon={<EvoIcon size={'small'} type="icon-search" />}
          onClick={openSearchModal}
        />
      </Tooltip>
      <Modal
        destroyOnClose
        maskClosable={false}
        width={'80vw'}
        open={showSearchModal}
        footer={null}
        onCancel={() => setShowSearchModal(false)}
      >
        <Flex vertical className={cx('search-chat-content')}>
          <div className={cx('search-header')}>
            <SearchInput
              autoFocus
              className={cx('search-input')}
              placeholder="搜索话题或消息内容..."
              onSearch={handleSearch}
            />
          </div>
          <Flex flex={1}>
            <GlobalSearch keywords={searchKeywords} />
          </Flex>
        </Flex>
      </Modal>
    </>
  );
});
