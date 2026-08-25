import { describe, expect, it } from "vitest";
import { calculateCompressedImageDimensions } from "@/lib/image-compression";

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
});
