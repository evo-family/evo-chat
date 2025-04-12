import React, { FC } from 'react';
import { useContentPanelSelector } from '../../../components';
import { EnvCheck } from './env-check/EnvCheck';

export interface IToolbarProps {}

export const Toolbar: FC<IToolbarProps> = (props) => {
  const ToolbarPortal = useContentPanelSelector((s) => s.ToolbarPortal);

  return (
    <ToolbarPortal>
      <EnvCheck />
    </ToolbarPortal>
  );
};
