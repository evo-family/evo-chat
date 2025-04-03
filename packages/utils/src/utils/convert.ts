
/**
 *
 * @param array
 * @param key
 * @returns
 */
export const arrayToMap = <T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T> => {
  return array.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {} as Record<string, T>);
};
