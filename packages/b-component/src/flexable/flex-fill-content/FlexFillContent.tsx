import React, { PropsWithChildren } from 'react';

import cxb from 'classnames/bind';
import style from './Style.module.scss';

const cx = cxb.bind(style);

export interface IFlexFillContentProps {
  wrapClassName?: string;
  contentClassName?: string;
  wrapStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

export const FlexFillContent = React.memo<PropsWithChildren<IFlexFillContentProps>>((props) => {
  const { wrapClassName, contentClassName, wrapStyle, contentStyle, children } = props;

  return (
    <div className={cx(['container', wrapClassName])} style={wrapStyle}>
      <div className={cx(['content', contentClassName])} style={contentStyle}>
        {children}
      </div>
    </div>
  );
});
