import dayjs from 'dayjs';

export const formatChatStringTime = (time: Date | string | number | undefined) =>
  time ? dayjs(time).format('MM/DD HH:mm') : '';

export function formatBrackets(text: string) {
  const pattern = /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g;
  return text.replace(pattern, (match, codeBlock, squareBracket, roundBracket) => {
    if (codeBlock) {
      return codeBlock;
    } else if (squareBracket) {
      return `
$$
${squareBracket}
$$
`;
    } else if (roundBracket) {
      return `$${roundBracket}$`;
    }
    return match;
  });
}
