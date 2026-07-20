export function csdnPostStem(title, id) {
  const normalizedTitle = title
    .normalize("NFKC")
    .replace(/[\u2018\u2019']/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (!normalizedTitle) {
    throw new Error(`Cannot derive a filename from CSDN title: ${title}`);
  }
  if (!/^\d+$/.test(String(id))) {
    throw new Error(`Invalid CSDN article ID: ${id}`);
  }

  return `${normalizedTitle}-${id}`;
}
