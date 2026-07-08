import { describe, expect, it } from "vitest";
import { createBookingSchema } from "../booking";

const validPayload = {
  tutorId: "123e4567-e89b-12d3-a456-426614174000",
  subject: "Algebra",
  startTime: "2026-01-15T09:00:00.000Z",
  endTime: "2026-01-15T10:00:00.000Z",
  mode: "ONLINE" as const,
};

describe("createBookingSchema", () => {
  it("accepts a valid payload without studentProfileId (student booking for self)", () => {
    expect(createBookingSchema.safeParse(validPayload).success).toBe(true);
  });

  it("accepts studentProfileId when present (parent booking on behalf of a child)", () => {
    const result = createBookingSchema.safeParse({
      ...validPayload,
      studentProfileId: "223e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a datetime-local value with no timezone offset - this is exactly the bug BookingRequestForm.tsx works around by not validating the raw <input type=datetime-local> value against this schema", () => {
    const result = createBookingSchema.safeParse({ ...validPayload, startTime: "2026-01-15T09:00" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-UUID tutorId", () => {
    const result = createBookingSchema.safeParse({ ...validPayload, tutorId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects a mode outside ONLINE/OFFLINE", () => {
    const result = createBookingSchema.safeParse({ ...validPayload, mode: "HYBRID" });
    expect(result.success).toBe(false);
  });
});
