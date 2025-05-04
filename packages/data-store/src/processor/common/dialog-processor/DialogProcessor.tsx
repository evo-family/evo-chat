import { BaseProcessor, DataCell } from '@evo/utils';
import { IDialogData } from '../../../types';

export class DialogProcessor<T extends any = any> extends BaseProcessor {
  dialogData: DataCell<IDialogData<T>>;
  constructor() {
    super();
    this.dialogData = new DataCell<IDialogData<T>>({
      type: 'create',
      data: null as any,
      open: false,
    });
    this.init();
  }
  private init = async () => {
    this.listeners();
  };
  /**
   * 开启监听器
   */
  private listeners = () => {};

  /**
   * 设置数据
   * @param modalData
   */
  setDialogData = (modalData: Partial<IDialogData<T>>) => {
    this.dialogData.set({
      ...this.dialogData.get(),
      ...modalData,
    });
  };

  /**
   * 设置modal创建数据
   * @param modalData
   */
  setCreateModalData = (modalData?: IDialogData<T>) => {
    this.setDialogData({ type: 'create', open: true, data: {} as T, ...modalData });
  };

  /**
   * 设置modal编辑数据
   * @param data 编辑的数据
   * @param modalData 其他弹窗数据
   */
  setUpdateModalData = (modalData?: Partial<IDialogData<T>>) => {
    this.setDialogData({ type: 'update', open: true, ...modalData });
  };

  closeDialog = () => {
    this.setDialogData({ open: false });
  };

  openDialog = () => {
    this.setDialogData({ open: true });
  };
}
