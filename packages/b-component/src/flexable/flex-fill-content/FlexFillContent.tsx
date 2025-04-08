import React, { HTMLAttributes, PropsWithChildren } from 'react';

import cxb from 'classnames/bind';
import style from './Style.module.scss';

const cx = cxb.bind(style);

export interface IFlexFillContentProps extends HTMLAttributes<HTMLDivElement> {
  wrapClassName?: string;
  wrapStyle?: React.CSSProperties;
}

export const FlexFillContent = React.memo<PropsWithChildren<IFlexFillContentProps>>((props) => {
  const { wrapClassName, className, wrapStyle, children, ...restContentProps } = props;

  return (
    <div className={cx(['container', wrapClassName])} style={wrapStyle}>
      <div className={cx(['content', className])} {...restContentProps}>
        {children}
      </div>
    </div>
  );
});
