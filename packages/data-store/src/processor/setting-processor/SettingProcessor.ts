import {
  BaseProcessor,
  checkForUpdate,
  DataCell,
  isElectron,
  persistenceCellSync,
  setPartialDataCell,
  storage,
} from '@evo/utils';
import {
  ELanguage,
  ELayout,
  EThemeMode,
  IAboutSetting,
  IAvailableModel,
  IChatSetting,
} from '@evo/types';
import {
  SETTING_ABOUT,
  SETTING_CHAT_CONFIG,
  SETTING_DEFAULT_MESSAGE_MODEL,
  SETTING_DEFAULT_RENAME_MODEL,
  SETTING_LANGUAGE,
  SETTING_THEME,
  SETTING_THEME_COLOR,
} from '../constants';

import { EStorageType } from '../../types/storageKey';
import { modelProcessor } from '../model-processor';
import { themeColorData } from '../../config-data';
import { SystemBridgeFactory } from '@evo/platform-bridge';

export class SettingProcessor extends BaseProcessor {
  theme: DataCell<EThemeMode>;
  themeColorId: DataCell<string>;
  language: DataCell<ELanguage>;
  layout: DataCell<ELayout>;

  defaultMessageModel: DataCell<IAvailableModel>;
  defaultRenameModel: DataCell<IAvailableModel>;

  about: DataCell<IAboutSetting>;

  /**
   * 会话设置
   */
  chatSetting: DataCell<IChatSetting>;

  private getDefaultModel(availableModel?: IAvailableModel): IAvailableModel | undefined {
    if (!availableModel) return undefined;

    return {
      ...availableModel,
      models: availableModel.models.slice(0, 1),
    };
  }

  constructor() {
    super();
    this.theme = persistenceCellSync<EThemeMode>(SETTING_THEME, EThemeMode.System);
    this.themeColorId = persistenceCellSync<string>(SETTING_THEME_COLOR, themeColorData?.[0].value);
    this.language = persistenceCellSync<ELanguage>(SETTING_LANGUAGE, ELanguage.AUTO);
    this.layout = new DataCell(ELayout.l1 as any);
    this.chatSetting = persistenceCellSync<IChatSetting>(SETTING_CHAT_CONFIG, {
      enableContinuousDialogue: true,
      historyMessageCount: 4,
      showModelInfo: true,
      showTokenCount: false,
    });

    const defaultModel = this.getDefaultModel(modelProcessor?.availableModels?.get()?.[0]);
    this.defaultMessageModel = persistenceCellSync<IAvailableModel>(
      SETTING_DEFAULT_MESSAGE_MODEL,
      defaultModel
    );
    this.defaultRenameModel = persistenceCellSync<IAvailableModel>(
      SETTING_DEFAULT_RENAME_MODEL,
      defaultModel
    );

    this.about = persistenceCellSync<IAboutSetting>(SETTING_ABOUT, {
      version: '',
      isAutoUpdate: true,
    });

    this.init();
  }

  private init() {
    // this.theme.listen(({ next }) => {
    // })
    if (isElectron()) {
      SystemBridgeFactory.getInstance()
        .getVersion()
        .then((version) => {
          setTimeout(() => {
            this.setAbout({
              version: version,
            });
          }, 100);
        });
      this.about.listen(({ next }) => {
        if (next?.isAutoUpdate) {
          checkForUpdate();
        }
      });
    }
  }

  setTheme = (theme: EThemeMode) => {
    this.theme.set(theme);
  };

  setLanguage = (language: ELanguage) => {
    this.language.set(language);
  };
  setThemeColorId = (id: string) => {
    console.log('id=>', id);
    this.themeColorId.set(id);
  };

  /**
   * 更新会话设置
   */

  setChatSetting = (setting: Partial<IChatSetting>) => {
    setPartialDataCell(this.chatSetting, setting);
  };

  setAbout = (setting: Partial<IAboutSetting>) => {
    setPartialDataCell(this.about, setting);
  };

  setDefaultMessageModel = (model: IAvailableModel) => {
    this.defaultMessageModel.set(model);
  };

  setDefaultRenameModel = (model: IAvailableModel) => {
    this.defaultRenameModel.set(model);
  };
}
