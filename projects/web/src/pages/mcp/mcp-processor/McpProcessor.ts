import { BaseProcessor, DataCell } from '@evo/utils';
import { BaseResult, IMcpCategoryMeta, IMcpMeta, IMcpService } from '@evo/types';

import { DialogProcessor } from '@evo/data-store';
import { McpBridgeFactory } from '@evo/platform-bridge';

export class McpProcessor extends BaseProcessor {
  // 弹窗管理
  addOrUpdateMcpDialog: DialogProcessor;
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
    this.addOrUpdateMcpDialog = DialogProcessor.create().processor;
    this.mcpService = McpBridgeFactory.getInstance();
    this.categoryListResult = new DataCell({} as any);
    this.mcpListResult = new DataCell({} as any);
    this.selectCategory = new DataCell(null as any);
  }

  // MCP 相关方法
  createMcp = async (meta: IMcpMeta) => {
    const res = await this.mcpService.createMcp(meta);
    if (res.success) {
      await this.getMcpListByCategoryId(meta.categoryId);
    }
    return res;
  };

  updateMcp = async (meta: Partial<IMcpMeta>) => {
    console.log(111, meta);
    const res = await this.mcpService.updateMcp(meta);
    if (res.success) {
      this.getMcpListByCategoryId(this.selectCategory.get()?.id!);
    }
    return res;
  };

  deleteMcp = async (id: string) => {
    const res = await this.mcpService.deleteMcp(id);
    if (res.success) {
      await this.getMcpListByCategoryId(this.selectCategory.get()!.id);
    }
    return res;
  };

  setSelectCategory = (category: IMcpCategoryMeta) => {
    this.selectCategory.set(category);
    this.getMcpListByCategoryId(category.id);
  };

  createCategory = async (meta: Partial<IMcpCategoryMeta>) => {
    const res = await this.mcpService.createCategory(meta);
    if (res.success) {
      const list = await this.getCategoryList();
      this.setSelectCategory(list?.data?.[0]!);
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

  deleteCategory = async (id: string) => {
    const res = await this.mcpService.deleteCategory(id);
    if (res.success) {
      const list = await this.getCategoryList();
      this.setSelectCategory(list?.data?.[0]!);
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
