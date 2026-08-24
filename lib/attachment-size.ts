export const MAX_ATTACHMENT_BYTES = 100 * 1024 * 1024;

export function canAddAttachments(existingSizes: number[], pickedSizes: number[]): boolean {
  const totalBytes = [...existingSizes, ...pickedSizes].reduce((sum, size) => sum + size, 0);
  return totalBytes <= MAX_ATTACHMENT_BYTES;
}
