import React, { useEffect, useMemo, useState } from 'react';
import {
  Active,
  DndContext,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { DragHandle, SortItem } from './SortItem';
import classNames from 'classnames';
import s from './SortableList.module.scss';
import { isH5 } from '@evo/utils';

const findTransformParent = (node: HTMLElement) => {
  const recursiveFind = (childNode: HTMLElement): HTMLElement | null => {
    const parentElement = childNode.parentElement;

    if (!parentElement) {
      // 已经遍历到头了
      return null;
    }

    const parentTransformStyle = parentElement.style.transform;

    if (!parentTransformStyle || parentTransformStyle === 'none') {
      // 不是拥有transform属性的父级元素
      return recursiveFind(parentElement);
    }

    return parentElement;
  };

  return recursiveFind(node);
};

export interface ISortableBaseItem {
  id: UniqueIdentifier;
  className?: string;
}

export interface ISortableListProps<T extends ISortableBaseItem> {
  items: T[];

  onSort(items: T[]): void;

  renderItem: (item: T) => React.ReactNode;

  className?: string;
}

export const SortableList = <T extends ISortableBaseItem>({
  items,
  onSort,
  renderItem,
  className = '',
}: // sortPropKey = 'id',
ISortableListProps<T>) => {
  const [active, setActive] = useState<Active | null>(null);
  const activeItem = useMemo(() => items.find((item) => item.id === active?.id), [active, items]);
  const sensors = isH5()
    ? useSensors(
        useSensor(TouchSensor, {
          activationConstraint: {
            delay: 0,
            tolerance: 100,
          },
        })
      )
    : useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
      );

  let RenderItem = renderItem;

  return (
    <DndContext
      sensors={sensors}
      modifiers={isH5() ? [] : undefined}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={({ active }) => {
        setActive(active);
      }}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = items.findIndex(({ id }) => id === active.id);
          const overIndex = items.findIndex(({ id }) => id === over.id);

          onSort(arrayMove(items, activeIndex, overIndex));
        }
        setActive(null);
      }}
      onDragCancel={() => {
        setActive(null);
      }}
    >
      <SortableContext items={items}>
        <div className={classNames(s.list, className)}>
          {items.map((item, index) => (
            <React.Fragment key={item.id || index}>
              {renderItem(item)}
              {/*<RenderItem item={item} />*/}
            </React.Fragment>
          ))}
        </div>
      </SortableContext>
      {/*<BSortableOverlay>{activeItem ? renderItem?.(activeItem) : null}</BSortableOverlay>*/}
    </DndContext>
  );
};

SortableList.Item = SortItem;
SortableList.DragHandle = DragHandle;
