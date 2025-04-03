import { EModelType } from '@evo/types';
import { Tag } from 'antd';
import React, { FC, useMemo } from 'react';
import { MODEL_TYPE_CONFIG } from '@evo/data-store';

export interface IModelTypeProps {
  types?: EModelType[];
}


export const ModelType: FC<IModelTypeProps> = ({ types = [] }) => {
  return (
    <div>
      {types.map((type) => (
        <Tag
          key={type}
          color={MODEL_TYPE_CONFIG[type]?.color}
          style={{ marginRight: 4 }}

        >
          {MODEL_TYPE_CONFIG[type]?.label}
        </Tag>
      ))}
    </div>
  );
};