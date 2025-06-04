import React, { FC, useState, useMemo, forwardRef } from 'react';
import { Select } from 'antd';
import { Popup, SearchBar, CheckList } from 'antd-mobile';
import classNames from 'classnames';
import { isMobile } from '@evo/utils';
import styles from './EvoSelect.module.less';
import { DefaultOptionType } from 'antd/es/select';
import { WebEvoSelect } from './WebEvoSelect';
import { MobileEvoSelect } from './MobileEvoSelect';

export interface EvoSelectProps {
  style?: React.CSSProperties;
  className?: string;
  placeholder?: string;

  open?: boolean;
  showSearch?: boolean;
  onDropdownVisibleChange?: (open: boolean) => void;

  value?: any;
  onChange?: (value: any) => void;
  options: DefaultOptionType[];

  optionRender?: (option: DefaultOptionType) => React.ReactNode;

  // antd Select Props
  selectProps?: import('antd/es/select').SelectProps;
}

export const EvoSelect = React.forwardRef<any, EvoSelectProps>((props, ref) => {

  if (isMobile()) {
    return <MobileEvoSelect  {...props}>
      <WebEvoSelect {...props} open={false} ref={ref} />
    </MobileEvoSelect>
  }

  return (
    <WebEvoSelect ref={ref} {...props} />
  );
});

