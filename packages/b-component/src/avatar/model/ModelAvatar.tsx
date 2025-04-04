import { BaseAvatar, IBaseAvatarProps } from '../base/BaseAvatar';
import React, { useMemo } from 'react';

import { getModelLogo } from '@evo/data-store';
import style from './ModelAvatar.module.scss';

export interface IModelAvatarProps extends Omit<IBaseAvatarProps, 'content'> {
  modelName?: string;
}

export const ModelAvatar = React.memo<IModelAvatarProps>((props) => {
  const { width, height, modelName } = props;

  const modelImage = useMemo(() => getModelLogo(modelName), [modelName]);

  if (!modelName) return;

  return (
    <BaseAvatar
      clasName={style['model-avatar']}
      width={width}
      height={height}
      content={<img src={modelImage} />}
    />
  );
});
