const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 执行命令并返回输出
function exec(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

// 获取命令行参数
const args = process.argv.slice(2);
const versionType = args[0] || 'patch';
const shouldPush = args.includes('push');

// 验证版本类型
if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('Invalid version type. Use patch, minor, or major.');
  process.exit(1);
}

// 获取所有workspace包
const packages = JSON.parse(exec('pnpm ls -r --json'));

// 为每个包更新版本
packages.forEach((pkg) => {
  const pkgPath = path.join(pkg.path, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  // 跳过private包
  if (pkgJson.private) return;

  console.log(`Updating ${pkg.name} from ${pkgJson.version} to ${versionType} version`);
  try {
    exec(`cd ${pkg.path} && pnpm version ${versionType} --no-git-tag-version`);
  } catch (error) {
    console.error(`Failed to update ${pkg.name}: ${error.message}`);
    process.exit(1);
  }
});

// 现在再读取根package.json获取新版本号
const rootPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const newVersion = rootPackageJson.version;

// Git操作
exec('git add .');
exec(`git commit -m "chore(release): bump all packages to ${newVersion}"`);
exec(`git tag -a v${newVersion} -m "Version ${newVersion}"`);

console.log(`All packages bumped to ${newVersion}`);

if (shouldPush) {
  console.log('Pushing to remote...');
  exec('git push && git push --tags');
  console.log('Pushed to remote.');
} else {
  console.log(
    'Changes are committed locally. Use "git push && git push --tags" to push to remote.'
  );
}
