
export function isEmpty(data: unknown) {
  if (Array.isArray(data)) {
    return !data.length;
  }

  return !data;
}