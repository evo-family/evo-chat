import React, { PropsWithChildren, useMemo } from 'react';

import { Flex } from 'antd';
import { FlexFillWidth } from '../../../flexable/flex-fill-width/FlexFillWidth';
import cxb from 'classnames/bind';
import style from './MessageItem.module.scss';
import { UserAvatar } from '../../../avatar/user';

const cx = cxb.bind(style);

export interface IMessageLayoutProps {
  avatar?: React.ReactNode;
  name?: React.ReactNode;
  time?: React.ReactNode;
  actionArea?: React.ReactNode;
  className?: string;
}

export const MessageLayout = React.memo<PropsWithChildren<IMessageLayoutProps>>((props) => {
  const {
    children,
    avatar: AvatarComponent = <UserAvatar />,
    name,
    time,
    className,
    actionArea,
  } = props;

  const titleContent = useMemo(() => {
    if (!name && !time && !actionArea) return null;

    return (
      <>
        <Flex className={style.user_title}>
          <Flex flex={0}>
            {name && <span className={style.name}>{name}</span>}
            {time && <span className={style.time}>{time}</span>}
          </Flex>
          {actionArea && (
            <Flex className={style['action-area']} flex={1}>
              {actionArea}
            </Flex>
          )}
        </Flex>
      </>
    );
  }, [name, time, actionArea]);

  return (
    <Flex className={cx(['container', className])}>
      <Flex flex={0} className={style.avatar}>
        {AvatarComponent}
      </Flex>
      <FlexFillWidth>
        {titleContent}
        {children}
      </FlexFillWidth>
    </Flex>
  );
});
