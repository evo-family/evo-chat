import React, { FC } from 'react';

import { Button, Dropdown, MenuProps, Space } from 'antd';
import { EvoIcon } from '@evo/component';
import { SearchChat } from '../chat-search/ChatSearch';
import classNames from 'classnames';
import s from './ChatListHeader.module.scss';

interface IChatListHeaderProps {
  onNewChat?: () => void;
}

export const ChatListHeader: FC<IChatListHeaderProps> = ({ onNewChat }) => {
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
          1st menu item
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
          2nd menu item
        </a>
      ),
    },
    {
      key: '3',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
          3rd menu item
        </a>
      ),
    },
  ];

  return (
    <div className={s.header}>
      <Space>
        <Button
          className={classNames('evo-button-icon')}
          onClick={onNewChat}
          variant="filled"
          color="default"
          icon={<EvoIcon size={'small'} type="icon-message" />}
        >
          <span style={{ fontSize: 13 }}>新对话</span>
        </Button>
        {/* <Dropdown menu={{ items }} placement="bottomLeft">
          <Button
            className={classNames('evo-button-icon')}
            // onClick={onNewChat}
            variant="filled"
            color="default"
            icon={<EvoIcon size={'small'} type="icon-assistant" />}
          >
            <span style={{ fontSize: 13 }}>助手</span>
          </Button>
        </Dropdown> */}
      </Space>

      <div className={s.actions}>
        <SearchChat />
      </div>
    </div>
  );
};
