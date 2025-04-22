const path = require('path');
const fs = require('fs');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const { notarize } = require('@electron/notarize');

const APP_BUNDLE_ID = 'com.hevo.evochat';

async function checkNotarizeRequirements() {
  const requiredEnvVars = ['APPLE_ID', 'APPLE_APP_SPECIFIC_PASSWORD', 'APPLE_TEAM_ID'];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.log('Skipping notarization. Missing environment variables:', missingVars.join(', '));
    return false;
  }
  return true;
}

exports.default = async function notarizing(context) {
  if (context.electronPlatformName !== 'darwin') {
    return;
  }

  if (!(await checkNotarizeRequirements())) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${context.appOutDir}/${appName}.app`;

  console.log('开始公证流程...');
  console.log('应用路径:', appPath);

  if (!fs.existsSync(appPath)) {
    console.error('错误: 应用路径不存在:', appPath);
  }

  try {
    await notarize({
      appPath,
      appBundleId: APP_BUNDLE_ID,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
      logVerbose: true, // ✅ 开启详细日志
    });
    console.log('公证完成:', appPath);
  } catch (error) {
    console.error('公证失败:', error);
    throw error;
  }
};
