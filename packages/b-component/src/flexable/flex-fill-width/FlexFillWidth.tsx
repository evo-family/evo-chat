import React, { PropsWithChildren } from 'react';

import cxb from 'classnames/bind';
import style from './Style.module.scss';

const cx = cxb.bind(style);

export interface IFlexFillWidthProps {
  wrapClassName?: string;
  contentClassName?: string;
  wrapStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

export const FlexFillWidth = React.memo<PropsWithChildren<IFlexFillWidthProps>>((props) => {
  const { wrapClassName, contentClassName, wrapStyle, contentStyle, children } = props;

  return (
    <div className={cx(['flex-fill-wrap', wrapClassName])} style={wrapStyle}>
      <div className={cx(['flex-fill-content', contentClassName])} style={contentStyle}>
        {children}
      </div>
    </div>
  );
});
