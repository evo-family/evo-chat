import { BaseResult, IMcpCategoryMeta } from '@evo/types';
import { createBaseMeta, ResultUtil } from '@evo/utils';
import { IDepManager } from '../types/common';

export interface IMCPCategoryManagerOptions {
  depManager: IDepManager;
}

export class MCPCategoryManager {
  private depManager: IDepManager;

  constructor(options: IMCPCategoryManagerOptions) {
    this.depManager = options.depManager;
  }

  async create(meta: IMcpCategoryMeta): Promise<BaseResult<IMcpCategoryMeta>> {
    try {
      const category: IMcpCategoryMeta = createBaseMeta({
        ...meta,
      });
      await this.depManager.dbManager.insert('mcp_category', category);
      return ResultUtil.success(category);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async update(meta: IMcpCategoryMeta): Promise<BaseResult<IMcpCategoryMeta>> {
    try {
      const updateData = {
        ...meta,
        modifiedTime: Date.now(),
      };
      await this.depManager.dbManager.update('mcp_category', updateData, { id: meta.id });
      return ResultUtil.success(updateData);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async delete(id: string): Promise<BaseResult<boolean>> {
    try {
      // 先删除该分类下的所有 mcp
      await this.depManager.dbManager.delete('mcp', { category_id: id });

      // 再删除分类本身
      await this.depManager.dbManager.delete('mcp_category', { id });

      return ResultUtil.success(true);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async getList(): Promise<BaseResult<IMcpCategoryMeta[]>> {
    try {
      const sql = `
        SELECT *
        FROM mcp_category
        ORDER BY create_time DESC
      `;
      const result = await this.depManager.dbManager.query(sql);
      return ResultUtil.success(result?.rows || []);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async getById(id: string): Promise<BaseResult<IMcpCategoryMeta | null>> {
    try {
      const sql = `
        SELECT *
        FROM mcp_category
        WHERE id = $1
      `;
      const result = await this.depManager.dbManager.query(sql, [id]);
      return ResultUtil.success(result?.rows?.[0] || null);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }
}
