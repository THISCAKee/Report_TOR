import { describe, expect, it } from "vitest";
import { usernameToAuthEmail } from "@/lib/supabase/auth";

describe("username login", () => {
  it("converts a username into an internal Supabase email", () => {
    expect(usernameToAuthEmail(" EarthCake ")).toBe("earthcake@report-tor.local");
  });

  it("keeps a full email for existing Supabase users", () => {
    expect(usernameToAuthEmail("person@example.com")).toBe("person@example.com");
  });
});
