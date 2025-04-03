import { ActionType } from '@ant-design/pro-components';
import { EResourceType } from '@evo/types';
import { BaseProcessor, DataCell } from '@evo/utils';
import React from 'react';

export type TResourceType = 'file' | 'knowledge'

export class FileProcessor extends BaseProcessor {
  type = new DataCell<TResourceType>('file');

  sliderVisible = new DataCell<boolean>(false);

  menuSelectKey = new DataCell<EResourceType>(EResourceType.All);

  tableActionRef = React.useRef<ActionType>();

  constructor() {
    super();
  }

  setMenuSelectKey = (key: EResourceType) => {
    this.menuSelectKey.set(key);
  }

  collapseSlider = () => {
    this.sliderVisible.set(!this.sliderVisible.get());
  }


  setType = (type: TResourceType) => {
    this.type.set(type);
  }

}
