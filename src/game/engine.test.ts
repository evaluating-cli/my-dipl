import { describe, expect, it } from "vitest";

import {
  createGame,
  normalizeMovementOrders,
  resolveMovement,
  supplyCount,
  unitCount,
  validateAdjustmentPlan,
  validateMovementOrder,
} from "./engine";

describe("createGame", () => {
  it("starts Russia with balanced units and supply centres", () => {
    const game = createGame("RUS");
    const russianUnits = unitCount(game).RUS;
    const russianCenters = supplyCount(game).RUS;

    expect(russianUnits).toBe(4);
    expect(russianCenters).toBe(4);
    expect(russianCenters - russianUnits).toBe(0);
  });
});

describe("movement validation", () => {
  it("reports malformed moves and supports", () => {
    const game = createGame("ENG");
    const london = game.units.find((unit) => unit.loc === "LON")!;

    expect(validateMovementOrder(game, london, { type: "move", to: "MOS" }).errors[0]).toMatchObject({
      code: "ILLEGAL_DESTINATION", loc: "MOS", unitId: london.id,
    });
    expect(validateMovementOrder(game, london, { type: "support", supLoc: "WAL" }).errors[0]).toMatchObject({
      code: "NO_UNIT_TO_SUPPORT", loc: "WAL",
    });
  });

  it("normalizes missing and invalid orders to holds before adjudication", () => {
    const game = createGame("ENG");
    const london = game.units.find((unit) => unit.loc === "LON")!;
    const normalized = normalizeMovementOrders(game, { [london.id]: { type: "move", to: "MOS" } });

    expect(normalized[london.id]).toEqual({ type: "hold" });
    expect(resolveMovement(game, { [london.id]: { type: "move", to: "MOS" } }).units).toEqual(game.units);
  });
});

describe("adjustment validation", () => {
  it("returns structured errors for excessive and malformed builds", () => {
    const game = createGame("ENG");
    game.centers.BEL = "ENG";
    const result = validateAdjustmentPlan(game, "ENG", {
      builds: [
        { power: "ENG", type: "F", loc: "LON" },
        { power: "ENG", type: "X" as never, loc: "PAR" },
      ],
      disbands: [],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toEqual(expect.arrayContaining([
      "TOO_MANY_BUILDS", "OCCUPIED_CENTER", "INELIGIBLE_HOME_CENTER", "INVALID_UNIT_TYPE",
    ]));
  });

  it("rejects disbands of another power's unit", () => {
    const game = createGame("ENG");
    delete game.centers.LON;
    const french = game.units.find((unit) => unit.power === "FRA")!;
    const result = validateAdjustmentPlan(game, "ENG", { builds: [], disbands: [french.id] });

    expect(result.errors).toContainEqual(expect.objectContaining({ code: "WRONG_POWER", unitId: french.id }));
  });
});
