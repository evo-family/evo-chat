
export const deepMergeObject = <T extends object>(target: T, source: Partial<T>): T => {
  const result = { ...target };

  Object.keys(source).forEach(key => {
    const sourceValue = source[key as keyof T];
    const targetValue = target[key as keyof T];

    if (sourceValue === undefined) {
      return;
    }

    // 如果是数组或类型不一致，直接覆盖
    if (Array.isArray(sourceValue) ||
      Array.isArray(targetValue) ||
      typeof sourceValue !== typeof targetValue) {
      (result as any)[key] = sourceValue;
      return;
    }

    // 如果都是对象，递归合并
    if (typeof sourceValue === 'object' && sourceValue !== null &&
      typeof targetValue === 'object' && targetValue !== null) {
      (result as any)[key] = deepMergeObject(targetValue, sourceValue);
      return;
    }

    // 其他情况直接覆盖
    (result as any)[key] = sourceValue;
  });

  return result;
};
