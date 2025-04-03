import { useConvertModelSelect, useModelOptionsData } from '@evo/component';
import { IAvailableModel } from '@evo/types';
import { Select } from 'antd';
import React, { FC, memo, useEffect, useMemo } from 'react';

export interface IDefaultModelSelectProps {
  style?: React.CSSProperties;
  className?: string;
  value: IAvailableModel;
  onChange: (value: IAvailableModel) => void;
}

export const DefaultModelSelect: FC<IDefaultModelSelectProps> = memo((props) => {
  const { value, onChange, style, className } = props;
  const modelOptions = useModelOptionsData({
    showProvider: true
  });
  const { getSelectValue, getSelectChangeModels, } = useConvertModelSelect();


  const selectValue = useMemo(() => {
    return getSelectValue([value])
  }, [value]);

  const handleChange = (value: string) => {
    const models = getSelectChangeModels(value);
    onChange(models[0]);
  }

  return (
    <Select
      className={className}
      value={selectValue?.[0]}
      style={{ width: 400, ...style }}
      onChange={handleChange}
      options={modelOptions}
      tagRender={() => {
        return <>23</>
      }}
    />
  );
})

