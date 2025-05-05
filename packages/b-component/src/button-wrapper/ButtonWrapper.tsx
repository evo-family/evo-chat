import React, { FC } from 'react';
import classNames from 'classnames';
import s from './buttonWrapper.module.scss';

export interface IButtonWrapperProps {
  style?: React.CSSProperties;
  className?: string;
  /**
   * 底部操作按钮
   */
  buttonNode: React.ReactNode;

  /**
   * 填充内容, 如果是字符串，会自动添加wrapper-text，如果是ReactNode，则直接渲染
   */
  children?: React.ReactNode;

  onClick?: () => void;
}

export const ButtonWrapper: FC<IButtonWrapperProps> = (props) => {
  const { style, className, children, buttonNode, onClick } = props;
  return (
    <div style={style} onClick={onClick} className={classNames(s['button-wrapper'], className)}>
      {children && (
        <div className={s['content']}>
          {typeof children === 'string' ? <div className={s['text']}>{children}</div> : children}
        </div>
      )}
      <div className={s['button']}>{buttonNode}</div>
    </div>
  );
};
