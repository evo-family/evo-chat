import { IBaseMeta } from "../common";

export interface IFileMeta extends IBaseMeta {
  name: string;
  path: string;
  size: number;
  type: string;
}
