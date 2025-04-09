import React from 'react';
import classNames from 'classnames';
import s from './Label.module.scss';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  style?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
  required?: boolean;
  bold?: boolean;  // 添加加粗属性
  children?: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({
  className,
  style,
  size = 'middle',
  required,
  bold,
  children,
  ...rest
}) => {
  const classes = classNames(
    s.label,
    {
      [s[size]]: size,
      [s.required]: required,
      [s.bold]: bold,  // 添加加粗样式类
    },
    className
  );

  return (
    <label className={classes} style={style} {...rest}>
      {children}
    </label>
  );
};
