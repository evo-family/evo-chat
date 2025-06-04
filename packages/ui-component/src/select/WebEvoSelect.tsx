import { Select } from 'antd';
import style from 'antd/es/affix/style';
import React, { FC } from 'react';
import { EvoSelectProps } from './EvoSelect';

export interface IWebEvoSelectProps extends EvoSelectProps {
}

export const WebEvoSelect = React.forwardRef<any, EvoSelectProps>((props, ref) => {
  const { className, style, value, onChange, options, placeholder, selectProps, ...restProps } = props;
  return (
    <Select
      ref={ref}
      className={className}
      style={style}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      showSearch={false}
      {...selectProps}
      {...restProps}
    />
  );
})

