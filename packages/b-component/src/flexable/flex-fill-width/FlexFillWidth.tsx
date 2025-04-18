import React, { HTMLAttributes, PropsWithChildren } from 'react';

import cxb from 'classnames/bind';
import style from './Style.module.scss';

const cx = cxb.bind(style);

export interface IFlexFillWidthProps extends HTMLAttributes<HTMLDivElement> {
  wrapClassName?: string;
  wrapStyle?: React.CSSProperties;
}

export const FlexFillWidth = React.memo<PropsWithChildren<IFlexFillWidthProps>>(
  React.forwardRef((props) => {
    const { wrapClassName, wrapStyle, className, children, ...restContentProps } = props;

    return (
      <div className={cx(['flex-fill-wrap', wrapClassName])} style={wrapStyle}>
        <div className={cx(['flex-fill-content', className])} {...restContentProps}>
          {children}
        </div>
      </div>
    );
  })
);
