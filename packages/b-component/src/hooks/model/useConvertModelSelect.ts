import { useGlobalCtx } from "@evo/data-store";
import { IAvailableModel, IModelSchema } from "@evo/types"
import { useMemoizedFn } from "ahooks"
import { useRef } from "react";


/**
 * 模型选择 Hook，用于处理模型选择的相关逻辑
 * @param availableModels 可用的模型列表
 */
export const useConvertModelSelect = () => {
  const [availableModels] = useGlobalCtx((s) => s.modelProcessor.availableModels);

  // 存储已选择模型的映射关系
  const selectModelsMapRef = useRef<Record<string, {
    providerName: string;
    providerId: string;
    model: IModelSchema;
  }>>({});

  const getSelectChangeModels = useMemoizedFn((values: string[] | string) => {
    const selectedModels: IAvailableModel[] = [];
    selectModelsMapRef.current = {};
    const valuesArray = Array.isArray(values) ? values : [values];
    valuesArray.forEach((value) => {
      const [providerId, modelId] = value.split('=');
      const provider = availableModels?.find((p) => p.id === providerId);
      const model = provider?.models.find((m) => m.id === modelId);

      if (model && provider) {
        const currSelect = selectedModels.find((f) => f.id === providerId);
        if (currSelect) {
          currSelect.models.push(model);
        } else {
          selectedModels.push({
            ...provider,
            models: [model],
          });
        }
        selectModelsMapRef.current[value] = {
          providerName: provider.name,
          providerId: provider.id,
          model: model
        };
      }
    });

    return selectedModels;
  })

  const getSelectValue = useMemoizedFn((models: IAvailableModel[]) => {
    selectModelsMapRef.current = {};
    const currSelectValues: string[] = [];
    for (const model of models || []) {
      model.models.forEach((m) => {
        const key = `${model.id}=${m.id}`;
        selectModelsMapRef.current[key] = {
          providerName: model.name,
          providerId: model.id,
          model: m
        };
        currSelectValues.push(key);
      });
    }
    return currSelectValues;
  })

  return {
    selectModelsMapRef,
    getSelectChangeModels,
    getSelectValue
  }
}