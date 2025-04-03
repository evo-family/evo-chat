import { useChatWinCtx, useGlobalCtx } from '@evo/data-store';
import { Sender } from '../sender/Sender';
import React, { FC } from 'react';

import { Welcome } from '@ant-design/x';
import s from './WelcomeChat.module.scss';

export interface IWelcomeChatProps {}

export const WelcomeChat: FC<IWelcomeChatProps> = () => {
  const [handlePostMessage] = useChatWinCtx((ctx) => ctx.handlePostMessage);

  return (
    <div className={s.container}>
      <Welcome
        className={s.welcome}
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="欢迎使用 Evo Chat"
        description="AI 助手，让工作更高效"
      />
      <div className={s.sender}>
        <Sender onPostMessage={handlePostMessage} />
      </div>
    </div>
  );
};
