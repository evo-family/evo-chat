import {
  BaseResult,
  IFileMeta,
  IFileService,
  IGetFileListParams,
  IUploadBufferParams,
  TUploadDirectoryResult,
  TUploadResult,
} from '@evo/types';

import { BaseBridge } from '../common/baseBridge';
import { fileProcessor } from './FileProcessor';

// Web 环境上传服务
export class WebUpload extends BaseBridge implements IFileService {
  async getFileContent(fileId: string): Promise<BaseResult<string>> {
    return await fileProcessor.getFileContent(fileId);
  }
  async getFileBuffer(fileId: string): Promise<BaseResult<ArrayBuffer>> {
    return await fileProcessor.getFileBuffer(fileId);
  }
  async uploadBufferFile(params: IUploadBufferParams): Promise<BaseResult<IFileMeta>> {
    return await fileProcessor.uploadBufferFile(params);
  }
  async getFileList(params: IGetFileListParams): Promise<TUploadDirectoryResult> {
    return await fileProcessor.getFileList(params);
  }
  async uploadFile(): Promise<TUploadResult> {
    console.log('Web 环境不支持文件上传');
    return {
      success: false,
      error: '当前环境不支持文件上传',
    };
  }

  async uploadDirectory(): Promise<TUploadDirectoryResult> {
    console.log('Web 环境不支持文件夹上传');
    return {
      success: false,
      error: '当前环境不支持文件夹上传',
    };
  }
}
