import { Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import React from 'react';
import { scrollToBottom } from '../../utils/scroll';
import style from './Style.module.scss';
import { useChatWinCtx } from '@evo/data-store';
import { useMemoizedFn } from 'ahooks';

export interface IScrollToBotttonProps {
  onClick?: () => any;
}

export const ScrollToBottton = React.memo<IScrollToBotttonProps>((props) => {
  const [autoScroll] = useChatWinCtx((ctx) => ctx.autoScroll);
  const [listDOMRef] = useChatWinCtx((ctx) => ctx.listDOMRef);

  const handleBtnClick = useMemoizedFn(() => {
    scrollToBottom(listDOMRef.current);
  });

  if (autoScroll) return null;

  return (
    <div className={style['scroll-to-bottom']}>
      <Button
        className={style.button}
        shape="circle"
        icon={<DownOutlined />}
        onClick={handleBtnClick}
      />
    </div>
  );
});
