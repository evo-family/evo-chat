import { BaseResult, IMcpMeta } from '@evo/types';
import { createBaseMeta, ResultUtil, updateBaseMeta } from '@evo/utils';
import { IDepManager } from '../types/common';

export interface IMCPManagerOptions {
  depManager: IDepManager;
}

export class MCPManager {
  private depManager: IDepManager;

  constructor(options: IMCPManagerOptions) {
    this.depManager = options.depManager;
  }

  /**
   * 修改mcp状态
   * @param mcp
   * @returns
   */
  private async updateMcpEnable(mcp: IMcpMeta): Promise<IMcpMeta> {
    const startClientResult = await this.depManager.MCPClientManager.startClient(mcp);
    if (startClientResult.success) {
      mcp.enable = 1;
    } else {
      mcp.enable = 0;
    }
    return mcp;
  }

  async create(meta: IMcpMeta): Promise<BaseResult<IMcpMeta>> {
    try {
      const mcp: IMcpMeta = createBaseMeta({
        ...meta,
      });
      await this.updateMcpEnable(mcp);
      await this.depManager.dbManager.insert('mcp', mcp);
      return ResultUtil.success(mcp);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async update(meta: IMcpMeta): Promise<BaseResult<IMcpMeta>> {
    try {
      const updateData = updateBaseMeta<IMcpMeta>(meta);
      if (!('enable' in meta)) {
        await this.updateMcpEnable(updateData);
      }
      const res = await this.depManager.dbManager.update('mcp', updateData, { id: meta.id });
      return ResultUtil.success(updateData);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async delete(id: string): Promise<BaseResult<boolean>> {
    try {
      await this.depManager.dbManager.delete('mcp', { id });
      return ResultUtil.success(true);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async getList(): Promise<BaseResult<IMcpMeta[]>> {
    try {
      const sql = `
        SELECT m.*, mc.name as category_name
        FROM mcp m
        LEFT JOIN mcp_category mc ON m.category_id = mc.id
        ORDER BY m.create_time DESC
      `;
      const result = await this.depManager.dbManager.query(sql);
      return ResultUtil.success(result?.rows || []);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async getById(id: string): Promise<BaseResult<IMcpMeta | null>> {
    try {
      const sql = `
        SELECT m.*, mc.name as category_name
        FROM mcp m
        LEFT JOIN mcp_category mc ON m.category_id = mc.id
        WHERE m.id = $1
      `;
      const result = await this.depManager.dbManager.query(sql, [id]);
      return ResultUtil.success(result?.rows?.[0] || null);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async getListByCategoryId(categoryId: string): Promise<BaseResult<IMcpMeta[]>> {
    try {
      const sql = `
        SELECT m.*, mc.name as category_name
        FROM mcp m
        LEFT JOIN mcp_category mc ON m.category_id = mc.id
        WHERE m.category_id = $1
        ORDER BY m.create_time DESC
      `;
      const result = await this.depManager.dbManager.query(sql, [categoryId]);
      return ResultUtil.success(result?.rows || []);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }
}
