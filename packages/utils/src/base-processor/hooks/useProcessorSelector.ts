import React from "react";
import { DeepUnwrapDataCell, useProcessorReturn } from "./useProcessorReturn";

/**
 * Processor选择器，如果返回的数据有DataCell类型，会返回具体的值
 * @param context
 * @param selector
 * @returns
 */
export function useProcessorSelector<T, R>(
  context: React.Context<T>,
  selector: (state: T) => R
): DeepUnwrapDataCell<R> {
  const contextValue = React.useContext(context);
  const selectedValue = selector(contextValue);
  return useProcessorReturn(selectedValue) as DeepUnwrapDataCell<R>;
}
