import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { FileUtils } from '../utils/fileUtils';
import { BaseResult, EResourceType, IFileMeta, IFileService, IGetFileListParams, IUploadBufferParams, TUploadDirectoryResult, TUploadResult } from '@evo/types';
import { PGLiteManager } from '@evo/pglite-manager';
import { createBaseMeta, getFileListByType, ResultUtil } from '@evo/utils';
import { IMG_EXTS, DOCUMENT_EXTS } from '@evo/utils';
import officeParser from 'officeparser'
export class FileManager implements Omit<IFileService, 'uploadDirectory' | 'uploadFile'> {
  private files: IFileMeta[] = [];
  private filesDir: string;
  private dbManager: PGLiteManager;

  constructor(uploadDir: string, dbManager: PGLiteManager) {
    this.filesDir = uploadDir; // path.join(uploadDir, 'files');
    // 确保文件目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    if (!fs.existsSync(this.filesDir)) {
      fs.mkdirSync(this.filesDir);
    }

    this.dbManager = dbManager;

    this.initialize();
  }
  async getFileContent(fileId: string): Promise<BaseResult<string>> {
    try {
      const file = await this.getFile(fileId);
      if (!file) {
        return ResultUtil.error('文件不存在');
      }

      const ext = path.extname(file.path).toLowerCase();

      // 处理文档文件
      if (DOCUMENT_EXTS.includes(ext)) {
        const content = await officeParser.parseOfficeAsync(file.path);
        return ResultUtil.success(content);
      }

      // 处理图片文件
      if (IMG_EXTS.includes(ext)) {
        const buffer = await fs.promises.readFile(file.path);
        const base64 = `data:image/${ext.slice(1)};base64,${buffer.toString('base64')}`;
        return ResultUtil.success(base64);
      }

      // 其他文件直接读取为文本
      const content = await fs.promises.readFile(file.path, 'utf-8');
      return ResultUtil.success(content);

    } catch (error) {
      console.error('获取文件内容错误:', error);
      return ResultUtil.error(error);
    }
  }
  async getFileBuffer(fileId: string): Promise<BaseResult<ArrayBuffer>> {
    try {
      // 获取文件信息
      const file = await this.getFile(fileId);
      if (!file) {
        return ResultUtil.error('文件不存在');
      }
      // 读取文件内容
      const buffer = await fs.promises.readFile(file.path);
      // 转换为 ArrayBuffer
      const result = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      ) as ArrayBuffer;
      return ResultUtil.success(result);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }


  /**
   * 初始化数据库和加载文件
   */
  private async initialize(): Promise<void> {
    await this.loadFiles();
  }

  /**
   * 从数据库加载文件列表
   */
  private async loadFiles(): Promise<void> {
    this.files = await this.dbManager.find<IFileMeta>('files');
  }

  /**
   * 上传单个文件
   * @param filePath 文件路径
   * @param fileName 可选的文件名
   * @returns 上传结果
   */
  public async uploadFile(filePath: string, fileName?: string): Promise<TUploadResult> {
    try {
      const stats = fs.statSync(filePath);
      const fileId = uuidv4();
      const fileType = path.extname(filePath).toLowerCase();
      const targetPath = path.join(this.filesDir, fileId + fileType);

      // 复制文件到存储目录
      await fs.promises.copyFile(filePath, targetPath);

      const file = createBaseMeta({
        id: fileId,
        name: fileName || path.basename(filePath),
        path: targetPath,
        size: stats.size,
        type: fileType,
      })

      // 保存到数据库
      const savedFile = await this.dbManager.insert<IFileMeta>('files', file);
      this.files.push(savedFile);

      return {
        success: true,
        data: savedFile
      };
    } catch (error) {
      console.error('文件处理错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }


  async uploadBufferFile(params: IUploadBufferParams): Promise<BaseResult<IFileMeta>> {
    try {
      const { fileBuffer, fileMeta } = params;
      const fileId = uuidv4();
      const targetPath = path.join(this.filesDir, fileId + fileMeta.type);
      // 确保fileBuffer是正确的类型
      const buffer = fileBuffer instanceof ArrayBuffer ? Buffer.from(fileBuffer) : fileBuffer;
      // 写入文件
      await fs.promises.writeFile(targetPath, buffer);
      // 创建文件元数据
      const file = createBaseMeta({
        id: fileId,
        name: fileMeta.name,
        path: targetPath,
        size: buffer.length,
        type: fileMeta.type,
      })

      const savedFile = await this.dbManager.insert<IFileMeta>('files', file);
      this.files.push(savedFile);
      return ResultUtil.success(savedFile);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  /**
   * 并发上传多个文件
   * @param filePaths 文件路径数组
   * @param limit 并发限制
   * @returns 上传结果数组
   */
  private async uploadFilesWithLimit(filePaths: string[], limit: number = 5) {
    const results = [];
    for (let i = 0; i < filePaths.length; i += limit) {
      const batch = filePaths.slice(i, i + limit);
      const batchPromises = batch.map(filePath =>
        this.uploadFile(filePath, path.basename(filePath))
      );
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    return results;
  }

  /**
   * 上传文件夹
   * @param dirPath 文件夹路径
   * @returns 上传结果
   */
  public async uploadDirectory(dirPath: string): Promise<TUploadDirectoryResult> {
    try {
      const filePaths = FileUtils.getFilesInDirectory(dirPath);
      const uploadResults = await this.uploadFilesWithLimit(filePaths, 5);

      const results = uploadResults
        .filter(result => result.success && result.data)
        .map(result => result.data!);

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      console.error('目录处理错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 获取所有文件
   * @returns 文件元数据数组
   */
  async getFileList(params: IGetFileListParams): Promise<BaseResult<IFileMeta[]>> {
    try {
      const { type, search } = params;
      const filteredFiles = getFileListByType(this.files, {
        type,
        search,
      });
      return ResultUtil.success(filteredFiles);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  /**
   * 根据ID获取文件
   * @param id 文件ID
   * @returns 文件元数据
   */
  public async getFile(id: string): Promise<IFileMeta> {
    const file = await this.dbManager.findById<IFileMeta>('files', id);
    if (!file) {
      throw new Error('文件不存在');
    }
    return file;
  }

  /**
   * 获取所有文件的副本
   * @returns 文件元数据数组
   */
  public getAllFiles(): IFileMeta[] {
    return [...this.files];
  }

  /**
   * 清除所有文件存储
   * @returns 清除结果
   */
  public async clearStorage(): Promise<{ success: boolean; error?: string }> {
    try {
      // 清空数据库
      await this.dbManager.truncate('files');

      // 删除文件
      const files = await fs.promises.readdir(this.filesDir);
      for (let i = 0; i < files.length; i += 10) {
        const batch = files.slice(i, i + 10);
        await Promise.all(
          batch.map(file =>
            fs.promises.unlink(path.join(this.filesDir, file))
          )
        );
      }

      // 重新加载文件列表
      this.files = [];

      return { success: true };
    } catch (error) {
      console.error('清除存储错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

}
