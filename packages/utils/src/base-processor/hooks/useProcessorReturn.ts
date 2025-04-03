import { useEffect, useState } from "react";
import { DataCell } from "../../data-cell/cell";
type UnwrapDataCell<T> = T extends DataCell<infer U>
  ? U
  : T extends [any, ...any[]]
  ? { [K in keyof T]: UnwrapDataCell<T[K]> }
  : T extends Array<infer A>
  ? Array<UnwrapDataCell<A>>
  : T;

export type DeepUnwrapDataCell<T> = T extends (...args: any[]) => any
  ? T
  : T extends DataCell<infer U>
  ? U
  : T extends [any, ...any[]]
  ? { [K in keyof T]: DeepUnwrapDataCell<T[K]> }
  : T extends Array<infer A>
  ? Array<DeepUnwrapDataCell<A>>
  : T extends object
  ? { [K in keyof T]: DeepUnwrapDataCell<T[K]> }
  : T;

export const useProcessorReturn = <T,>(data: T): T => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (Array.isArray(data)) {
      const unsubscribes = data.map(item => {
        if (item instanceof DataCell) {
          return item.listen(() => {
            forceUpdate({});
          });
        }
        return null;
      });

      return () => {
        unsubscribes.forEach(unsubscribe => {
          unsubscribe?.unsubscribe();
        });
      };
    } else if (data instanceof DataCell) {
      const unsubscribe = data.listen(() => {
        forceUpdate({});
      });
      return () => {
        unsubscribe?.unsubscribe();
      };
    }
  }, []);

  if (Array.isArray(data)) {
    return data.map(item => {
      if (item instanceof DataCell) {
        return item.get();
      }
      return item;
    }) as T;
  }

  if (data instanceof DataCell) {
    return data.get() as T;
  }

  return data;
};

