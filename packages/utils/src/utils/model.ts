import { IModel, IModelConfig, IModelGroup, IModelResponseItem, IModelSchema, TAvailableModelMap } from "@evo/types";
import { getModelTypesById } from "./modelType";

/**
 * 获取模型配置信息
 * @param params
 * @returns
 */
export const getModelConfig = (params: {
  modelMap: TAvailableModelMap,
  providerId: string,
  modelId: string
}) => {
  const { modelMap, providerId, modelId } = params;

  const provider = modelMap?.[providerId];
  if (!provider) {
    return null;
  }
  const result: IModelConfig = {
    modelId,
    ...provider?.apiInfo
  }
  return result
}


/**
 * 将模型列表按提供商或路径分组
 */
export const groupModelsByProvider = (models: IModelResponseItem[]): IModelGroup[] => {
  const groupedMap = new Map<string, IModelGroup>();

  models.forEach(model => {
    // 确定分组名
    let groupName = model.owned_by || '';
    if (!groupName && model.id.includes('/')) {
      // 如果没有 owned_by，使用 id 中的第一段作为分组
      groupName = model.id.split('/')[0];
    }

    // 如果还是没有分组名，使用 'others' 作为默认分组
    groupName = groupName || 'others';

    // 获取或创建分组
    if (!groupedMap.has(groupName)) {
      groupedMap.set(groupName, {
        groupName,
        models: []
      });
    }

    // 添加模型到分组
    const group = groupedMap.get(groupName)!;
    group.models.push({
      id: model.id,
      name: model.id, // 使用最后一段作为名称
      type: getModelTypesById(model.id),
    });
  });

  return Array.from(groupedMap.values());
};
