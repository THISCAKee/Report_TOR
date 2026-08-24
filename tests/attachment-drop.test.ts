import { describe, expect, it } from "vitest";
import { selectDroppedImages } from "@/lib/attachment-drop";

describe("selectDroppedImages", () => {
  it("keeps only image files from a mixed drop in their original order", () => {
    const firstImage = new File(["first"], "first.png", { type: "image/png" });
    const document = new File(["document"], "report.pdf", { type: "application/pdf" });
    const secondImage = new File(["second"], "second.jpg", { type: "image/jpeg" });

    expect(selectDroppedImages([firstImage, document, secondImage])).toEqual([
      firstImage,
      secondImage,
    ]);
  });
});
