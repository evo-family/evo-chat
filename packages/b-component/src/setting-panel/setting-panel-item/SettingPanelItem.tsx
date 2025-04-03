import React, { FC, useMemo } from 'react';
import classNames from 'classnames';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import s from './SettingPanelItem.module.scss';

export interface ISettingPanelItemProps {
  style?: React.CSSProperties;
  className?: string;
  /**
   * 方向
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * 标题
   */
  title?: React.ReactNode;

  /**
   * 标题最大宽度
   */
  titleMaxWidth?: number | string;

  titleBeforeIcon?: React.ReactNode;

  /**
   * 标题后图标
   */
  titleAfterIcon?: React.ReactNode;

  /**
   * tip内容提示
   */
  tips?: React.ReactNode;

  /**
   * 是否必填
   */
  required?: boolean;

  /**
   * 大小，默认 middle
   */
  titleSize?: 'small' | 'middle' | 'large';

  /**
   * 底部信息描述
   */
  description?: React.ReactNode;

  onTitleClick?: (e: React.MouseEvent) => void;

  children?: React.ReactNode;
}

export const SettingPanelItem: FC<ISettingPanelItemProps> = (props) => {
  const {
    style,
    titleSize = 'middle',
    titleMaxWidth,
    className,
    tips,
    direction = 'vertical',
    title,
    titleBeforeIcon,
    titleAfterIcon,
    onTitleClick,
    description,
    children,
    required,
  } = props;

  /**
   * 计算class
   */
  const calculationClass = useMemo(() => {
    if (title && children) {
      return direction === 'horizontal' ? 'has-htc' : 'has-vtc';
    } else if (title) {
      return 'has-vt';
    } else if (children || description) {
      return 'has-vc';
    }
    return '';
  }, [title, children]);

  /**
   * 标题样式
   */
  const titleStyle = useMemo(() => {
    if (titleMaxWidth) {
      return {
        maxWidth: titleMaxWidth,
      };
    }
    return {};
  }, [titleMaxWidth]);

  const renderTips = () => {
    if (!tips) return null;

    if (typeof tips === 'string') {
      return (
        <Tooltip title={tips} placement="top">
          <span className={s['evo-setting-title-tooltips']}>
            <QuestionCircleOutlined className="small" />
          </span>
        </Tooltip>
      );
    }
    return <span className={s['evo-setting-title-tooltips']}>{tips}</span>;
  };

  const renderTitle = () => {
    if (!title) return null;

    return (
      <div className={s['evo-setting-title']} style={titleStyle}>
        {titleBeforeIcon}
        <strong
          onClick={onTitleClick}
          className={classNames(s['evo-setting-title-name'], {
            [s['evo-setting-title-name-small']]: titleSize === 'small',
            [s['evo-setting-title-name-middle']]: titleSize === 'middle',
            [s['evo-setting-title-name-large']]: titleSize === 'large',
          })}
        >
          {title}
          {titleAfterIcon}
        </strong>
        {required && <span className={s['evo-setting-title-required']}>*</span>}
        {renderTips()}
      </div>
    );
  };

  return (
    <div
      style={style}
      className={classNames(
        s['evo-setting'],
        s[`evo-setting-${direction}`],
        {
          [s[`evo-setting-${calculationClass}`]]: calculationClass,
        },
        className
      )}
    >
      {(title || children) && (
        <div className={s['evo-setting-container']}>
          {renderTitle()}
          {children && <div className={s['evo-setting-control']}>{children}</div>}
        </div>
      )}
      {description && <div className={s['evo-setting-description']}>{description}</div>}
    </div>
  );
};
