// replaceSpaces.js

const fs = require('fs');
const path = require('path');

const directory = 'projects/electron-app/dist';

// 处理文件名中的空格
function replaceFileNames() {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      const oldPath = path.join(directory, file);
      const newPath = path.join(directory, file.replace(/ /g, '-'));

      fs.stat(oldPath, (err, stats) => {
        if (err) throw err;

        if (stats.isFile() && oldPath !== newPath) {
          fs.rename(oldPath, newPath, (err) => {
            if (err) throw err;
            console.log(`Renamed: ${oldPath} -> ${newPath}`);
          });
        }
      });
    });
  });
}

function replaceYmlContent() {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      if (path.extname(file).toLowerCase() === '.yml') {
        const filePath = path.join(directory, file);

        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) throw err;

          // 替换内容
          const newContent = data.replace(/Evo Chat-/g, 'Evo-Chat-');

          // 写回文件
          fs.writeFile(filePath, newContent, 'utf8', (err) => {
            if (err) throw err;
            console.log(`Updated content in: ${filePath}`);
          });
        });
      }
    });
  });
}

replaceFileNames();
replaceYmlContent();
