import { BaseResult, IMcpCategoryMeta, IMcpMeta, IMcpService } from '@evo/types';
import { BaseBridge } from '../common/baseBridge';

export class WebMcp extends BaseBridge implements IMcpService {
  createCategory(meta: Partial<IMcpCategoryMeta>): Promise<BaseResult<IMcpCategoryMeta>> {
    throw new Error('Method not implemented.');
  }
  updateCategory(meta: IMcpCategoryMeta): Promise<BaseResult<IMcpCategoryMeta>> {
    throw new Error('Method not implemented.');
  }
  deleteCategory(id: string): Promise<BaseResult<boolean>> {
    throw new Error('Method not implemented.');
  }
  getCategoryList(): Promise<BaseResult<IMcpCategoryMeta[]>> {
    throw new Error('Method not implemented.');
  }
  getCategoryById(id: string): Promise<BaseResult<IMcpCategoryMeta | null>> {
    throw new Error('Method not implemented.');
  }
  createMcp(meta: IMcpMeta): Promise<BaseResult<IMcpMeta>> {
    throw new Error('Method not implemented.');
  }
  updateMcp(meta: IMcpMeta): Promise<BaseResult<IMcpMeta>> {
    throw new Error('Method not implemented.');
  }
  deleteMcp(id: string): Promise<BaseResult<boolean>> {
    throw new Error('Method not implemented.');
  }
  getMcpList(): Promise<BaseResult<IMcpMeta[]>> {
    throw new Error('Method not implemented.');
  }
  getMcpById(id: string): Promise<BaseResult<IMcpMeta | null>> {
    throw new Error('Method not implemented.');
  }
  getMcpListByCategoryId(categoryId: string): Promise<BaseResult<IMcpMeta[]>> {
    throw new Error('Method not implemented.');
  }
}
