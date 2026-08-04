import { describe, expect, it } from "vitest";

import { createGame, supplyCount, unitCount } from "./engine";

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
