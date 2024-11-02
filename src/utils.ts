
export function isEmpty(data: any) {
  if (Array.isArray(data)) {
    return !data.length;
  }

  return !data;
}