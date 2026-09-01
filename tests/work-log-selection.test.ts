import { describe, expect, it } from "vitest";
import { selectAllLogIds, toggleSelectedLogId } from "@/lib/work-log-selection";

describe("work log checklist selection", () => {
  it("selects and deselects a log when its TOR title is clicked", () => {
    const selected = toggleSelectedLogId(new Set(), "log-1");
    expect([...selected]).toEqual(["log-1"]);
    expect([...toggleSelectedLogId(selected, "log-1")]).toEqual([]);
  });

  it("selects all visible logs and clears the selection", () => {
    expect([...selectAllLogIds(["log-1", "log-2"], true)]).toEqual(["log-1", "log-2"]);
    expect([...selectAllLogIds(["log-1", "log-2"], false)]).toEqual([]);
  });
});
