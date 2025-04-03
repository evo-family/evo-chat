import { BaseResult } from "@evo/types";

export class BaseBridge {

  protected handleError(error: any): BaseResult<any> {
    console.error('bridge-error', {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}