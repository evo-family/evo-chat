import { IFileMeta } from '@evo/types';
import { isImageFile } from '@evo/utils';
import { FileImage } from '../file-image/FileImage';
import { Modal } from 'antd';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';

const PreviewContainer = ({ fileMeta, onClose }: { fileMeta: IFileMeta; onClose: () => void }) => {
  if (isImageFile(fileMeta.name)) {
    return createPortal(
      <FileImage
        preview={{
          visible: true,
          onVisibleChange: (value) => {
            if (!value) {
              onClose();
            }
          },
        }}
        fileId={fileMeta.id}
        width="100%"
        height="auto"
      />,
      document.body
    );
  }

  return createPortal(
    <Modal
      title={fileMeta.name}
      open={true}
      onCancel={onClose}
      footer={null}
    >
      <p>文件类型：{fileMeta.type}</p>
      <p>文件大小：{fileMeta.size} bytes</p>
    </Modal>,
    document.body
  );
};

export class FilePreview {
  private static container: HTMLDivElement | null = null;
  private static root: ReturnType<typeof createRoot> | null = null;

  static show(fileMeta: IFileMeta) {
    // 如果已经存在预览，先关闭
    this.close();

    // 创建新的预览
    this.container = document.createElement('div');
    this.root = createRoot(this.container);
    document.body.appendChild(this.container);

    this.root.render(
      <PreviewContainer
        fileMeta={fileMeta}
        onClose={() => this.close()}
      />
    );
  }

  static close() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}