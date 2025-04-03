import React, { createContext, CSSProperties, PropsWithChildren, useContext, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { ISortableBaseItem } from './SortableList';
import { CSS } from '@dnd-kit/utilities';
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import s from './SortableList.module.scss';
import { HolderOutlined } from '@ant-design/icons';

const SortableItemContext = createContext<{
  attributes: Record<string, any>;
  listeners: DraggableSyntheticListeners;

  ref(node: HTMLElement | null): void;
}>({
  attributes: {},
  listeners: undefined,
  ref() {},
});

export const SortItem = ({ children, id, className }: PropsWithChildren<ISortableBaseItem>) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef]
  );
  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <SortableItemContext.Provider value={context}>
      <div ref={setNodeRef} className={className} style={style}>
        {children}
      </div>
    </SortableItemContext.Provider>
  );
};

export const DragHandle = (props: { children?: React.ReactNode; className?: string }) => {
  const { attributes, listeners, ref } = useContext(SortableItemContext);

  return (
    <span {...attributes} {...listeners} ref={ref} className={`${s.dragHandle} ${props.className}`}>
      {props.children || <HolderOutlined />}
    </span>
  );
};

export const useDragHandleProps = () => {
  const { attributes, listeners, ref } = useContext(SortableItemContext);

  return {
    ...attributes,
    ...listeners,
    ref,
  };
};
