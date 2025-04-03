import { BaseResult } from "./common";
import { IFileMeta } from './meta/file';
export enum EResourceType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Document = 'document',
  All = 'all',
  Other = 'other',
}

export type TUploadResult = BaseResult<IFileMeta>;
export type TUploadDirectoryResult = BaseResult<IFileMeta[]>;


export interface IVectorProgress {
  current: number;
  total: number;
  success: number;
  failed: number;
  file?: IFileMeta;
}
