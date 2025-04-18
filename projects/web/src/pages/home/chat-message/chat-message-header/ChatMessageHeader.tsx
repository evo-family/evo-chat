import { Button, Flex, Tooltip } from 'antd';
import { EvoIcon, FlexFillWidth, useAntdToken } from '@evo/component';
import { MenuUnfoldOutlined, SettingOutlined } from '@ant-design/icons';
import React, { FC } from 'react';

import classNames from 'classnames';
import s from './ChatMessageHeader.module.scss';
import { useCellValue } from '@evo/utils';
import { useChatWinCtx } from '@evo/data-store';
import { useHomeSelector } from '../../home-processor/HomeProvider';

interface IChatMessageHeaderProps {}

export const ChatMessageHeader: FC<IChatMessageHeaderProps> = ({}) => {
  const [collapseSlider, collapseDrawer] = useHomeSelector((s) => [
    s.collapseSlider,
    s.collapseDrawer,
  ]);
  const token = useAntdToken();
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [chatTitle] = useCellValue(chatWin.title);

  return (
    <div className={classNames(s.header, 'app-region-drag')}>
      <div className={classNames(s.left, 'app-region-no-drag')}>
        <Tooltip title="展开侧边栏">
          <Button
            style={{ color: token.colorTextTertiary }}
            className={'evo-button-icon'}
            type="text"
            icon={<EvoIcon size={'small'} type="icon-sidebar" />}
            onClick={collapseSlider}
          />
        </Tooltip>
      </div>
      <FlexFillWidth className={s.center}>
        <div className={classNames(s['chat-title'], 'app-region-no-drag')}>{chatTitle}</div>
      </FlexFillWidth>
      <div className={classNames(s.right, 'app-region-no-drag')}>
        <Tooltip title="模型设置">
          <Button type="text" icon={<SettingOutlined />} onClick={collapseDrawer} />
        </Tooltip>
      </div>
    </div>
  );
};
