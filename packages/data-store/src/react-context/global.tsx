import { EnvProcessor, modelProcessor, ModelProcessor, SettingProcessor } from '../processor';
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';

import { ChatController } from '../chat-controller/chatControlller';

import { createContext } from 'use-context-selector';
import { createUseContextSelector } from '@/utils/createContextSelector';
import { useUpdate } from 'ahooks';

export interface IGlobalContext {
  chatCtrl: ChatController;
  curWinId: ChatController['curWinId'];
  modelProcessor: ModelProcessor;
  envProcessor: EnvProcessor;
}

const defaultContext: IGlobalContext = {
  chatCtrl: undefined,
} as any;

export const GlobalContext = createContext(defaultContext);

export const useGlobalCtx = createUseContextSelector(GlobalContext);

export const GlobalContextProvider = React.memo<PropsWithChildren<{}>>((props) => {
  const flushUI = useUpdate();
  const [chatCtrl] = useState(() => new ChatController({}));

  const [envProcessor] = useState(() => EnvProcessor.create().processor);
  // const [modelProcessor] = useState(() => modelProcessor);

  const contextValue: IGlobalContext = useMemo(() => {
    return { chatCtrl, curWinId: chatCtrl.curWinId, modelProcessor, envProcessor };
  }, [chatCtrl]);

  useEffect(() => {
    chatCtrl.ready().then(() => {
      flushUI();
    });
    modelProcessor.isReady.listen(() => {
      flushUI();
    });
  }, [chatCtrl, modelProcessor]);

  if (!chatCtrl.isReady || !modelProcessor.isReady.get()) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {'loading...'}
      </div>
    );
  }

  return <GlobalContext.Provider value={contextValue}>{props.children}</GlobalContext.Provider>;
});
