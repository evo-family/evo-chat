import { Button, Input, Modal, Tooltip } from 'antd';
import { EvoIcon, useAntdToken } from '@evo/component';
import React, { useState } from 'react';

import Style from './Style.module.scss';
import classNames from 'classnames';
import cxb from 'classnames/bind';
import { useMemoizedFn } from 'ahooks';
import { useSearchChatContent } from '@evo/data-store';

const cx = cxb.bind(Style);

export interface ISearchChatProps {}

export const SearchChat = React.memo<ISearchChatProps>((props) => {
  const token = useAntdToken();

  const [showSearchModal, setShowSearchModal] = useState(true);

  const { searchResult, searchChatConent } = useSearchChatContent();

  const openSearchModal = useMemoizedFn(() => {
    setShowSearchModal(true);
  });

  const handleSearch = useMemoizedFn((event) => {
    searchChatConent(event.target.value);
  });

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
        open={showSearchModal}
        footer={null}
        onCancel={() => setShowSearchModal(false)}
      >
        <div className={cx('search-chat-content')}>
          <div className={cx('search-header')}>
            <Input
              autoFocus
              className={cx('search-input')}
              placeholder="搜索话题或消息内容..."
              onChange={handleSearch}
            />
          </div>
          <div className={cx('search-result')}></div>
        </div>
      </Modal>
    </>
  );
});
