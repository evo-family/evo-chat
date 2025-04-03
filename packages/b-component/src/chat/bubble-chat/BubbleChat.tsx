import { Attachments, Bubble } from '@ant-design/x';
import { UserOutlined } from '@ant-design/icons';
import { Flex, GetProp } from 'antd';
import React, { FC, memo } from 'react';

import { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList';
import { ErrorMessage } from './components/error-message/ErrorMsg';
import { MarkdownRender } from '../../markdown-render/MarkdownRender';
import style from './BubbleChat.module.scss';
export interface IBubbleChatProps {
  contents: BubbleDataType[];
}

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  system: {
    placement: 'start',
    typing: false,
    // avatar: { icon: <UserAvatar />, style: { background: '#fde3cf' } },
  },
  error: {
    placement: 'start',
    typing: false,
    messageRender: (content) => {
      return <ErrorMessage text={content} />;
    },
  },
  user: {
    placement: 'start',
    // avatar: { icon: <UserAvatar />, style: {} },
    // variant: 'borderless',
    typing: false,
    messageRender: (content) => {
      if (React.isValidElement(content)) {
        return content;
      }
      return <MarkdownRender content={content} />;
    },
  },
  assistant: {
    placement: 'start',
    messageRender(content) {
      return <MarkdownRender content={content as string} />;
    },
  },
  file: {
    placement: 'start',
    avatar: { icon: <UserOutlined />, style: { visibility: 'hidden' } },
    variant: 'borderless',
    messageRender: (items: any) => {
      return (
        <Flex vertical gap="middle">
          {(items as any[]).map((item) => (
            <Attachments.FileCard key={item.uid} item={item} />
          ))}
        </Flex>
      );
    },
  },
};

export const BubbleChat: FC<IBubbleChatProps> = memo((props) => {
  return <Bubble.List className={style.container} roles={roles} items={props.contents} />;
});
