import { Input, InputProps } from 'antd';
import React, { FC } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';

export interface ISearchInputProps extends InputProps {
  onSearch?: (search: string) => void;
}

export const SearchInput: FC<ISearchInputProps> = ({ onSearch, ...otherProp }) => {
  const { run: handleChange } = useDebounceFn(
    (value) => {
      onSearch?.(value);
    },
    {
      wait: 300,
    }
  );

  return (
    <Input
      {...otherProp}
      prefix={<SearchOutlined />}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
};
