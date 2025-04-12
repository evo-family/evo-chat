import { BaseProcessor, DataCell } from '@evo/utils';
import { DialogProcessor } from '@evo/data-store';
import { McpBridgeFactory } from '@evo/platform-bridge';
import { BaseResult, IMcpCategoryMeta, IMcpMeta, IMcpService } from '@evo/types';

export class McpProcessor extends BaseProcessor {
  addOrUpdateCategoryDialog: DialogProcessor;
  mcpService: IMcpService;
  categoryListResult: DataCell<BaseResult<IMcpCategoryMeta[]>>;
  mcpListResult: DataCell<BaseResult<IMcpMeta[]>>;
  selectCategory: DataCell<IMcpCategoryMeta | null>;

  private bindServiceMethod<T, P extends any[]>(
    dataCell: DataCell<BaseResult<T>> | null,
    method: (this: IMcpService, ...args: P) => Promise<BaseResult<T>>,
    callback?: (result: BaseResult<T>) => void
  ) {
    return async (...args: P) => {
      const res = await method.apply(this.mcpService, args);
      dataCell?.set(res);
      callback?.(res);
      return res;
    };
  }

  constructor() {
    super();
    this.addOrUpdateCategoryDialog = DialogProcessor.create().processor;
    this.mcpService = McpBridgeFactory.getInstance();
    this.categoryListResult = new DataCell({} as any);
    this.mcpListResult = new DataCell({} as any);
    this.selectCategory = new DataCell(null as any);
  }

  setSelectCategory = (category: IMcpCategoryMeta) => {
    this.selectCategory.set(category);
    this.getMcpListByCategoryId(category.id);
  };

  createCategory = async (meta: Partial<IMcpCategoryMeta>) => {
    const res = await this.mcpService.createCategory(meta);
    if (res.success) {
      this.getCategoryList();
    }
    return res;
  };

  updateCategory = async (meta: IMcpCategoryMeta) => {
    const res = await this.mcpService.updateCategory(meta);
    if (res.success) {
      this.getCategoryList();
    }
    return res;
  };

  get getCategoryList() {
    return this.bindServiceMethod(
      this.categoryListResult,
      this.mcpService.getCategoryList,
      (res) => {
        if (this.selectCategory.get() === null && res.data!?.length > 0) {
          this.selectCategory.set(res.data![0]);
        }
      }
    );
  }

  get getMcpListByCategoryId() {
    return this.bindServiceMethod(this.mcpListResult, this.mcpService.getMcpListByCategoryId);
  }
}
