import {
  BaseProcessor,
  DataCell,
  generatePromiseWrap,
  persistenceCell,
  persistenceCellSync,
} from '@evo/utils';

const SLIDER_VISIBLE_KEY = '__home_slider_visible__';

export class HomeProcessor extends BaseProcessor {
  modelSettingVisible = new DataCell<boolean>(false);

  sliderVisible = persistenceCellSync(SLIDER_VISIBLE_KEY, false);

  drawerVisible = new DataCell<boolean>(false);

  initTask = generatePromiseWrap();

  constructor() {
    super();

    this.init();
  }

  protected async init() {
    try {
      await Promise.all([persistenceCell(SLIDER_VISIBLE_KEY)]);

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
