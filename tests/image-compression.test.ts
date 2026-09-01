import { describe, expect, it } from "vitest";
import { calculateCompressedImageDimensions, calculateUploadImageDimensions, getCompressedImageName, shouldUseCompressedImage } from "@/lib/image-compression";

describe("Word image compression", () => {
  it("keeps small images unchanged", () => {
    expect(calculateCompressedImageDimensions(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("scales large images down while preserving their aspect ratio", () => {
    expect(calculateCompressedImageDimensions(4000, 2000)).toEqual({ width: 1600, height: 800 });
  });

  it("handles portrait images without exceeding the maximum dimension", () => {
    expect(calculateCompressedImageDimensions(1000, 3000)).toEqual({ width: 533, height: 1600 });
  });

  it("limits uploaded evidence images to 1280 pixels", () => {
    expect(calculateUploadImageDimensions(4032, 3024)).toEqual({ width: 1280, height: 960 });
  });

  it("uses compressed images only when they save storage space", () => {
    expect(shouldUseCompressedImage(2_000_000, 350_000)).toBe(true);
    expect(shouldUseCompressedImage(200_000, 240_000)).toBe(false);
  });

  it("renames compressed images with a webp extension", () => {
    expect(getCompressedImageName("evidence.photo.jpg")).toBe("evidence.photo.webp");
  });
});
