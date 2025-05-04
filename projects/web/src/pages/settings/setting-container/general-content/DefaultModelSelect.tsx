import { SelectorModel } from '@evo/component';
import { IAvailableModel } from '@evo/types';
import { SelectProps } from 'antd/lib';
import React, { FC, memo } from 'react';

export interface IDefaultModelSelectProps extends SelectProps {
  style?: React.CSSProperties;
  className?: string;
  value?: IAvailableModel;
  onChange?: (value: IAvailableModel) => void;
}

export const DefaultModelSelect: FC<IDefaultModelSelectProps> = memo((props) => {
  const { value, onChange, style, className, ...otherProps } = props;

  return (
    <SelectorModel
      style={{ width: 400, ...style }}
      className={className}
      value={value}
      onChange={onChange}
      useModelOptionsParams={{ showProvider: true }}
      {...otherProps}
    />
  );
});
