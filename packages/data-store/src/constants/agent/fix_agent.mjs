import fs from 'node:fs';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const generateHashId = (length = 32, prefix = '') => {
  const timeFlag = Date.now().toString(36).slice(0, length);
  const padLen = length - prefix.length - timeFlag.length;
  let hash = '';

  for (let i = 0; i < padLen; i++) {
    hash += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }

  return prefix + timeFlag + hash;
};

(async () => {
  const fileInfo = await import('./agents.json', {
    assert: { type: 'json' },
  }).then((module) => module.default);

  const addedId = fileInfo.map((item) => {
    if (item.id) {
      return item;
    }

    return {
      id: generateHashId(32, 'agent_'),
      ...item,
    };
  });

  fs.writeFileSync('./agents_fixed.json', JSON.stringify(addedId, null, 2));
})();
