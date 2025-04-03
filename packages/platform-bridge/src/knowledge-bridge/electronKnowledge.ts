import { BaseResult, IAddFileMetaToVectorParams, IAddFilesMetaToVectorParams, IAddFileToVectorParams, IAddFolderToVectorParams, IKnowledgeMeta, IKnowledgeService, IKnowledgeVectorMeta, IKnowledgeVectorMetaVo, ISearchVectorsByKnowledge, TAvailableModelMap } from "@evo/types";
import { ExtractChunkData } from "@llm-tools/embedjs-interfaces";
import { BaseBridge } from "../common/baseBridge";

export class ElectronKnowledge extends BaseBridge implements IKnowledgeService {
  addFolderToVector(params: IAddFolderToVectorParams): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
    return window.__ELECTRON__.knowledgeService.addFolderToVector(params);
  }
  addFileMetaToVector(params: IAddFileMetaToVectorParams): Promise<BaseResult<IKnowledgeVectorMeta>> {
    return window.__ELECTRON__.knowledgeService.addFileMetaToVector(params);
  }
  addFilesMetaToVector(params: IAddFilesMetaToVectorParams): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
    return window.__ELECTRON__.knowledgeService.addFilesMetaToVector(params);
  }
  async searchVectors(params: ISearchVectorsByKnowledge): Promise<BaseResult<ExtractChunkData[]>> {
    try {
      return await window.__ELECTRON__.knowledgeService.searchVectors(params);
    } catch (error) {
      return this.handleError(error);
    }
  }
  async getVectorsByKnowledgeId(knowledgeId: string): Promise<BaseResult<IKnowledgeVectorMetaVo[]>> {
    try {
      return await window.__ELECTRON__.knowledgeService.getVectorsByKnowledgeId(knowledgeId);
    } catch (error) {
      return this.handleError(error);
    }
  }
  setModelEmbeddingMap(modelEmbeddingMap: TAvailableModelMap): void {
    window.__ELECTRON__.knowledgeService.setModelEmbeddingMap(modelEmbeddingMap);
  }
  async addFileToVector(params: IAddFileToVectorParams): Promise<BaseResult<IKnowledgeVectorMeta>> {
    try {
      return await window.__ELECTRON__.knowledgeService.addFileToVector(params);
    } catch (error) {
      return this.handleError(error);
    }
  }
  async getList(): Promise<BaseResult<IKnowledgeMeta[]>> {
    try {
      return await window.__ELECTRON__.knowledgeService.getList();
    } catch (error) {
      return this.handleError(error);
    }
  }
  async update(meta: IKnowledgeMeta): Promise<BaseResult<IKnowledgeMeta>> {
    try {
      return await window.__ELECTRON__.knowledgeService.update(meta);
    } catch (error) {
      return this.handleError(error);
    }
  }
  async create(meta: IKnowledgeMeta): Promise<BaseResult<IKnowledgeMeta>> {
    try {
      return await window.__ELECTRON__.knowledgeService.create(meta);
    } catch (error) {
      return this.handleError(error);
    }
  }

}
