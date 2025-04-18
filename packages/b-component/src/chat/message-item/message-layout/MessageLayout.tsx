import React, { HTMLAttributes, PropsWithChildren, useMemo } from 'react';

import { Flex } from 'antd';
import { FlexFillWidth } from '../../../flexable/flex-fill-width/FlexFillWidth';
import { UserAvatar } from '../../../avatar/user/UserAvatar';
import cxb from 'classnames/bind';
import style from './MessageItem.module.scss';

const cx = cxb.bind(style);

export interface IMessageLayoutProps extends HTMLAttributes<HTMLDivElement> {
  avatar?: React.ReactNode;
  name?: React.ReactNode;
  time?: React.ReactNode;
  actionArea?: React.ReactNode;
}

export const MessageLayout = React.memo(
  React.forwardRef<HTMLDivElement, PropsWithChildren<IMessageLayoutProps>>((props, ref) => {
    const {
      children,
      avatar: AvatarComponent = <UserAvatar />,
      name,
      time,
      className,
      actionArea,
      ...restProps
    } = props;

    const titleContent = useMemo(() => {
      if (!name && !time && !actionArea) return null;

      return (
        <Flex className={style.user_title}>
          <Flex flex={0}>
            {name && (
              <Flex flex={'70%'} className={style.name}>
                {name}
              </Flex>
            )}
            {time && (
              <Flex flex="none" className={style.time}>
                {time}
              </Flex>
            )}
          </Flex>
          {actionArea && (
            <Flex className={style['action-area']} flex={'30%'}>
              {actionArea}
            </Flex>
          )}
        </Flex>
      );
    }, [name, time, actionArea]);

    return (
      <Flex ref={ref} className={cx(['container', className])} {...restProps}>
        {AvatarComponent && (
          <Flex flex={0} className={style.avatar}>
            {AvatarComponent}
          </Flex>
        )}
        <FlexFillWidth>
          <div>
            {titleContent}
            {children}
          </div>
        </FlexFillWidth>
      </Flex>
    );
  })
);
