import {
  Sender as AntdXSender,
  Attachments,
  AttachmentsProps,
  SenderProps,
  Suggestion,
} from '@ant-design/x';
import { Button, GetProp, GetRef, Space, Spin, Tag, Upload, UploadProps, message } from 'antd';
import { CloudUploadOutlined, LinkOutlined, OpenAIFilled, OpenAIOutlined } from '@ant-design/icons';
import { CommonBridgeFactory, UploadBridgeFactory } from '@evo/platform-bridge';
import { EModalAnswerStatus, useChatWinCtx, useGlobalCtx } from '@evo/data-store';
import { IFileMeta, MobilePermissionType } from '@evo/types';
import React, { FC, memo, useEffect, useLayoutEffect } from 'react';
import { SenderProvider, useSenderSelector } from './sender-processor/SenderProvider';
import {
  getFileExtension,
  getPlatformFileAccept,
  isDocumentFile,
  isH5,
  isMobileApp,
  isWeb,
  useCellValue,
} from '@evo/utils';
import { useDebounceFn, useMemoizedFn } from 'ahooks';

import { ActionsRender } from '@ant-design/x/es/sender';
import { EvoIcon } from '../../icon';
import { ISenderContentProps } from './types';
import { SenderToolbar } from './SenderToolbar';
import { noop } from 'lodash';
import { useAntdToken } from '../../hooks';

const SENDER_ATTACH_STYLES = {
  content: {
    padding: 0,
  },
};

export const SenderContent: FC<ISenderContentProps> = memo((props) => {
  const { style, className, onPostMessage } = props;

  const token = useAntdToken();
  const text = useSenderSelector((s) => s.text);
  const setText = useSenderSelector((s) => s.setText);
  const setIsMentionTrigger = useSenderSelector((s) => s.setIsMentionTrigger);
  const setModelSelectOpen = useSenderSelector((s) => s.setModelSelectOpen);
  const senderRef = useSenderSelector((s) => s.senderRef);
  const [chatCtrl] = useGlobalCtx((s) => s.chatCtrl);
  const [chatWin] = useChatWinCtx((s) => s.chatWin);
  const [latestMsg] = useChatWinCtx((s) => s.latestMsg);

  const [fileOpen, setFileOpen] = React.useState(false);
  const [items, setItems] = React.useState<GetProp<AttachmentsProps, 'items'>>([]);
  // 添加文件信息状态
  const [fileInfos, setFileInfos] = React.useState<IFileMeta[]>([]);
  const [loading, setLoading] = React.useState(false);

  const attachmentsRef = React.useRef<GetRef<typeof Attachments>>(null);
  const [mobileHasMicPermission, setMobileHasMicPermission] = React.useState(false);

  const handleSubmit = useMemoizedFn(async () => {
    const models = (await chatCtrl.getCurWindow())?.getConfigState('models');

    if (!models?.length) {
      message.warning('请选择至少一个 AI 模型进行对话');
      return;
    }

    // 文件信息
    await onPostMessage?.(text, { fileInfos });

    setItems([]);
    setFileInfos([]);
    setText('');
    setFileOpen(false);
  });

  const handleBeforeUpload = useMemoizedFn(async (file) => {
    try {
      if (isWeb() && isDocumentFile(file.name)) {
        message.error('Web 端不支持上传文档类型文件（pdf、docx、pptx 等）');
        return Upload.LIST_IGNORE;
      }

      // if (isWeb() && !file.type.startsWith('image/')) {
      //   message.error('Web 端仅支持上传图片格式文件（jpg、png、gif 等）');
      //   return Upload.LIST_IGNORE;
      // }

      setLoading(true);

      const buffer = await file.arrayBuffer();

      const result = await UploadBridgeFactory.getUpload().uploadBufferFile({
        fileBuffer: buffer,
        fileMeta: {
          name: file.name,
          size: file.size,
          type: getFileExtension(file.name),
        },
      });

      if (result.success && result.data) {
        message.success('文件上传成功');
        setFileInfos((prev) => [...prev, result.data!]);
        return false; // 阻止默认上传行为
      } else {
        message.error('文件上传失败');
        return Upload.LIST_IGNORE;
      }
    } catch (error) {
      console.error('文件上传错误:', error);
      message.error('文件上传失败');

      return Upload.LIST_IGNORE;
    } finally {
      setLoading(false);
    }
  });

  const handleFileChange = useMemoizedFn<Required<UploadProps>['onChange']>(({ fileList }) =>
    setItems(fileList)
  );

  const getPlaceholader = useMemoizedFn((type: 'inline' | 'drop') =>
    type === 'drop'
      ? {
          title: '拖拽文件到此处',
        }
      : {
          icon: <CloudUploadOutlined />,
          title: '上传文件',
          description: '点击或拖拽文件到此处上传',
        }
  );

  const onPasteFile = useMemoizedFn<Required<SenderProps>['onPasteFile']>((file) => {
    attachmentsRef.current?.upload(file);
    setFileOpen(true);
  });

  const onKeyDown = useMemoizedFn<Required<SenderProps>['onKeyDown']>((e) => {
    if (e.key === '@') {
      setModelSelectOpen(true);
      setIsMentionTrigger(true);
    }
  });

  const handleStopMessage = useMemoizedFn(() => {
    const msgId = latestMsg?.getConfigState('id');

    if (!msgId) return;

    chatWin.stopResolveMessage(msgId);
  });

  const debouncedCheck = useDebounceFn(
    async (e: React.MouseEvent) => {
      if (!mobileHasMicPermission && isMobileApp()) {
        const result = await CommonBridgeFactory.getInstance().checkMobilePermission?.([
          MobilePermissionType.microphone,
        ]);
        setMobileHasMicPermission(!!result);
        if (!result) {
          return;
        }

        try {
          const audioButton = document
            .querySelector(
              'button.ant-btn.ant-sender-actions-btn .anticon-audio[aria-label="audio"]'
            )
            ?.closest('button');
          if (audioButton instanceof HTMLButtonElement) {
            audioButton.click();
          }
        } catch (error) {
          console.error('checkMobilePermission error:', error);
        }
      }
    },
    { wait: 500 }
  );

  const preCheckMobilePermission = useMemoizedFn((e: React.MouseEvent) => {
    if (isMobileApp()) {
      e.preventDefault();
      e.stopPropagation();

      debouncedCheck.run(e);
    }
  });

  const renderActions = useMemoizedFn<ActionsRender>((_, info) => {
    const { SendButton, LoadingButton, ClearButton, SpeechButton } = info.components;

    return (
      <Space size="small">
        {/* <ClearButton /> */}
        <div onClick={preCheckMobilePermission}>
          <div
            style={{
              pointerEvents: isMobileApp() && !mobileHasMicPermission ? 'none' : 'auto',
            }}
          >
            <SpeechButton variant="filled" color="default" />
          </div>
        </div>
        {loading ? (
          // icon={<Spin size="small" />}
          <LoadingButton type="default" />
        ) : (
          <SendButton
            className={'evo-button-icon'}
            // variant="filled"
            variant="solid"
            color="default"
            icon={<EvoIcon type="icon-send" />}
            disabled={false}
          />
        )}
      </Space>
    );
  });

  useLayoutEffect(() => {
    setLoading(false);

    if (!latestMsg) return;

    const subscription = latestMsg.modelAnswers.globListen(
      () => {
        const allAnswersInfo = latestMsg.modelAnswers.getCellsValue({ all: true });
        const arrayAnswers = allAnswersInfo.array;

        const isResolving = arrayAnswers.some(
          (info) =>
            info?.status === EModalAnswerStatus.PENDING ||
            info?.status === EModalAnswerStatus.RECEIVING
        );

        setLoading(isResolving);
      },
      { debounceTime: 50, immediate: true }
    );

    return () => subscription.unsubscribe();
  }, [latestMsg]);

  // 切换窗口时，聚焦发送框
  useLayoutEffect(() => {
    senderRef.current?.focus();
  }, [chatWin]);

  return (
    <AntdXSender
      allowSpeech
      loading={loading}
      style={{
        background: token.colorFillSecondary,
      }}
      ref={senderRef as any}
      header={
        <div>
          <AntdXSender.Header
            closable
            title="附件"
            styles={SENDER_ATTACH_STYLES}
            open={fileOpen}
            onOpenChange={setFileOpen}
            forceRender
          >
            <Attachments
              overflow={'scrollX'}
              ref={attachmentsRef}
              accept={getPlatformFileAccept()}
              beforeUpload={handleBeforeUpload}
              items={items}
              onChange={handleFileChange}
              placeholder={getPlaceholader}
              getDropContainer={() => document.body}
              maxCount={5}
              multiple
            />
          </AntdXSender.Header>
          <SenderToolbar
            fileItems={items}
            fileOpen={fileOpen}
            setFileOpen={setFileOpen}
            mobileClickAttachment={() => {
              // 触发文件上传
              const uploadInput = document.querySelector(
                '.ant-upload input[type="file"]'
              ) as HTMLInputElement;
              if (uploadInput) {
                uploadInput.click();
              }
            }}
          />
        </div>
      }
      onKeyPress={noop}
      onKeyDown={onKeyDown}
      onChange={setText}
      placeholder="发消息、输入 @ 选择模型"
      value={text}
      actions={renderActions}
      onPasteFile={onPasteFile}
      onSubmit={handleSubmit}
      onCancel={handleStopMessage}
    />
  );
});

export interface ISenderProps extends ISenderContentProps {}

export const Sender: FC<ISenderProps> = memo((props) => {
  return (
    <SenderProvider>
      <SenderContent {...props} />
    </SenderProvider>
  );
});
