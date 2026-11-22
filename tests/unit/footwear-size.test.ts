import { describe, expect, it } from "vitest";
import { lookupFootwearSize } from "../../src/features/sizing/footwear-size";

describe("footwear sizing by product and foot length", () => {
  it("accepts Indonesian decimal input and matches the exact heel-to-toe row", () => {
    expect(lookupFootwearSize("ID8812", " 25,9 ")).toEqual({
      kind: "match", lengthMm: 259, sizes: [[259, "42", 8]],
    });
  });

  it("shows both surrounding sizes for a measurement between rows", () => {
    expect(lookupFootwearSize("ID8812", "26.1")).toEqual({
      kind: "match", lengthMm: 261, sizes: [[259, "42", 8], [263, "42 2/3", 8.5]],
    });
  });

  it("uses only the documented range, including its endpoints", () => {
    expect(lookupFootwearSize("ID8812", "22.1")).toMatchObject({ sizes: [[221, "36", 3.5]] });
    expect(lookupFootwearSize("ID8812", "35.2")).toMatchObject({ sizes: [[352, "55 2/3", 19]] });
    for (const input of ["22.0", "35.3", "90"]) {
      expect(lookupFootwearSize("ID8812", input)).toEqual({ kind: "outside", minMm: 221, maxMm: 352 });
    }
  });

  it.each(["", "0", "25cm", "25,95", "2.5e1", "-25", "25.9.0"])("rejects malformed or nonpositive input %j", input => {
    expect(lookupFootwearSize("ID8812", input)).toEqual({ kind: "invalid" });
  });

  it.each(["F32290", "unknown"])("makes no prediction without a chart for %j", sku => {
    expect(lookupFootwearSize(sku, "25,9")).toEqual({ kind: "unavailable" });
  });
});
