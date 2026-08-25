export const MAX_WORD_IMAGE_DIMENSION = 1600;

export function calculateCompressedImageDimensions(originalWidth: number, originalHeight: number, maxDimension = MAX_WORD_IMAGE_DIMENSION) {
  const width = Math.max(1, originalWidth);
  const height = Math.max(1, originalHeight);
  const limit = Math.max(1, maxDimension);
  const scale = Math.min(1, limit / width, limit / height);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
