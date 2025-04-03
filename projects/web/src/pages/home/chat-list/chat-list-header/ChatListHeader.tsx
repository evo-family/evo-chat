import React, { FC } from 'react';
import { Button, Tooltip } from 'antd';
import { MenuFoldOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import s from './ChatListHeader.module.scss';
import { EvoIcon, useAntdToken } from '@evo/component';
import classNames from 'classnames';

interface IChatListHeaderProps {
  onCollapse?: () => void;
  onSearch?: () => void;
  onNewChat?: () => void;
}

export const ChatListHeader: FC<IChatListHeaderProps> = ({ onCollapse, onSearch, onNewChat }) => {
  const token = useAntdToken();
  return (
    <div className={s.header}>
      {/* <Tooltip title="收起侧边栏">
        <Button
          type="text"
          className={s.collapseBtn}
          icon={<MenuFoldOutlined />}
          onClick={onCollapse}
        />
      </Tooltip> */}
      <Button
        className={classNames('evo-button-icon')}
        onClick={onNewChat}
        variant="filled"
        color="default"
        icon={<EvoIcon size={'small'} type="icon-message" />}
      >
        <span style={{ fontSize: 13 }}>开启新对话</span>
      </Button>
      <div className={s.actions}>
        <Tooltip title="搜索">
          <Button
            className={classNames('evo-button-icon')}
            style={{ color: token.colorTextTertiary }}
            type="text"
            icon={<EvoIcon size={'small'} type="icon-search" />}
            onClick={onSearch}
          />
        </Tooltip>
      </div>
    </div>
  );
};
