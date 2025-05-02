import { HOME_SLIDER_VISIBLE_KEY } from '@evo/data-store';
import {
  BaseProcessor,
  DataCell,
  generatePromiseWrap,
  persistenceCell,
  persistenceCellSync,
} from '@evo/utils';

export class HomeProcessor extends BaseProcessor {
  modelSettingVisible = new DataCell<boolean>(false);

  sliderVisible = persistenceCellSync(HOME_SLIDER_VISIBLE_KEY, false);

  drawerVisible = new DataCell<boolean>(false);

  initTask = generatePromiseWrap();

  constructor() {
    super();

    this.init();
  }

  protected async init() {
    try {
      await Promise.all([persistenceCell(HOME_SLIDER_VISIBLE_KEY)]);

      this.initTask.resolve(undefined);
    } catch (error) {
      console.error(error);
      this.initTask.reject(error);
    }
  }

  collapseSlider = () => {
    this.sliderVisible.set(!this.sliderVisible.get());
  };

  collapseModelSetting = () => {
    this.modelSettingVisible.set(!this.modelSettingVisible.get());
  };

  collapseDrawer = () => {
    this.drawerVisible.set(!this.drawerVisible.get());
  };

  /**
   * 私有方法外面获取不到
   */
  private handleTest() {}

  public handleTest2 = () => {};
}
