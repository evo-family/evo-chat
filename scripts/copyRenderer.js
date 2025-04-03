const fs = require('fs-extra');
const path = require('path');

async function copyRenderer() {
  const rendererDir = path.join(process.cwd(), 'projects/electron-app/out/renderer');
  const sourceDir = path.join(process.cwd(), 'projects/web/build');

  try {
    // 删除目标目录
    await fs.remove(rendererDir);
    // 创建目标目录
    await fs.ensureDir(rendererDir);
    // 复制文件
    await fs.copy(sourceDir, rendererDir);
    console.log('✨ Renderer files copied successfully');
  } catch (err) {
    console.error('Error copying renderer files:', err);
    process.exit(1);
  }
}

copyRenderer();