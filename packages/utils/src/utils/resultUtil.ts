import { BaseResult } from "@evo/types";

export class ResultUtil {
  static success<T>(data: T): BaseResult<T> {
    return {
      success: true,
      data,
    };
  }

  static error<T>(error: any | string = '未知错误'): BaseResult<T> {
    const errorMessage = error instanceof Error ? error.message : error;
    return {
      success: false,
      error: errorMessage,
    };
  }
}
