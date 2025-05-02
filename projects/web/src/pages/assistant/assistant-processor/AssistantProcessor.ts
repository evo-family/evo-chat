import { DialogProcessor } from '@evo/data-store';
import { BaseProcessor, DataCell } from '@evo/utils';

export class AssistantProcessor extends BaseProcessor {
  addOrUpdateAssistantDialog: DialogProcessor;
  selectedCategoryId: DataCell<string>;
  constructor() {
    super();
    this.addOrUpdateAssistantDialog = DialogProcessor.create().processor;
    this.selectedCategoryId = new DataCell<string>('all');
  }

  setSelectedCategoryId = (id: string) => {
    this.selectedCategoryId.set(id);
  };
}
