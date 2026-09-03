import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppFrame } from "@/components/AppFrame";

describe("app frame", () => {
  it("uses the full available viewport width", () => {
    const html = renderToStaticMarkup(<AppFrame><span>เนื้อหา</span></AppFrame>);

    expect(html).toContain('data-app-frame="true"');
    expect(html).toContain("w-full");
    expect(html).toContain("max-w-none");
    expect(html).not.toContain("max-w-7xl");
  });
});
