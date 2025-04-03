const fs = require('fs');
const path = require('path');
const https = require('https');

// 读取 icon.tsx 文件
const iconFilePath = path.join(__dirname, '../packages/b-component/src/icon/icon.tsx');
const iconDir = path.dirname(iconFilePath);
const content = fs.readFileSync(iconFilePath, 'utf-8');

// 提取 scriptUrl
const scriptUrlMatch = content.match(/scriptUrl:\s*['"](.+?)['"]/);
if (!scriptUrlMatch) {
  console.error('找不到 scriptUrl');
  process.exit(1);
}

let scriptUrl = scriptUrlMatch[1];
if (scriptUrl.startsWith('//')) {
  scriptUrl = 'https:' + scriptUrl;
}

// 下载文件
const outputPath = path.join(iconDir, 'evo-font.js');

console.log('开始下载:', scriptUrl);
console.log('保存到:', outputPath);

https.get(scriptUrl, (response) => {
  const fileStream = fs.createWriteStream(outputPath);
  response.pipe(fileStream);

  fileStream.on('finish', () => {
    console.log('下载完成！');
    fileStream.close();
  });
}).on('error', (err) => {
  console.error('下载失败:', err.message);
  fs.unlinkSync(outputPath);
});