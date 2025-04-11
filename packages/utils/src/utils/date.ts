export const TODAY_TEXT = '今天';
export const IN_7_TEXT = '7天内';
export const IN_30_DAY_TEXT = '30天内';
export const MORE_EARLY_TEXT = '更早';

export const formatDateGroup = (timestamp: number): string => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((now - timestamp) / oneDay);

  if (diffDays === 0) {
    return TODAY_TEXT;
  } else if (diffDays < 7) {
    return IN_7_TEXT;
  } else if (diffDays < 30) {
    return IN_30_DAY_TEXT;
  } else {
    return MORE_EARLY_TEXT;
  }
};
