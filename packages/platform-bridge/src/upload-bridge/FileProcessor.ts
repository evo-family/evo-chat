import {
  BaseIDBStore,
  BaseProcessor,
  ResultUtil,
  createBaseMeta,
  getFileListByType,
} from '@evo/utils';
import {
  BaseResult,
  IFileMeta,
  IFileService,
  IGetFileListParams,
  IUploadBufferParams,
} from '@evo/types';

import { IMG_EXTS } from '@evo/utils';

const FILE_IDB_KEY = '_file_idb_';
const FILE_INFO_IDB_KEY = '_file_info_idb_';

const idbStore = new BaseIDBStore(FILE_IDB_KEY);
const idbFileMetaStore = new BaseIDBStore(FILE_INFO_IDB_KEY);

export class FileProcessor
  extends BaseProcessor
  implements Omit<IFileService, 'uploadDirectory' | 'uploadFile'>
{
  constructor() {
    super();
  }
  async getFileContent(fileId: string): Promise<BaseResult<string>> {
    try {
      // 获取文件信息
      // const fileInfo = await this.dbManager()?.findById<IFileMeta>('files', fileId);
      const fileInfo = await idbFileMetaStore.get(fileId);
      if (!fileInfo) {
        return ResultUtil.error('文件不存在');
      }

      // 从 IndexedDB 获取文件内容
      const buffer = await idbStore.get(fileId);
      if (!buffer) {
        return ResultUtil.error('文件内容不存在');
      }

      const ext = fileInfo.type.toLowerCase();

      // 处理图片文件
      if (IMG_EXTS.includes(ext)) {
        // 分块处理大文件，避免堆栈溢出
        const chunkSize = 1024 * 1; // 1MB chunks
        let binary = '';
        const bytes = new Uint8Array(buffer);

        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.slice(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, chunk);
        }

        const base64 = `data:image/${ext.slice(1)};base64,${btoa(binary)}`;
        return ResultUtil.success(base64);
      }

      // 其他文件直接转换为文本
      const decoder = new TextDecoder('utf-8');
      const content = decoder.decode(buffer);
      return ResultUtil.success(content);
    } catch (error) {
      console.error('获取文件内容错误:', error);
      return ResultUtil.error(error);
    }
  }
  async getFileBuffer(fileId: string): Promise<BaseResult<ArrayBuffer>> {
    try {
      const result = await idbStore.get(fileId);
      return ResultUtil.success(result);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }
  getFile(fileId: string): Promise<ArrayBuffer> {
    throw new Error('Method not implemented.');
  }

  // private dbManager() {
  //   return pgliteProcessor.dbManager;
  // }

  async getFileList(params: IGetFileListParams): Promise<BaseResult<IFileMeta[]>> {
    try {
      // const result = await this.dbManager?.()?.find<IFileMeta>('files');
      const { type, search } = params;
      const files = await idbFileMetaStore.getAll();
      const filteredFiles = getFileListByType(files, {
        type,
        search,
      });
      return ResultUtil.success(filteredFiles);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }
  async uploadBufferFile(params: IUploadBufferParams): Promise<BaseResult<IFileMeta>> {
    try {
      const { fileMeta, fileBuffer } = params;
      // 创建文件元数据
      const fileInfo = createBaseMeta<IFileMeta>({
        ...fileMeta,
      } as IFileMeta);
      const targetPath = `buffer://${fileMeta.id}`;
      fileInfo.path = targetPath;
      // 保存文件到indexdb
      await idbStore.set(fileInfo.id, fileBuffer);
      // await this.dbManager()?.insert('files', fileInfo);
      await idbFileMetaStore.set(fileInfo.id, fileInfo);

      return ResultUtil.success(fileInfo);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }
}

export const fileProcessor = FileProcessor.create().processor;
