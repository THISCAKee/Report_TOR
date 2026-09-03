import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkspaceGrid } from "@/components/WorkspaceGrid";

describe("workspace grid", () => {
  it("places the workload form, calendar, and daily logs from left to right", () => {
    const html = renderToStaticMarkup(<WorkspaceGrid left={<span>ฟอร์มงาน</span>} middle={<span>ปฏิทิน</span>} right={<span>รายการงาน</span>} />);

    expect(html).toContain('data-workspace-grid="true"');
    expect(html).toContain("lg:grid-cols-[minmax(16rem,.7fr)_minmax(18rem,1.5fr)_minmax(18rem,.85fr)]");
    expect(html.indexOf("ฟอร์มงาน")).toBeLessThan(html.indexOf("ปฏิทิน"));
    expect(html.indexOf("ปฏิทิน")).toBeLessThan(html.indexOf("รายการงาน"));
  });
});
