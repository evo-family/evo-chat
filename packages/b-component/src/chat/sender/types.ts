import { IFileMeta } from '@evo/types';

export interface ISenderContentProps {
  style?: React.CSSProperties;
  className?: string;
  onPostMessage?: (
    message: string,
    params: {
      fileInfos: IFileMeta[];
    }
  ) => any;
}
