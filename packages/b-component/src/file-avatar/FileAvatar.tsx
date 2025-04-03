import React, { FC } from 'react';
import { FileImage } from '../file-image/FileImage';
import { isImageFile } from '@evo/utils';
import { Attachments } from '@ant-design/x';
import s from './FileAvatar.module.scss';

interface FileAvatarProps {
  id: string;
  name: string;
  style?: React.CSSProperties;
}

export const FileAvatar: FC<FileAvatarProps> = ({ id, name, style }) => {
  // const isImage = isImageFile(name);

  // if (isImage) {
  //   return (
  //     <div className={s.fileAvatar} style={style}>
  //       <div className={s.imageWrapper}>
  //         <FileImage
  //           style={{
  //             width: 40
  //           }}
  //           fileId={id}
  //           alt={name}
  //         />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={s.fileAvatar} style={style}>
      <Attachments.FileCard
        style={{
          width: 40
        }}
        item={{
          uid: id,
          name: name,
        }}
      />
    </div>
  );
};