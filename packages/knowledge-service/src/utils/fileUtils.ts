import fs from 'fs';
import path from 'path';

/**
 * 文件操作工具类
 */
export class FileUtils {
  /**
   * 确保目录存在，如不存在则创建
   * @param dirPath 目录路径
   */
  public static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * 读取文件内容
   * @param filePath 文件路径
   * @returns 文件内容
   */
  public static readFileContent(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  }

  /**
   * 获取目录中的所有文件
   * @param dirPath 目录路径
   * @returns 文件路径数组
   */
  public static getFilesInDirectory(dirPath: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dirPath);

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry);
      const stats = fs.statSync(entryPath);

      if (stats.isFile()) {
        files.push(entryPath);
      }
    }

    return files;
  }
}
