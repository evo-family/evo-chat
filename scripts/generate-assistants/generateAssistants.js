const fs = require('fs');
const path = require('path');

// otherAgent 来源 https://github.com/lobehub/lobe-chat-agents/tree/main
const otherAgentDir = path.join(__dirname, '../..//resources/data/otherAgent');
const targetFile = path.join(__dirname, '../../projects/web/resources/data/agents.json');
const targetH5File = path.join(__dirname, '../../projects/h5/resources/data/agents.json');

// 读取并合并所有符合条件的文件
function mergeAgentFiles() {
  const allAgents = [];
  
  // 读取目录下的所有文件
  const files = fs.readdirSync(otherAgentDir);
  
  // 过滤出符合条件的文件
  const zhFiles = files.filter(file => file.endsWith('.zh-CN.json'));
  
  // 读取每个文件的内容并合并
  zhFiles.forEach(file => {
    const filePath = path.join(otherAgentDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    try {
      const agents = JSON.parse(content);
        allAgents.push(agents);
    } catch (err) {
      console.error(`Error parsing file ${file}:`, err);
    }
  });
  
  // 写入目标文件
  fs.writeFileSync(targetFile, JSON.stringify(allAgents, null, 2), 'utf8');
  fs.writeFileSync(targetH5File, JSON.stringify(allAgents, null, 2), 'utf8');
  
  console.log(`Successfully merged ${allAgents.length} agents into agents.json`);
}

mergeAgentFiles();