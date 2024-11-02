
export function isEmpty(data) {
  if (Array.isArray(data)) {
    return !data.length;
  }

  return !data;
}