import { Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import React from 'react';
import style from './Style.module.scss';
import { useChatWinCtx } from '@evo/data-store';

export interface IScrollToBotttonProps {}

export const ScrollToBottton = React.memo<IScrollToBotttonProps>((props) => {
  const [autoScroll] = useChatWinCtx((ctx) => ctx.autoScroll);
  const [scrollToBottom] = useChatWinCtx((ctx) => ctx.scrollToBottom);

  if (autoScroll) return null;

  return (
    <div className={style['scroll-to-bottom']}>
      <Button
        className={style.button}
        shape="circle"
        icon={<DownOutlined />}
        onClick={scrollToBottom}
      />
    </div>
  );
});
