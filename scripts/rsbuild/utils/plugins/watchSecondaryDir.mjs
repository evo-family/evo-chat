import chokidar from 'chokidar';

const DEFAULT_OPTIONS = {
  projectRoot: '',
  handler: () => {},
};

class WatchDir {
  name = 'WatchDir';
  watcher = undefined;

  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.projectRoot = options.projectRoot;
  }

  setup(api) {
    api.onAfterStartDevServer(() => {
      const watchPath = `${this.projectRoot}/packages/utils/src`;

      this.destroy();

      this.watcher = chokidar.watch(watchPath, {
        depth: 0, // 只监听指定目录层级
        ignored: /(^|[\/\\])\../, // 忽略隐藏文件
        persistent: true,
        ignoreInitial: true, // 首次启动时也触发事件
        ignorePermissionErrors: true,
      });

      const addListen = (actionType) => {
        // 只监听目录相关事件
        this.watcher?.on(actionType, (path) => {
          // 过滤掉 src 目录本身
          if (path.endsWith('/src')) return;

          this.options?.handler({ actionType, path });
        });
      };

      addListen('addDir');
      addListen('unlinkDir');
    });

    api.onExit(this.destroy);
    process.on('exit', this.destroy);
  }

  destroy = () => {
    this.watcher?.close();
  };
}

export const pluginWatchSecondaryDir = (options = {}) => {
  return new WatchDir(options);
};
