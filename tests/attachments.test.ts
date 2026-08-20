import { describe, expect, it } from "vitest";
import { removeAttachmentGroup } from "@/lib/format";
import type { Attachment } from "@/lib/types";

const file = (id: string, name: string, size: number): Attachment => ({
  id,
  name,
  size,
  type: "image/jpeg",
  dataUrl: `data:image/jpeg;base64,${id}`,
});

describe("removeAttachmentGroup", () => {
  it("removes every duplicate attachment with the same name and size", () => {
    const first = file("first", "IMG_7905.jpeg", 4100000);
    const duplicate = file("duplicate", "IMG_7905.jpeg", 4100000);
    const different = file("different", "IMG_7905.jpeg", 819400);

    expect(removeAttachmentGroup([first, duplicate, different], first)).toEqual([different]);
  });
});
