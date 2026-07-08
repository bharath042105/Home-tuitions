import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "../auth";

describe("loginSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "hunter2" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "hunter2" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("rejects a password shorter than 8 characters (matches backend @Size(min=8))", () => {
    const result = registerSchema.safeParse({ email: "a@b.com", password: "short", role: "STUDENT" });
    expect(result.success).toBe(false);
  });

  it("rejects a role outside STUDENT/PARENT/TUTOR (ADMIN self-registration is not allowed)", () => {
    const result = registerSchema.safeParse({ email: "a@b.com", password: "longenough", role: "ADMIN" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({ email: "a@b.com", password: "longenough", role: "TUTOR" });
    expect(result.success).toBe(true);
  });
});
