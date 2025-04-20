import { app } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../logger';
import { ManagerService } from './ManagerService';
import { BaseResult } from '@evo/types';
import { ResultUtil } from '@evo/utils';
import { SchemaManager } from '@evo/pglite-manager';

/**
 * 管理本地资源，向量数据库，文件，pglite地址
 */
export class ResourceService {
  private static instance: ResourceService;
  private baseDir: string;

  private constructor() {
    const savePath = path.join(app.getPath('userData') || process.cwd(), 'resource-data');
    // 知识库保存路径
    logger.info('save-data-path:', savePath);
    this.baseDir = savePath;
  }

  static getInstance(): ResourceService {
    if (!ResourceService.instance) {
      ResourceService.instance = new ResourceService();
    }
    return ResourceService.instance;
  }

  get uploadDir(): string {
    const dir = path.join(this.baseDir, 'upload-files');
    fs.ensureDirSync(dir);
    return dir;
  }

  get vectorDBPath(): string {
    const dir = path.join(this.baseDir, 'vector-db');
    fs.ensureDirSync(dir);
    return dir;
  }

  get pgDBPath(): string {
    const dir = path.join(this.baseDir, 'pg-db');
    fs.ensureDirSync(dir);
    return dir;
  }

  async cleanUploadFile(filePath: string): Promise<void> {
    try {
      if (filePath.startsWith(this.uploadDir)) {
        await fs.remove(filePath);
      }
    } catch (error) {
      console.error('清理上传文件失败:', error);
    }
  }

  async cleanVectorDB(knowledgeId: string): Promise<void> {
    try {
      const vectorPath = path.join(this.vectorDBPath, knowledgeId);
      await fs.remove(vectorPath);
    } catch (error) {
      console.error('清理向量数据库失败:', error);
    }
  }

  async cleanAll(): Promise<BaseResult<boolean>> {
    try {
      await fs.remove(this.baseDir);
      fs.ensureDirSync(this.baseDir);
      // 关闭数据库
      await SchemaManager.getInstance(this.pgDBPath).close();
      // 重建服务
      await ManagerService.recreateInstance();
      return ResultUtil.success(true);
    } catch (error) {
      console.error('清理所有资源失败:', error);
      return ResultUtil.error(error);
    }
  }

  async ensureDirectories(): Promise<void> {
    try {
      await fs.ensureDir(this.uploadDir);
      await fs.ensureDir(this.vectorDBPath);
      await fs.ensureDir(this.pgDBPath);
    } catch (error) {
      console.error('创建目录失败:', error);
    }
  }
}
