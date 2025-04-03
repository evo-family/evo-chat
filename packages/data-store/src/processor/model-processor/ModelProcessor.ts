import {
  BaseProcessor,
  DataCell,
  OpenAiClient,
  persistenceCell,
  persistenceCellSync,
} from '@evo/utils';
import { IAvailableModel, IModel, IModelParams, IModelSchema } from '@evo/types';
import { defaultModelParams, defaultModels, generateDefaultModel } from '../../config-data';

import { DialogProcessor } from '../common';
import { deepMergeObject } from '../../utils/mergeObject';
import { MODEL_LIST_KEY, MODEL_PARAMS } from '../constants';
import { getAvailableModels } from '../../utils/convertModel';

export class ModelProcessor extends BaseProcessor {

  isReady: DataCell<boolean>;
  models: DataCell<IModel[]> = new DataCell<IModel[]>([]);

  // 选中的模型
  selectModel: DataCell<IModel> | null = null;
  /**
   * 可用的模型列表
   */
  availableModels: DataCell<IAvailableModel[]> | null = null;

  // 模型提供商对话框
  modelProviderDialog: DialogProcessor;

  modelDialog: DialogProcessor;

  /**
   * 模型参数
   */
  modelParams: DataCell<IModelParams>;

  constructor() {
    super();
    const modelParams = persistenceCellSync<IModelParams>(MODEL_PARAMS, defaultModelParams);
    this.isReady = new DataCell(false);
    this.modelParams = modelParams;
    this.modelProviderDialog = DialogProcessor.create().processor;
    this.modelDialog = DialogProcessor.create().processor;
    this.init();
  }

  /**
   * 合并模型
   * @param models
   * @returns
   */
  private mergeModels = async (models: DataCell<IModel[]>) => {
    const existingModels = models.get() || [];
    const resultModels: IModel[] = existingModels;
    // 1. 处理默认模型
    defaultModels.forEach(defaultModel => {
      const existingModel = existingModels.find(m => m.id === defaultModel.id);
      if (!existingModel) {
        // 添加新的默认模型
        resultModels.push(defaultModel);
      }
    });
    return resultModels;
  }

  private init = async () => {
    const models = await persistenceCell<IModel[]>(MODEL_LIST_KEY, defaultModels);
    const mergeModels = await this.mergeModels(models);
    models.set(mergeModels);
    this.selectModel = new DataCell(mergeModels?.[0]!);
    this.models = models;
    // this.models = new DataCell(defaultModels);
    this.availableModels = new DataCell(getAvailableModels(mergeModels));
    this.isReady.set(true)
    await this.listener();
  };


  private listener = async () => {
    this.models?.listen(({ next }) => {
      if (next) {
        this.availableModels?.set(getAvailableModels(next!));
      }
    }, {
      debounceTime: 10,
    });
  }

  setModels = (models: IModel[]) => {
    this.models?.set(models);
  };

  /**
   * 添加模型供应商
   * @param model
   */
  addModelProvider = (model: Partial<IModel>) => {
    const data = generateDefaultModel(model);
    this.models.set([data, ...this.models?.get()!]);
  };

  private updateSelectModel = () => {
    const currModel = this.getCurrSelectModel();
    this.selectModel?.set(currModel!);
  }

  /**
   * 添加单个模型
   * @param params
   */
  addSingleModel = (params: { groupName: string; modelSchema: IModelSchema }) => {
    const { groupName, modelSchema } = params;
    const currentModel = this.getCurrSelectModel();

    // 复制当前模型
    const newModel = { ...currentModel };

    // 查找是否存在该分组
    const existingGroup = newModel.groups?.find((group) => group.groupName === groupName);

    if (existingGroup) {
      // 如果分组存在，添加新的模型
      existingGroup.models = [...(existingGroup.models || []), modelSchema];
    } else {
      // 如果分组不存在，创建新分组并添加模型
      newModel.groups = [
        ...(newModel.groups || []),
        {
          groupName,
          models: [modelSchema],
        },
      ];
    }
    // 更新模型
    this.changeModel(newModel);
    this.updateSelectModel();
  };

  /**
 * 更新单个模型
 * @param params
 */
  updateSingleModel = (params: { groupName: string; modelSchema: IModelSchema; oldGroupName?: string }) => {
    const { groupName, modelSchema, oldGroupName } = params;
    const currentModel = this.getCurrSelectModel();
    const newModel = { ...currentModel };

    // 如果分组名没有变化，直接更新模型
    if (!oldGroupName || oldGroupName === groupName) {
      newModel.groups = newModel.groups?.map(group => {
        if (group.groupName === groupName) {
          return {
            ...group,
            models: group.models?.map(model =>
              model.id === modelSchema.id ? modelSchema : model
            )
          };
        }
        return group;
      });
    } else {
      // 分组名变化了
      const oldGroup = newModel.groups?.find(g => g.groupName === oldGroupName);

      // 如果旧分组只有一个模型，直接重命名分组
      if (oldGroup?.models?.length === 1) {
        newModel.groups = newModel.groups?.map(group => {
          if (group.groupName === oldGroupName) {
            return {
              ...group,
              groupName,
              models: [modelSchema]
            };
          }
          return group;
        });
      } else {
        // 旧分组有多个模型，需要移动模型到新分组
        // 1. 从旧分组移除模型
        newModel.groups = newModel.groups?.map(group => {
          if (group.groupName === oldGroupName) {
            return {
              ...group,
              models: group.models?.filter(model => model.id !== modelSchema.id)
            };
          }
          return group;
        });

        // 2. 查找新分组
        const targetGroup = newModel.groups?.find(g => g.groupName === groupName);
        if (targetGroup) {
          // 新分组存在，添加模型
          newModel.groups = newModel.groups?.map(group => {
            if (group.groupName === groupName) {
              return {
                ...group,
                models: [...(group.models || []), modelSchema]
              };
            }
            return group;
          });
        } else {
          // 新分组不存在，创建新分组
          newModel.groups = [
            ...(newModel.groups || []),
            {
              groupName,
              models: [modelSchema]
            }
          ];
        }
      }
    }

    this.changeModel(newModel);
    this.updateSelectModel();
  };

  /**
   * 移除单个模型
   * @param groupName 模型组名
   * @param modelId 模型ID
   */
  removeModel = (groupName: string, modelId: string) => {
    const currentModel = this.getCurrSelectModel();
    const newModel = { ...currentModel };

    // 过滤掉空组和删除指定模型
    newModel.groups = newModel.groups
      ?.map(group => {
        if (group.groupName === groupName) {
          return {
            ...group,
            models: group.models?.filter(model => model.id !== modelId)
          };
        }
        return group;
      })
      .filter(group => group.models && group.models.length > 0);

    // 更新模型
    this.changeModel(newModel);
  };

  /**
   * 设置当前选中的模型
   * @param model
   */
  setSelectModel = (model: IModel) => {
    this.selectModel?.set(model);
  };

  /**
   * 根据模型变更模型组里的信息
   * @param model
   */
  changeModelsByModel = (model: IModel) => {
    const resultModels = this.models.get()?.map((item) => {
      if (item.id === model.id) {
        // this.selectModel.set(item);
        return model;
      }
      return item;
    })
    this.models?.set(resultModels);
  };

  private getCurrSelectModel = () => {
    const currentModel = this.models?.get()?.find(f => f.id == this.selectModel?.get().id)
    return currentModel;
  }

  /**
   * 变更模型信息
   * @param model
   */
  public changeModel = (model: Partial<IModel>) => {
    const currentModel = this.getCurrSelectModel();
    if (currentModel) {
      const mergedModel = deepMergeObject(currentModel, model);
      this.selectModel?.set(mergedModel);
      this.changeModelsByModel(mergedModel);
    }
  };

  /**
   * 测试模型是否可以链接成功
   */
  public testModelConnect = async (params: { model: IModelSchema; apiKey: string; apiUrl: string }) => {
    const { apiKey, apiUrl, model } = params;
    const client = new OpenAiClient({
      apiKey: apiKey,
      baseURL: apiUrl,
      defaultModel: model.id,
    });
    const isConnected = await client.testConnection();
    return isConnected;
  };

  /**
   * 修改模型参数
   * @param params
   */
  public updateModelParams = (params: Partial<IModelParams>) => {
    const currentParams = this.modelParams.get();
    this.modelParams.set({
      ...currentParams,
      ...params,
    });
  };
}

export const modelProcessor = ModelProcessor.create().processor;
// window.pp = modelProcessor;