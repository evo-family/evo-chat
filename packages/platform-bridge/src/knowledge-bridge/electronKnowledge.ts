import {
  BaseResult,
  IAddFileMetaToVectorParams,
  IAddFilesMetaToVectorParams,
  IAddFileToVectorParams,
  IAddFolderToVectorParams,
  IKnowledgeMeta,
  IKnowledgeService,
  IKnowledgeVectorMeta,
  IKnowledgeVectorMetaVo,
  ISearchVectorsByKnowledge,
  TAvailableModelMap,
} from '@evo/types';
import { ExtractChunkData } from '@llm-tools/embedjs-interfaces';
import { BaseBridge } from '../common/baseBridge';
import { IPC_EVENTS } from '@evo/utils';

export class ElectronKnowledge extends BaseBridge implements IKnowledgeService {
  delete(id: string): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.KNOWLEDGE.DELETE, id);
  }
  getVectorsByFileId(fileId: string): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
    return window.__ELECTRON__.knowledgeService.getVectorsByFileId(fileId);
  }
  deleteVectorByFileId(fileId: string): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.knowledgeService.deleteVectorByFileId(fileId);
  }
  addFolderToVector(params: IAddFolderToVectorParams): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
    return window.__ELECTRON__.knowledgeService.addFolderToVector(params);
  }
  addFileMetaToVector(
    params: IAddFileMetaToVectorParams
  ): Promise<BaseResult<IKnowledgeVectorMeta>> {
    return window.__ELECTRON__.knowledgeService.addFileMetaToVector(params);
  }
  addFilesMetaToVector(
    params: IAddFilesMetaToVectorParams
  ): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
    return window.__ELECTRON__.knowledgeService.addFilesMetaToVector(params);
  }
  async searchVectors(params: ISearchVectorsByKnowledge): Promise<BaseResult<ExtractChunkData[]>> {
    try {
      return await window.__ELECTRON__.knowledgeService.searchVectors(params);
    } catch (error) {
      return this.handleError(error);
    }
  }
  async getVectorsByKnowledgeId(
    knowledgeId: string
  ): Promise<BaseResult<IKnowledgeVectorMetaVo[]>> {
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
