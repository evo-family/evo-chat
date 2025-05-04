const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// 配置参数
const REPO_OWNER = 'evo-family'; // 替换为仓库所有者
const REPO_NAME = 'evo-chat'; // 替换为仓库名称
const RELEASE_TAG = 'latest'; // 或指定版本号如 'v1.0.0'
const OUTPUT_DIR = './downloads'; // 下载文件保存目录

// 创建输出目录
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 获取Release信息
function getReleaseInfo(owner, repo, tag) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/releases/${tag}`,
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json',
      },
    };

    https
      .get(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Failed to fetch release: ${res.statusCode} ${data}`));
          }
        });
      })
      .on('error', reject);
  });
}

// 下载文件（带进度监控）
// 下载文件（带认证和重定向处理）
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    let redirectUrl = `https://download-cf.ocoolai.com/${url}`;

    const download = (downloadUrl) => {
      https
        .get(downloadUrl, (res) => {
          // 处理重定向
          if ([301, 302, 303].includes(res.statusCode)) {
            redirectUrl = res.headers.location;
            return download(redirectUrl);
          }

          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}`));
          }

          const totalBytes = parseInt(res.headers['content-length'], 10) || 0;
          let receivedBytes = 0;

          res.on('data', (chunk) => {
            receivedBytes += chunk.length;
            const progress =
              totalBytes > 0 ? Math.floor((receivedBytes / totalBytes) * 100) : receivedBytes;
            process.stdout.write(`\r下载中: ${progress}${totalBytes > 0 ? '%' : ' bytes'}`);
          });

          res.pipe(file);

          file.on('finish', () => {
            file.close(() => {
              console.log('\n下载完成');
              resolve();
            });
          });
        })
        .on('error', reject);
    };

    download(redirectUrl);
  });
}

// 下载文件（带重试机制）
async function downloadFileWithRetry(url, filePath, retries = 3) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      await downloadFile(url, filePath);
      return; // 成功则返回
    } catch (error) {
      lastError = error;
      console.log(`下载失败，第${i + 1}次重试... (${error.message})`);
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1))); // 指数退避
    }
  }

  throw lastError; // 所有重试都失败后抛出错误
}

// 主函数
async function main() {
  try {
    // 清空下载目录
    if (fs.existsSync(OUTPUT_DIR)) {
      fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log(`Fetching release info for ${REPO_OWNER}/${REPO_NAME}...`);
    const release = await getReleaseInfo(REPO_OWNER, REPO_NAME, RELEASE_TAG);

    console.log(`Found release: ${release.name}`);
    console.log(`Downloading ${release.assets.length} assets...`);

    // 并发下载所有资源
    await Promise.all(
      release.assets.map(async (asset) => {
        const outputPath = path.join(OUTPUT_DIR, asset.name);
        console.log(`Downloading ${asset.name} (${Math.round(asset.size / 1024 / 1024)}MB)...`);

        try {
          await downloadFileWithRetry(asset.browser_download_url, outputPath);
          console.log(`✓ 下载完成: ${outputPath}`);
        } catch (error) {
          console.error(`✗ 下载失败: ${asset.name} (${error.message})`);
        }
      })
    );

    console.log('所有下载任务完成！');
  } catch (error) {
    console.error('发生错误:', error.message);
    process.exit(1);
  }
}

main();
