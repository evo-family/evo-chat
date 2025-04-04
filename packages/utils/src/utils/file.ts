import { EResourceType, IFileMeta } from '@evo/types';
import { isElectron, isMobile } from './env';

export const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
export const DOCUMENT_EXTS = ['.pdf', '.docx', '.pptx', '.xlsx', '.odt', '.odp', '.ods'];

/**
 * 获取文件扩展名
 * @param fileName 文件名
 * @returns 小写的扩展名（带点），如 .jpg
 */
export const getFileExtension = (fileName: string): string => {
  const ext = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2);
  return ext ? `.${ext.toLowerCase()}` : '';
};

/**
 * 获取文件扩展名（不带点）
 * @param fileName 文件名
 * @returns 小写的扩展名（不带点），如 jpg
 */
export const getFileExtensionWithoutDot = (fileName: string): string => {
  const ext = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2);
  return ext ? ext.toLowerCase() : '';
};

/**
 * 获取文件名（不带扩展名）
 * @param fileName 文件名
 * @returns 文件名（不带扩展名）
 */
export const getFileNameWithoutExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex === -1 ? fileName : fileName.slice(0, lastDotIndex);
};

/**
 * 判断是否是image 文件
 * @param fileName
 * @returns
 */
export const isImageFile = (fileName: string): boolean => {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return IMG_EXTS.includes(ext);
};

/**
 * 判断是否是image 文件
 * @param fileName
 * @returns
 */
export const isImageFileByExt = (ext: string): boolean => {
  return IMG_EXTS.includes(ext);
};

export const getPlatformFileAccept = () => {
  if (isElectron() || isMobile()) {
    return '*';
  }
  return 'image/*,audio/*,video/*,text/*,.json,.js,.ts,.css,.scss,.less,.html,.xml,.yaml,.yml,.md';
};

/**
 * 根据类型获取文件列表
 * @param files 文件列表
 * @param type 文件类型
 * @returns 文件列表
 */
export const getFileListByType = (
  files: IFileMeta[],
  options: {
    type: EResourceType;
    search?: string;
  }
) => {
  const { type, search } = options;
  let result = [];
  // 如果是全部文件或没有指定类型，返回所有文件
  if (!type || type === EResourceType.All) {
    result = files;
  } else {
    // 根据文件类型过滤
    result = files.filter((file) => {
      const ext = file.type.toLocaleLowerCase();
      switch (type) {
        case EResourceType.Image:
          return IMG_EXTS.includes(ext);
        case EResourceType.Document:
          return DOCUMENT_EXTS.includes(ext);
        case EResourceType.Audio:
          return ext === '.mp3' || ext === '.wav' || ext === '.ogg';
        case EResourceType.Video:
          return ext === '.mp4' || ext === '.webm' || ext === '.avi';
        case EResourceType.Other:
          return !IMG_EXTS.includes(ext) && !DOCUMENT_EXTS.includes(ext);
        default:
          return true;
      }
    });
  }

  // 按关键词搜索
  if (search) {
    const keyword = search.toLowerCase();
    result = result.filter((file) => file.name.toLowerCase().includes(keyword));
  }

  return result;
};
