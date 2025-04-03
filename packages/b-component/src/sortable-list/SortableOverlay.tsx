import React, { FC } from 'react';
import { defaultDropAnimationSideEffects, DragOverlay, DropAnimation } from '@dnd-kit/core';

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

export interface ISortableOverlayProps {
  children?: React.ReactNode;
}

export const SortableOverlay: FC<ISortableOverlayProps> = ({ children }) => {
  return <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>;
};
