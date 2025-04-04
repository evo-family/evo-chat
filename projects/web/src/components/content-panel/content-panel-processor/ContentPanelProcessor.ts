import { BaseProcessor, DataCell } from '@evo/utils';
import { useUpdate } from 'ahooks';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';

export class ContentPanelProcessor extends BaseProcessor {
  toolbarElement = new DataCell<HTMLDivElement | null>(null);

  constructor() {
    super();
  }

  setToolbarElement = (toolbarElement: HTMLDivElement) => {
    this.toolbarElement.set(toolbarElement);
  };

  ToolbarPortal = (props: { children: React.ReactElement }) => {
    const element = this.toolbarElement.get();
    const update = useUpdate();
    useEffect(() => {
      this.toolbarElement.listen(
        () => {
          update();
        },
        {
          immediate: true,
        }
      );
    }, []);

    if (!element) return null;
    const { children } = props;
    return ReactDOM.createPortal(children, element);
  };
}
