import { EModelType, IAvailableModel, IModel, IModelSchema, TModelType } from "@evo/types"


/**
 * 获取所有可用的 models
 * @param models
 * @returns
 */
export const getAvailableModels = (models: IModel[] = []) => {
  const result: IAvailableModel[] = [];
  for (const model of models) {
    const { enable, groups, ...other } = model;
    if (model.enable) {
      const allMOdels = groups.reduce((acc: IModelSchema[], group) => {
        return [
          ...acc,
          ...(group.models || [])
        ];
      }, [])
      result.push({
        ...other,
        models: allMOdels,
      })
    }
  }

  return result;
}


/**
 * 从可用的模型中获取指定类型的模型
 * @param availableModels
 * @param modeTypes
 */
export const getAvailableModelsByModelType = (availableModels: IAvailableModel[], modelTypes: TModelType[]) => {
  return availableModels?.map(model => ({
    ...model,
    models: model.models?.filter(modelSchema =>
      modelSchema.type?.some(type => modelTypes.includes(type))
    )
  })).filter(model => model.models?.length > 0);
};
