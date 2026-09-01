export const MAX_WORD_IMAGE_DIMENSION = 1600;
export const MAX_UPLOAD_IMAGE_DIMENSION = 1280;
export const UPLOAD_IMAGE_QUALITY = 0.68;

export function calculateCompressedImageDimensions(originalWidth: number, originalHeight: number, maxDimension = MAX_WORD_IMAGE_DIMENSION) {
  const width = Math.max(1, originalWidth);
  const height = Math.max(1, originalHeight);
  const limit = Math.max(1, maxDimension);
  const scale = Math.min(1, limit / width, limit / height);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export function calculateUploadImageDimensions(originalWidth: number, originalHeight: number) {
  return calculateCompressedImageDimensions(originalWidth, originalHeight, MAX_UPLOAD_IMAGE_DIMENSION);
}

export function shouldUseCompressedImage(originalSize: number, compressedSize: number) {
  return compressedSize > 0 && compressedSize < originalSize;
}

export function getCompressedImageName(name: string) {
  const extensionIndex = name.lastIndexOf(".");
  return `${extensionIndex > 0 ? name.slice(0, extensionIndex) : name}.webp`;
}

function loadImage(file: File): Promise<{ image: HTMLImageElement; objectUrl: string }> {
  const objectUrl = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ image, objectUrl });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`อ่านรูปภาพ ${file.name} ไม่สำเร็จ`));
    };
    image.src = objectUrl;
  });
}

export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") return file;

  let objectUrl = "";
  try {
    const loaded = await loadImage(file);
    objectUrl = loaded.objectUrl;
    const dimensions = calculateUploadImageDimensions(loaded.image.naturalWidth, loaded.image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(loaded.image, 0, 0, dimensions.width, dimensions.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", UPLOAD_IMAGE_QUALITY));
    if (!blob || !shouldUseCompressedImage(file.size, blob.size)) return file;
    return new File([blob], getCompressedImageName(file.name), { type: "image/webp", lastModified: file.lastModified });
  } catch {
    return file;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
