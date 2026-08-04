import { describe, expect, it } from "vitest";
import { COAST_LOCATIONS, PROVINCES, provinceId, type UnitType } from "../data/map";
import { legalTargets } from "./engine";

const targets = (type: UnitType, loc: string) =>
  legalTargets({ id: "test", power: "FRA", type, loc }).sort();

const expectTargets = (type: UnitType, loc: string, expected: string[]) =>
  expect(targets(type, loc)).toEqual([...expected].sort());

describe("classic-board topology", () => {
  it("never permits a unit to enter impassable Switzerland", () => {
    for (const province of PROVINCES) {
      expect(targets("A", province.id)).not.toContain("SWI");
      expect(targets("F", province.id)).not.toContain("SWI");
    }
    expectTargets("A", "SWI", []);
  });

  it("models Armenia as coastal without inventing a Smyrna fleet border", () => {
    expectTargets("A", "ARM", ["ANK", "SMY", "SEV", "SYR"]);
    expectTargets("F", "ARM", ["ANK", "SEV", "BLA"]);
  });

  it("uses separate Spanish fleet locations with one province identity", () => {
    expectTargets("F", "SPA/NC", ["MAO", "POR", "GAS"]);
    expectTargets("F", "SPA/SC", ["MAO", "POR", "WES", "GOL", "MAR"]);
    expect(provinceId("SPA/NC")).toBe("SPA");
  });

  it("uses separate St. Petersburg fleet locations", () => {
    expectTargets("F", "STP/NC", ["BAR", "NOR"]);
    expectTargets("F", "STP/SC", ["BOT", "FIN", "LIV"]);
  });

  it("uses separate Bulgarian fleet locations", () => {
    expectTargets("F", "BUL/EC", ["BLA", "RUM", "CON"]);
    expectTargets("F", "BUL/SC", ["AEG", "GRE", "CON"]);
  });

  it("enumerates the North Sea's standard fleet destinations only", () => {
    expectTargets("F", "NTH", ["EDI", "YOR", "LON", "BEL", "HOL", "HEL", "DEN", "NOR", "NWG", "SKG", "ENC"]);
  });

  it("declares exactly the six named coast locations", () => {
    expect(COAST_LOCATIONS.map(({ id }) => id).sort()).toEqual(
      ["SPA/NC", "SPA/SC", "STP/NC", "STP/SC", "BUL/EC", "BUL/SC"].sort(),
    );
  });
});
