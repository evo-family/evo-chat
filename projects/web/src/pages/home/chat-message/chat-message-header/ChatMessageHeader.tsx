import React, { FC } from 'react';
import { Button, Tooltip } from 'antd';
import { MenuUnfoldOutlined, SettingOutlined } from '@ant-design/icons';
import s from './ChatMessageHeader.module.scss';
import classNames from 'classnames';
import { useHomeSelector } from '../../home-processor/HomeProvider';
import { EvoIcon, useAntdToken } from '@evo/component';

interface IChatMessageHeaderProps {
}

export const ChatMessageHeader: FC<IChatMessageHeaderProps> = ({
}) => {

  const [collapseSlider, collapseDrawer] = useHomeSelector(s => [s.collapseSlider, s.collapseDrawer])
  const token = useAntdToken();
  return (
    <div className={classNames(s.header, 'app-region-drag')}>
      <div className={s.left}>
        <Tooltip title="展开侧边栏">
          <Button
            style={{ color: token.colorTextTertiary }}
            className={'evo-button-icon'} type="text" icon={<EvoIcon size={'small'} type="icon-sidebar" />} onClick={collapseSlider} />
        </Tooltip>
      </div>
      <div className={s.center}>
        聊天标题
      </div>
      <div className={s.right}>
        <Tooltip title="模型设置">
          <Button type="text" icon={<SettingOutlined />} onClick={collapseDrawer} />
        </Tooltip>
      </div>
    </div>
  );
};
