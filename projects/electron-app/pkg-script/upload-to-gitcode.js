const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});
// 接收命令行参数
const ACCESS_TOKEN = process.argv[2];
const TAG = process.argv[3];

// 配置变量
const OWNER = process.env.GITCODE_USERNAME;
const REPO = process.env.GITCODE_REPO;
const RELEASE_NAME = TAG;
const DESCRIPTION = `Release ${TAG}`;
const DIST_DIR = process.env.DIST_DIR || 'dist';
const API_BASE =
  process.env.GITCODE_API_URL || `https://api.gitcode.com/api/v5/repos/${OWNER}/${REPO}`;

async function main() {
  try {
    // 查询 Release 是否存在
    console.log(`🔍 查询是否已存在 Release ${TAG} ...`);
    let releaseName;

    try {
      const releaseInfo = await fetch(
        `${API_BASE}/releases/tags/${TAG}?access_token=${ACCESS_TOKEN}`,
        { headers: { 'Content-Type': 'application/json' } }
      ).then((res) => res.json());

      releaseName = releaseInfo.name;
    } catch (error) {
      console.log('查询 Release 失败，将创建新的 Release');
    }

    // 如果不存在，创建 Release
    if (!releaseName) {
      console.log('🚀 未找到 Release，创建中...');
      const createResult = await fetch(`${API_BASE}/releases/${TAG}?access_token=${ACCESS_TOKEN}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: RELEASE_NAME,
          body: DESCRIPTION,
        }),
      }).then((res) => res.json());

      if (!createResult || !createResult.id) {
        throw new Error(`创建 Release 失败: ${JSON.stringify(createResult)}`);
      }

      const releaseId = createResult.id;
      console.log(`✅ 创建完成 Release ID: ${releaseId}`);
    } else {
      console.log(`✅ 已存在 Release ID: ${releaseName}`);
    }

    // 上传文件
    console.log('📦 上传产物...');
    const files = fs.readdirSync(DIST_DIR);

    for (const fileName of files) {
      const filePath = path.join(DIST_DIR, fileName);
      console.log(`🔼 上传: ${fileName}`);

      const formData = new FormData();
      formData.append('attachment', fs.createReadStream(filePath));
      formData.append('name', fileName);

      const response = await fetch(
        `${API_BASE}/releases/${1}/assets?access_token=${ACCESS_TOKEN}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`上传文件失败: ${fileName}, 状态码: ${response.status}`);
      }

      const result = await response.json();
      if (!result || !result.id) {
        throw new Error(`上传文件失败: ${fileName}, 响应: ${JSON.stringify(result)}`);
      }

      console.log(`✅ 上传完成: ${fileName}`);
    }

    console.log('🎉 所有文件上传完成！');
  } catch (error) {
    console.error('❌ 发生错误:', error);
    process.exit(1);
  }
}

main();
