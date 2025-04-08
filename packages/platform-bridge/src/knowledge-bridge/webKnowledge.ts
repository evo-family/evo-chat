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

export class WebKnowledge extends BaseBridge implements IKnowledgeService {
  getVectorsByFileId(fileId: string): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
    throw new Error('Method not implemented.');
  }
  deleteVectorByFileId(fileId: string): Promise<BaseResult<boolean>> {
    throw new Error('Method not implemented.');
  }
  addFolderToVector(params: IAddFolderToVectorParams): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
    throw new Error('Method not implemented.');
  }
  addFileMetaToVector(
    params: IAddFileMetaToVectorParams
  ): Promise<BaseResult<IKnowledgeVectorMeta>> {
    throw new Error('Method not implemented.');
  }
  addFilesMetaToVector(
    parasm: IAddFilesMetaToVectorParams
  ): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
    throw new Error('Method not implemented.');
  }
  searchVectors(params: ISearchVectorsByKnowledge): Promise<BaseResult<ExtractChunkData[]>> {
    throw new Error('Method not implemented.');
  }
  getVectorsByKnowledgeId(knowledgeId: string): Promise<BaseResult<IKnowledgeVectorMetaVo[]>> {
    throw new Error('Method not implemented.');
  }
  setModelEmbeddingMap(modelEmbeddingMap: TAvailableModelMap): void {
    throw new Error('Method not implemented.');
  }
  addFileToVector(params: IAddFileToVectorParams): Promise<BaseResult<IKnowledgeVectorMeta>> {
    throw new Error('Method not implemented.');
  }
  getList(): Promise<BaseResult<IKnowledgeMeta[]>> {
    throw new Error('Method not implemented.');
  }
  update(meta: IKnowledgeMeta): Promise<BaseResult<IKnowledgeMeta>> {
    throw new Error('Method not implemented.');
  }
  create(meta: IKnowledgeMeta): Promise<BaseResult<IKnowledgeMeta>> {
    throw new Error('Method not implemented.');
  }
}
