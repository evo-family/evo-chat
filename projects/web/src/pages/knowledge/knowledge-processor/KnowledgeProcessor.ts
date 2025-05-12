import { arrayToMap, BaseProcessor, DataCell } from '@evo/utils';
import { DialogProcessor, modelProcessor, ModelProcessor } from '@evo/data-store';
import { KnowledgeBridgeFactory } from '@evo/platform-bridge';
import { BaseResult, IKnowledgeMeta, IKnowledgeService, IKnowledgeVectorMetaVo } from '@evo/types';
import { ExtractChunkData } from '@llm-tools/embedjs-interfaces';

export class KnowledgeProcessor extends BaseProcessor {
  addOrUploadDialog: DialogProcessor;

  private modelProcessor: ModelProcessor;

  knowledgeService: IKnowledgeService;

  knowledgeListResult: DataCell<BaseResult<IKnowledgeMeta[]>>;

  vectorsByKnowledgeIdResult: DataCell<BaseResult<IKnowledgeVectorMetaVo[]>>;

  searchVectorsResult: DataCell<BaseResult<ExtractChunkData[]>>;

  selectKnowledge: DataCell<IKnowledgeMeta | null>;

  private bindServiceMethod<T, P extends any[]>(
    dataCell: DataCell<BaseResult<T>> | null,
    method: (this: IKnowledgeService, ...args: P) => Promise<BaseResult<T>>,
    callback?: (result: BaseResult<T>) => void
  ) {
    return async (...args: P) => {
      const res = await method.apply(this.knowledgeService, args);
      dataCell?.set(res);
      callback?.(res);
      return res;
    };
  }

  constructor() {
    super();
    this.modelProcessor = modelProcessor;
    this.addOrUploadDialog = DialogProcessor.create().processor;
    this.knowledgeService = KnowledgeBridgeFactory.getKnowledge();
    this.knowledgeListResult = new DataCell({} as any);
    this.vectorsByKnowledgeIdResult = new DataCell({} as any);
    this.selectKnowledge = new DataCell(null as any);
    this.searchVectorsResult = new DataCell({} as any);
    // this.getKnowledgeList();
    this.listen();
  }

  listen() {
    this.modelProcessor?.availableModels?.listen(
      ({ next }) => {
        const map = arrayToMap(next!, 'id');
        this.knowledgeService.setModelEmbeddingMap(map);
      },
      {
        debounceTime: 10,
        immediate: true,
      }
    );
  }

  setSelectKnowledge = (knowledge: IKnowledgeMeta) => {
    this.selectKnowledge.set(knowledge);
    // this.getVectorsByKnowledgeId(knowledge.id);
  };

  createKnowledge = async (meta: IKnowledgeMeta) => {
    const res = await this.knowledgeService.create(meta);
    if (res.success) {
      this.getKnowledgeList();
    }
    return res;
  };

  updateKnowledge = async (meta: IKnowledgeMeta) => {
    const res = await this.knowledgeService.update(meta);
    if (res.success) {
      this.getKnowledgeList();
    }
    return res;
  };

  /**
   * 添加文件到向量
   */
  get addFileToVector() {
    return this.bindServiceMethod(null, this.knowledgeService.addFileToVector, () => {
      this.getVectorsByKnowledgeId(this.selectKnowledge.get()!.id);
    });
  }

  get addFolderToVector() {
    return this.bindServiceMethod(null, this.knowledgeService.addFolderToVector, () => {
      this.getVectorsByKnowledgeId(this.selectKnowledge.get()!.id);
    });
  }

  /**
   * 获取知识库列表
   */
  get getKnowledgeList() {
    return this.bindServiceMethod(
      this.knowledgeListResult,
      this.knowledgeService.getList,
      (res) => {
        if (this.selectKnowledge.get() === null && res.data!?.length > 0) {
          this.selectKnowledge.set(res.data![0]);
        }
      }
    );
  }

  /**
   * 根据知识库id获取向量列表
   */
  get getVectorsByKnowledgeId() {
    return this.bindServiceMethod(
      this.vectorsByKnowledgeIdResult,
      this.knowledgeService.getVectorsByKnowledgeId
    );
  }

  get searchVectors() {
    return this.bindServiceMethod(this.searchVectorsResult, this.knowledgeService.searchVectors);
  }

  resetSearchVectorsResult = () => {
    this.searchVectorsResult.set({} as any);
  };

  deleteKnowledge = async (id: string) => {
    const res = await this.knowledgeService.delete(id);
    if (res.success) {
      const list = await this.getKnowledgeList();
      this.setSelectKnowledge(list?.data?.[0]!);
    }
    return res;
  };
}
