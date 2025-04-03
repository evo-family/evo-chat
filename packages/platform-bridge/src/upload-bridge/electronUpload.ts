import { BaseResult, IFileMeta, IFileService, IGetFileListParams, IUploadBufferParams, TUploadDirectoryResult, TUploadResult } from "@evo/types";
import { BaseBridge } from "../common/baseBridge";

// Electron 环境上传服务
export class ElectronUpload extends BaseBridge implements IFileService {
  async getFileContent(fileId: string): Promise<BaseResult<string>> {
    return await window.__ELECTRON__.fileService.getFileContent(fileId);
  }

  async getFileBuffer(fileId: string): Promise<BaseResult<ArrayBuffer>> {
    return await window.__ELECTRON__.fileService.getFileBuffer(fileId);
  }
  async uploadBufferFile(params: IUploadBufferParams): Promise<BaseResult<IFileMeta>> {
    try {
      return await window.__ELECTRON__.fileService.uploadBufferFile(params);
    } catch (error) {
      return this.handleError(error);
    }
  }
  async getFileList(params: IGetFileListParams): Promise<BaseResult<IFileMeta[]>> {
    try {
      return await window.__ELECTRON__.fileService.getFileList(params);
    } catch (error) {
      return this.handleError(error);
    }
  }
  async uploadFile(): Promise<TUploadResult> {
    try {
      return await window.__ELECTRON__.fileService.uploadFile();
    } catch (error) {
      return this.handleError(error);
    }
  }

  async uploadDirectory(): Promise<TUploadDirectoryResult> {
    try {
      return await window.__ELECTRON__.fileService.uploadDirectory();
    } catch (error) {
      return this.handleError(error);
    }
  }


}
