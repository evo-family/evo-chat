import path from 'path';

const PROJECT_PATH_REG = /.+evo(_|-)chat*(\/|\\)packages(\/|\\)[^/\\]+/;

const CSS_SRC_PATH_REG = /(['"]@\/{1}.*?\1)/g;

class SourceCodePathReplace {
  name = 'SourceCodePathReplace';
  setup(api) {
    // 对直连monorepo包内源码的'@/'路径进行替换为project的绝对路径，达到能直接调试源码的效果。
    api.resolve((context) => {
      const { resolveData } = context;

      if (resolveData.request.startsWith('@/')) {
        const matchResult = resolveData.context.match(PROJECT_PATH_REG);

        if (matchResult) {
          const replacePath = path.join(matchResult[0], 'src', resolveData.request.slice(1));

          context.resolveData.request = replacePath;
        }
      }
    });

    // less和scss部分
    api.transform({ test: /.(less|scss)$/ }, (params) => {
      const { code, resourcePath } = params;

      const matchResult = resourcePath.match(PROJECT_PATH_REG);

      if (matchResult) {
        return code.replaceAll(CSS_SRC_PATH_REG, (match) => {
          const replaceContent = match.slice(0, 1) + path.join(matchResult[0], 'src') + '/';

          return replaceContent;
        });
      }
    });
  }
}

export const pluginConnectSourceCode = () => {
  return new SourceCodePathReplace();
};
