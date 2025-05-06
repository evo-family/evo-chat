import { getModelLogo, useGlobalCtx } from '@evo/data-store';
import { Avatar, Space } from 'antd';
import { useMemo } from 'react';
import { ModelType } from '../../models';

export interface IUseModelOptionsParams {
  // 是否显示供应商名称
  showProvider?: boolean;
}

export const useModelOptionsData = (options?: IUseModelOptionsParams) => {
  const { showProvider = false } = options || {};
  const [availableModels] = useGlobalCtx((s) => s.modelProcessor.availableModels);
  // 找出所有可用模型

  const modelOptions = useMemo(() => {
    // const filterModels = getAvailableModelsByModelType(availableModels!, [EModelType.reasoning, EModelType.video, EModelType.video, EModelType.audio])
    return availableModels?.map((item) => {
      return {
        label: item.name,
        title: item.name,
        options: item.models.map((model) => {
          return {
            label: (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar size={'small'} src={getModelLogo(model.id)} />
                <span style={{ margin: '0 3px' }}>
                  {' '}
                  {model.name} {showProvider ? ` (${item.name})` : ''}{' '}
                </span>
                <ModelType types={model.type} />
              </div>
            ),
            value: `${item.id}=${model.id}`,
          };
        }),
      };
    });
  }, [availableModels]);

  return modelOptions;
};
