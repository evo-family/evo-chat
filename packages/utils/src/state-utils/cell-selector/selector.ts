import { DataCell } from '../../data-cell/cell';
import { DataCellSignal } from '../../data-cell/types';

/**
 * 单元格选择器接口
 * 用于从源单元格值中选择派生值
 */
export interface ICellSelector<T extends DataCell, R> {
  (value: ReturnType<T['get']>): R;
}

/**
 * 单元格选择器选项
 */
export interface ICellSelectorOptions<T extends DataCell> {
  /** 监听选项，传递给源单元格的listen方法 */
  listenOptions?: Parameters<T['listen']>['1'];
  /** 是否跳过相等值检查 */
  skipEqualityCheck?: boolean;
  /** 自定义相等性检查函数 */
  equalityFn?: (prev: any, next: any) => boolean;
}

/**
 * 创建一个派生单元格，其值由源单元格的值通过选择器函数计算得出
 *
 * @param cell 源单元格
 * @param selector 选择器函数，用于从源值计算派生值
 * @param options 选择器选项
 * @returns 派生单元格
 */
export const cellSelector = <T extends DataCell, R>(
  cell: T,
  selector: ICellSelector<T, R>,
  options?: ICellSelectorOptions<T>
): DataCell<R> => {
  // 处理选项兼容性
  const { listenOptions, skipEqualityCheck, equalityFn } = options ?? {};

  // 初始化派生单元格
  const initialValue = selector(cell.get());
  const derivedCell = new DataCell<R>(initialValue);

  // 监听源单元格变化
  const subscription = cell.listen((signal: DataCellSignal<any>) => {
    // 忽略销毁信号，因为其next值可能不是有效值
    if (signal.action === 'destroy') {
      // 当源单元格销毁时，也销毁派生单元格
      derivedCell.destroy();
      return;
    }

    // 计算新的派生值
    const currentValue = derivedCell.get();
    const nextValue = selector(signal.next);

    // 检查值是否变化，避免不必要的更新
    if (skipEqualityCheck || !areValuesEqual(currentValue, nextValue, equalityFn)) {
      derivedCell.set(nextValue, {
        // 传递原始信号的静默标志
        silent: signal.silent,
        signalInfo: signal.signalInfo,
      });
    }
  }, listenOptions);

  // 增强派生单元格，添加清理逻辑
  enhanceDerivedCell(cell, derivedCell);

  return derivedCell;
};

/**
 * 检查两个值是否相等
 */
function areValuesEqual(
  prev: any,
  next: any,
  equalityFn?: (prev: any, next: any) => boolean
): boolean {
  if (equalityFn) {
    return equalityFn(prev, next);
  }

  // 默认使用严格相等
  return prev === next;
}

/**
 * 增强派生单元格，添加清理逻辑
 */
function enhanceDerivedCell(sourceCell: DataCell, derivedCell: DataCell): void {
  sourceCell.registerHook('destroy', () => derivedCell.destroy());
}
