const SNAKE_CASE_REGEXP = /[A-Z]/g;
const keyCache = new Map<string, string>();

export const toSnakeCase = (str: string): string => {
  const cached = keyCache.get(str);
  if (cached) return cached;

  const result = str.replace(SNAKE_CASE_REGEXP, (letter, pos) =>
    (pos ? '_' : '') + letter.toLowerCase()
  );
  keyCache.set(str, result);
  return result;
};

export const transformKeysToSnakeCase = (data: Record<string, any>): Record<string, any> => {
  const transformed: Record<string, any> = {};
  for (const key in data) {
    transformed[toSnakeCase(key)] = data[key];
  }
  return transformed;
};

const CAMEL_CASE_CACHE = new Map<string, string>();

export const toCamelCase = (str: string): string => {
  const cached = CAMEL_CASE_CACHE.get(str);
  if (cached) return cached;

  const result = str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  CAMEL_CASE_CACHE.set(str, result);
  return result;
};

export const transformObjectToCamelCase = <T>(row: Record<string, any>): T => {
  const transformed: Record<string, any> = {};
  for (const key in row) {
    transformed[toCamelCase(key)] = row[key];
  }
  return transformed as T;
};

export const transformResultToCamelCase = <T>(rows: any[]): T[] => {
  if (!rows) return [];
  return rows.map(row => {
    const result = transformObjectToCamelCase<T>(row);
    // if (!result) {
    //   throw new Error('Failed to transform row to camel case');
    // }
    return result;
  });
};
