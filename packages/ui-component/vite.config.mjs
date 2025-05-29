import baseViteConfig from '@evo-tools/compile/config/vite.config.base';
import { defineConfig, mergeConfig } from 'vite';

export default defineConfig((configEnv) => {
  /* override base vite config */
  const customConfig = {};

  return mergeConfig(
    baseViteConfig({
      pkgRoot: __dirname,
      configEnv,
    }),
    customConfig
  );
});
