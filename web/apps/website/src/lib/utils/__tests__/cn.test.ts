import { describe, expect, it } from "vitest";
import { cn } from "../cn";

describe("cn", () => {
  it("joins static class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values (conditional classNames)", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });

  it("resolves conflicting Tailwind utilities - last one wins, matching every component's className-override pattern (e.g. Card's interactive + a caller's own className)", () => {
    expect(cn("bg-brand-500", "bg-danger-500")).toBe("bg-danger-500");
  });

  it("does not merge non-conflicting utilities from the same property group incorrectly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});
