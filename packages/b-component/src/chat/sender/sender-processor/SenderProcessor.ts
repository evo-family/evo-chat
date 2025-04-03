import { BaseProcessor, DataCell } from "@evo/utils";
import { GetRef } from "antd";
import React from "react";

import { Sender as AntdXSender, } from '@ant-design/x';
export class SenderProcessor extends BaseProcessor {

  modelSelectOpen: DataCell<boolean>;

  knowledgeSelectOpen: DataCell<boolean>;

  text: DataCell<string>;

  isMentionTrigger: boolean;

  senderRef = React.useRef<GetRef<typeof AntdXSender>>(null);


  constructor() {
    super();
    this.isMentionTrigger = false;
    this.modelSelectOpen = new DataCell(false);
    this.knowledgeSelectOpen = new DataCell(false);
    this.text = new DataCell('');
  }

  setIsMentionTrigger = (trigger: boolean) => {
    this.isMentionTrigger = trigger;
  }


  setModelSelectOpen = (open: boolean) => {
    this.modelSelectOpen.set(open);
  }

  setKnowledgeSelectOpen = (open: boolean) => {
    this.knowledgeSelectOpen.set(open);
  }

  setText = (text: string) => {
    this.text.set(text);
  }

  removeLastAtChar = () => {
    const currentText = this.text.get();
    if (currentText.endsWith('@') && this.isMentionTrigger) {
      this.isMentionTrigger = false;
      this.text.set(currentText.slice(0, -1));
    }
  }


}