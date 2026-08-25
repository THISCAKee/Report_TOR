import { describe, expect, it } from "vitest";
import { getVisibleItems } from "@/lib/list-display";

describe("getVisibleItems", () => {
  it("limits collapsed lists to the first three items", () => {
    expect(getVisibleItems(["one", "two", "three", "four"], false)).toEqual(["one", "two", "three"]);
  });

  it("returns every item when the list is expanded", () => {
    expect(getVisibleItems(["one", "two", "three", "four"], true)).toEqual(["one", "two", "three", "four"]);
  });

  it("keeps short lists unchanged", () => {
    expect(getVisibleItems(["one", "two"], false)).toEqual(["one", "two"]);
  });
});
